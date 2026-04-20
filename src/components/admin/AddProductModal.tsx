"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
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
import { createProductWithImageUpload } from "@/app/admin/actions";
import { CustomisationFieldBuilder } from "./CustomisationFieldBuilder";

const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;

const formSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  category: z.string().trim().min(2, "Category is required."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  isActive: z.boolean(),
  isCustomisable: z.boolean(),
  customisableFields: z.any(),
  surchargeAmount: z.coerce.number().min(0).default(0),
  isCustomOrder: z.boolean().default(false),
  imageFile: z
    .any()
    .refine((value) => value instanceof File && value.size > 0, {
      message: "A product image is required.",
    })
    .refine((value) => value instanceof File && value.size <= MAX_PRODUCT_IMAGE_BYTES, {
      message: "Image must be 8MB or less.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddProductModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      price: 0,
      stock: 0,
      description: "",
      isActive: true,
      isCustomisable: false,
      customisableFields: [],
      surchargeAmount: 0,
      isCustomOrder: false,
      imageFile: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", values.title);
      formData.set("category", values.category);
      formData.set("price", String(values.price));
      formData.set("stock", String(values.stock));
      formData.set("description", values.description);
      formData.set("isActive", values.isActive ? "true" : "false");
      formData.set("isCustomisable", values.isCustomisable ? "true" : "false");
      formData.set("customisableFields", JSON.stringify(values.customisableFields));
      formData.set("surchargeAmount", String(values.surchargeAmount));
      formData.set("isCustomOrder", values.isCustomOrder ? "true" : "false");
      formData.set("imageFile", values.imageFile);

      const result = await createProductWithImageUpload(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Product created successfully.");
      setOpen(false);
      form.reset();
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="action-pill-link px-4 py-2 text-xs gap-2">
          <Plus className="h-3.5 w-3.5" />
          Add Product
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl tracking-tight">Add Product</DialogTitle>
          <DialogDescription>Add a new editorial piece to the gallery catalog.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="mt-4 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Product title" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="books, decor..." {...field} /></FormControl>
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
                    <FormLabel>Inventory Stock</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Story</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      className="glass-input block w-full rounded-xl border px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1 file:text-[10px] file:font-bold file:uppercase file:text-primary-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-border/70 bg-card/45 px-4 py-2.5">
                    <FormLabel className="font-semibold text-xs">Active Listing</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isCustomisable"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-border/70 bg-card/45 px-4 py-2.5">
                    <FormLabel className="font-semibold text-xs">Personalisation</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isCustomOrder"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border border-border/70 bg-card/45 px-4 py-2.5">
                    <FormLabel className="font-semibold text-xs">Bespoke Commission</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="surchargeAmount"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Surcharge (INR)</FormLabel>
                    <FormControl><Input type="number" className="h-9" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>

            {form.watch("isCustomisable") && (
              <FormField
                control={form.control}
                name="customisableFields"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CustomisationFieldBuilder value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Listing..." : "Add to Gallery"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
