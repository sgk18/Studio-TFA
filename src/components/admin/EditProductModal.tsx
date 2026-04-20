"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateProduct, deleteProduct } from "@/app/admin/actions";
import { CustomisationFieldBuilder, type CustomField } from "./CustomisationFieldBuilder";

const formSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  category: z.string().trim().min(2, "Category is required."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  isActive: z.boolean(),
  isCustomisable: z.boolean(),
  customisableFields: z.any(), // Array of CustomField
});

type FormValues = z.infer<typeof formSchema>;

export function EditProductModal({ product }: { product: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product.title,
      category: product.category,
      price: Number(product.price),
      stock: Number(product.stock),
      description: product.description || "",
      isActive: product.is_active,
      isCustomisable: product.is_customisable || false,
      customisableFields: product.customisable_fields || [],
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        await updateProduct(product.id, {
          title: values.title,
          category: values.category,
          price: values.price,
          stock: values.stock,
          description: values.description,
          is_active: values.isActive,
          is_customisable: values.isCustomisable,
          customisable_fields: values.customisableFields,
        });

        toast.success("Product updated successfully.");
        setOpen(false);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Failed to update product.");
      }
    });
  };

  const handleArchive = () => {
    if (!confirm("Are you sure you want to archive this product? It will no longer be visible to customers.")) return;
    
    startTransition(async () => {
      try {
        await updateProduct(product.id, { ...product, is_active: false });
        toast.success("Product archived.");
        setOpen(false);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          title="Edit Product"
          className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-card/45 p-1.5 text-foreground/72 transition-colors hover:border-primary hover:text-primary"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl tracking-tight">Edit Product</DialogTitle>
          <DialogDescription>Modify product details, stock, or customisation fields.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="mt-4 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (INR)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border/70 bg-card/45 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Active Product</p>
                    <p className="text-xs text-muted-foreground">Visible in storefront listings.</p>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isCustomisable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border/70 bg-card/45 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Allow Personalisation</p>
                    <p className="text-xs text-muted-foreground">Enable custom fields for this product.</p>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}
            />

            {form.watch("isCustomisable") && (
              <FormField
                control={form.control}
                name="customisableFields"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CustomisationFieldBuilder 
                        value={field.value || []} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <Button type="button" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 gap-2" onClick={handleArchive}>
                <Trash2 className="h-4 w-4" />
                Archive Product
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
