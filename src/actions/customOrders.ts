"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminAccess } from "@/lib/security/adminRole";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

const CUSTOM_ORDER_REFERENCE_BUCKETS = ["custom-order-references"] as const;
const MAX_REFERENCE_IMAGE_BYTES = 10 * 1024 * 1024;

const commissionSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  vision: z.string().trim().min(20).max(3000),
  colorPalette: z.array(z.string().trim().min(2).max(64)).min(1).max(8),
  paletteNotes: z.string().trim().max(1000).optional(),
});

const customOrderStatusSchema = z.enum([
  "todo",
  "in_progress",
  "review",
  "shipped",
]);

const statusUpdateSchema = z.object({
  orderId: z.string().trim().min(6).max(128),
  status: customOrderStatusSchema,
  trackingNumber: z.string().trim().optional(),
});

type CustomOrderInsert = Database["public"]["Tables"]["custom_orders"]["Insert"];
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type CustomOrderStatus = z.infer<typeof customOrderStatusSchema>;

export type CommissionSubmissionResult = {
  status: "success" | "error";
  message: string;
  orderId?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitCustomOrderAction(
  formData: FormData
): Promise<CommissionSubmissionResult> {
  const colorPalette = formData
    .getAll("colorPalette")
    .map((item) => String(item).trim())
    .filter(Boolean);

  const parsed = commissionSubmissionSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    vision: String(formData.get("vision") ?? ""),
    colorPalette,
    paletteNotes: String(formData.get("paletteNotes") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review your commission details.",
      fieldErrors: mapZodIssues(parsed.error),
    };
  }

  const referenceFile = formData.get("referenceFile");

  if (referenceFile instanceof File && referenceFile.size > 0) {
    if (!referenceFile.type.startsWith("image/")) {
      return {
        status: "error",
        message: "Reference upload must be an image file.",
        fieldErrors: { referenceFile: "Upload a PNG, JPG, WEBP, or HEIC image." },
      };
    }

    if (referenceFile.size > MAX_REFERENCE_IMAGE_BYTES) {
      return {
        status: "error",
        message: "Reference image is too large.",
        fieldErrors: { referenceFile: "Image must be 10MB or less." },
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let referenceImagePath: string | null = null;
  let referenceImageUrl: string | null = null;

  if (referenceFile instanceof File && referenceFile.size > 0) {
    const uploadResult = await uploadCommissionReferenceImage({
      supabase,
      file: referenceFile,
      fullName: parsed.data.fullName,
      userId: user?.id ?? null,
    });

    if ("error" in uploadResult) {
      return {
        status: "error",
        message: uploadResult.error,
      };
    }

    referenceImagePath = uploadResult.path;
    referenceImageUrl = uploadResult.publicUrl;
  }

  const insertPayload: CustomOrderInsert = {
    user_id: user?.id ?? null,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    vision: parsed.data.vision,
    color_palette: parsed.data.colorPalette,
    palette_notes: parsed.data.paletteNotes ?? null,
    reference_image_path: referenceImagePath,
    reference_image_url: referenceImageUrl,
    status: "todo",
  };

  const { data: insertedRow, error } = await supabase
    .from("custom_orders")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !insertedRow) {
    return {
      status: "error",
      message: error?.message || "Unable to submit your commission request right now.",
    };
  }

  revalidatePath("/artists-corner");
  revalidatePath("/admin/custom-orders");
  revalidatePath("/admin");

  return {
    status: "success",
    message:
      "Commission request submitted. Our artists will review your brief and follow up shortly.",
    orderId: insertedRow.id,
  };
}

export async function updateCustomOrderStatusAction(input: {
  orderId: string;
  status: CustomOrderStatus;
}): Promise<{ status: "success" | "error"; message: string }> {
  const parsed = statusUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid status update payload.",
    };
  }

  const { supabase } = await requireAdminAccess({ from: "/admin/custom-orders" });

  const { error } = await supabase
    .from("custom_orders")
    .update({ 
      status: parsed.data.status,
      ...(parsed.data.trackingNumber ? { tracking_number: parsed.data.trackingNumber } : {})
    })
    .eq("id", parsed.data.orderId);

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/admin/custom-orders");
  revalidatePath("/admin");

  return {
    status: "success",
    message: "Commission board updated.",
  };
}

async function uploadCommissionReferenceImage(options: {
  supabase: SupabaseServerClient;
  file: File;
  fullName: string;
  userId: string | null;
}): Promise<{ path: string; publicUrl: string } | { error: string }> {
  const ext = extensionForFile(options.file);
  const customerSegment = sanitizeStorageSegment(options.userId ?? options.fullName) || "guest";
  const objectPath = `${customerSegment}/${Date.now()}-reference.${ext}`;

  let latestError = "Unable to upload the reference image right now.";

  for (const bucket of CUSTOM_ORDER_REFERENCE_BUCKETS) {
    const { error } = await options.supabase.storage.from(bucket).upload(objectPath, options.file, {
      cacheControl: "3600",
      contentType: options.file.type,
      upsert: false,
    });

    if (!error) {
      const { data } = options.supabase.storage.from(bucket).getPublicUrl(objectPath);
      return {
        path: objectPath,
        publicUrl: data.publicUrl,
      };
    }

    latestError = error.message;
  }

  return { error: latestError };
}

function extensionForFile(file: File): string {
  const extFromName = file.name.split(".").pop()?.trim().toLowerCase();
  if (extFromName && extFromName.length <= 8) {
    return extFromName;
  }

  const extFromType = file.type.split("/").pop()?.trim().toLowerCase();
  if (extFromType && extFromType.length <= 8) {
    return extFromType === "jpeg" ? "jpg" : extFromType;
  }

  return "jpg";
}

function sanitizeStorageSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function mapZodIssues(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || fieldErrors[key]) {
      continue;
    }
    fieldErrors[key] = issue.message;
  }

  return fieldErrors;
}
