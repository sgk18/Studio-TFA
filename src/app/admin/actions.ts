"use server";

import { revalidatePath } from "next/cache";
import { requireMasterAdminAccess } from "@/lib/security/masterAdminServer";

export async function createProduct(data: any) {
  const supabase = await requireMasterAdminAccess();
  
  const { error } = await supabase
    .from('products')
    .insert([
      {
        title: data.title,
        category: data.category,
        price: data.price,
        stock_count: data.stock_count,
        story: data.story,
        image_url: data.image_url,
        is_custom_order: data.is_custom_order,
      }
    ]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/products');
  revalidatePath('/collections');
  revalidatePath('/c/[category]', 'page');
}

export async function updateProduct(id: string, data: any) {
  const supabase = await requireMasterAdminAccess();
  
  const { error } = await supabase
    .from('products')
    .update({
      title: data.title,
      category: data.category,
      price: data.price,
      stock_count: data.stock_count,
      story: data.story,
      image_url: data.image_url,
      is_custom_order: data.is_custom_order,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/products');
  revalidatePath('/collections');
  revalidatePath('/product/[id]', 'page');
  revalidatePath('/c/[category]', 'page');
}

export async function deleteProduct(id: string) {
  const supabase = await requireMasterAdminAccess();
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/products');
  revalidatePath('/collections');
}
