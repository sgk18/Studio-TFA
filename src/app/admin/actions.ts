"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { Database, Json } from "@/lib/supabase/types";
import { toSlug } from "@/lib/catalogFilters";
import { requireAdminAccess } from "@/lib/security/adminRole";

const PRODUCT_IMAGE_BUCKETS = [
  "product-images",
  "products",
  "catalog",
] as const;
const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;

const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ])
);

const productMutationSchema = z.object({
  title: z.string().trim().min(2).max(140),
  category: z.string().trim().min(2).max(80),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  description: z.string().trim().min(10).max(5000),
  image_url: z.string().trim().url().nullable(),
  is_active: z.boolean(),
  is_customisable: z.boolean().default(false),
  customisable_fields: jsonSchema.nullable().default(null),
  surcharge_amount: z.coerce.number().min(0).default(0),
  is_custom_order: z.boolean().default(false),
  metadata: z.record(z.string(), jsonSchema).default({}),
});

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export async function createProduct(data: any) {
  const { supabase } = await requireAdminAccess({ from: "/admin/products" });

  const normalized = normalizeLegacyProductMutation(data);
  const parsed = productMutationSchema.safeParse(normalized);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid product payload.");
  }

  const { error } = await supabase
    .from("products")
    .insert(toProductInsert(parsed.data));

  if (error) {
    throw new Error(error.message);
  }

  revalidateStorefrontAndAdmin();
}

export async function updateProduct(id: string, data: any) {
  const { supabase } = await requireAdminAccess({ from: "/admin/products" });

  const normalized = normalizeLegacyProductMutation(data);
  const parsed = productMutationSchema.safeParse(normalized);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid product payload.");
  }

  const { error } = await supabase
    .from("products")
    .update(toProductUpdate(parsed.data))
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateStorefrontAndAdmin();
  revalidatePath("/product/[id]", "page");
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireAdminAccess({ from: "/admin/products" });

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateStorefrontAndAdmin();
}

export async function createProductWithImageUpload(formData: FormData) {
  const { supabase } = await requireAdminAccess({ from: "/admin/products" });

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const stock = Number(formData.get("stock") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "true") !== "false";
  const isCustomisable = String(formData.get("isCustomisable") ?? "false") === "true";
  const customisableFieldsRaw = formData.get("customisableFields");
  const customisableFields = customisableFieldsRaw ? JSON.parse(String(customisableFieldsRaw)) : null;
  const surchargeAmount = Number(formData.get("surchargeAmount") ?? 0);
  const isCustomOrder = String(formData.get("isCustomOrder") ?? "false") === "true";

  const imageFile = formData.get("imageFile");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "Please upload a product image." };
  }

  if (!imageFile.type.startsWith("image/")) {
    return { error: "Only image files are supported." };
  }

  if (imageFile.size > MAX_PRODUCT_IMAGE_BYTES) {
    return { error: "Image must be 8MB or less." };
  }

  const parsed = productMutationSchema.safeParse({
    title,
    category,
    price,
    stock,
    description,
    image_url: null,
    is_active: isActive,
    is_customisable: isCustomisable,
    customisable_fields: customisableFields,
    surcharge_amount: surchargeAmount,
    is_custom_order: isCustomOrder,
    metadata: {},
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Invalid product details.",
    };
  }

  const uploadResult = await uploadProductImage(supabase, {
    title,
    imageFile,
  });

  if ("error" in uploadResult) {
    return { error: uploadResult.error };
  }

  const productToInsert = toProductInsert({
    ...parsed.data,
    image_url: uploadResult.publicUrl,
  });

  const { error } = await supabase.from("products").insert(productToInsert);

  if (error) {
    return { error: error.message };
  }

  revalidateStorefrontAndAdmin();
  return { success: true };
}

export async function promoteUserToAdmin(userId: string) {
  const parsedUserId = z.string().trim().min(1).max(128).safeParse(userId);
  if (!parsedUserId.success) {
    return { error: "Invalid user identifier." };
  }

  const { supabase } = await requireAdminAccess({ from: "/admin/users" });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", parsedUserId.data)
    .maybeSingle();

  if (profileError) {
    return { error: profileError.message };
  }

  if (!profile) {
    return { error: "User profile not found." };
  }

  if (profile.role === "admin") {
    return { success: true, message: "User is already an admin." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", parsedUserId.data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true, message: "User promoted to admin." };
}

export async function revokeUserAdminAccess(userId: string) {
  const parsedUserId = z.string().trim().min(1).max(128).safeParse(userId);
  if (!parsedUserId.success) {
    return { error: "Invalid user identifier." };
  }

  const { supabase, userId: actingAdminId } = await requireAdminAccess({ from: "/admin/users" });

  if (parsedUserId.data === actingAdminId) {
    return { error: "You cannot revoke your own admin access." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", parsedUserId.data)
    .maybeSingle();

  if (profileError) {
    return { error: profileError.message };
  }

  if (!profile) {
    return { error: "User profile not found." };
  }

  if (profile.role !== "admin") {
    return { success: true, message: "User is not an admin." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "customer" })
    .eq("id", parsedUserId.data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true, message: "Admin access revoked." };
}

function toProductInsert(
  input: z.infer<typeof productMutationSchema>
): ProductInsert {
  const slugBase = toSlug(input.title);
  const suffix = Math.random().toString(36).slice(2, 7);

  return {
    title: input.title,
    slug: `${slugBase || "product"}-${suffix}`,
    description: input.description,
    category: input.category,
    image_url: input.image_url,
    price: input.price,
    stock: input.stock,
    is_active: input.is_active,
    is_customisable: input.is_customisable,
    customisable_fields: input.customisable_fields,
    surcharge_amount: input.surcharge_amount,
    is_custom_order: input.is_custom_order,
    metadata: input.metadata,
  };
}

function toProductUpdate(
  input: z.infer<typeof productMutationSchema>
): ProductUpdate {
  return {
    title: input.title,
    description: input.description,
    category: input.category,
    image_url: input.image_url,
    price: input.price,
    stock: input.stock,
    is_active: input.is_active,
    is_customisable: input.is_customisable,
    customisable_fields: input.customisable_fields,
    surcharge_amount: input.surcharge_amount,
    is_custom_order: input.is_custom_order,
    metadata: input.metadata,
  };
}

function normalizeLegacyProductMutation(data: any) {
  const stockValue =
    data?.stock ?? data?.stock_count ?? data?.stockCount ?? data?.inventory ?? 0;
  const descriptionValue =
    data?.description ?? data?.story ?? data?.inspiration ?? "Product description pending.";
  const metadata = {
    is_custom_order: Boolean(data?.is_custom_order),
  };

  return {
    title: data?.title,
    category: data?.category,
    price: data?.price,
    stock: stockValue,
    description: descriptionValue,
    image_url:
      typeof data?.image_url === "string" && data.image_url.trim().length > 0
        ? data.image_url.trim()
        : null,
    is_active: data?.is_active ?? true,
    is_customisable: Boolean(data?.is_customisable),
    customisable_fields: data?.customisable_fields ?? null,
    surcharge_amount: Number(data?.surcharge_amount ?? 0),
    is_custom_order: Boolean(data?.is_custom_order),
    metadata,
  };
}

async function uploadProductImage(
  supabase: Awaited<ReturnType<typeof requireAdminAccess>>["supabase"],
  options: { title: string; imageFile: File }
): Promise<{ publicUrl: string } | { error: string }> {
  const fileExtension = extensionForFile(options.imageFile);
  const baseName = toSlug(options.title) || "product";
  const objectPath = `products/${Date.now()}-${baseName}.${fileExtension}`;

  let latestError = "Unable to upload the product image.";

  for (const bucket of PRODUCT_IMAGE_BUCKETS) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, options.imageFile, {
        cacheControl: "3600",
        contentType: options.imageFile.type,
        upsert: false,
      });

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
      return { publicUrl: data.publicUrl };
    }

    latestError = error.message;
  }

  return { error: latestError };
}

function extensionForFile(file: File): string {
  const extFromName = file.name.split(".").pop()?.toLowerCase().trim();
  if (extFromName && extFromName.length <= 8) {
    return extFromName;
  }

  const extFromType = file.type.split("/").pop()?.toLowerCase().trim();
  if (extFromType && extFromType.length <= 8) {
    return extFromType === "jpeg" ? "jpg" : extFromType;
  }

  return "jpg";
}

function revalidateStorefrontAndAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/collections");
  revalidatePath("/collections/[category]", "page");
  revalidatePath("/c/[category]", "page");
}
