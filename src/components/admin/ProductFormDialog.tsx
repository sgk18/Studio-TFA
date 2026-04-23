"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createProduct, updateProduct } from "@/app/admin/actions";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  category: z.string().min(1, "Please select a category."),
  price: z.coerce.number<number>().min(0, "Price must be at least 0."),
  stock_count: z.coerce.number<number>().min(0, "Stock cannot be negative."),
  story: z.string().min(10, "Story/Description is required for our narrative style."),
  image_url: z.string().url("Must be a valid URL."),
  is_custom_order: z.boolean(),
  is_customisable: z.boolean().default(false),
  product_type: z.enum([
    "standard", "cap", "apparel", "bag", "journal", "frame", "resin", "badge", "stationery", "digital"
  ]).default("standard"),
  customisation_surcharge: z.coerce.number().min(0).default(0),
  customisable_fields: z.record(z.string(), z.boolean()).default({}),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductFormDialog({ 
  open, 
  onOpenChange, 
  productToEdit 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void,
  productToEdit?: any 
}) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      category: "",
      price: 0,
      stock_count: 0,
      story: "",
      image_url: "",
      is_custom_order: false,
      is_customisable: false,
      product_type: "standard",
      customisation_surcharge: 0,
      customisable_fields: {},
    },
  });

  const isCustomOrder = form.watch("is_custom_order");
  const isCustomisable = form.watch("is_customisable");

  useEffect(() => {
    if (isCustomOrder) {
      form.setValue("price", 0);
    }
  }, [isCustomOrder, form]);

  useEffect(() => {
    if (productToEdit && open) {
      form.reset({
        title: productToEdit.title || "",
        category: productToEdit.category || "",
        price: productToEdit.price || 0,
        stock_count: productToEdit.stock_count || 0,
        story: productToEdit.story || "",
        image_url: productToEdit.image_url || "",
        is_custom_order: productToEdit.is_custom_order || false,
        is_customisable: productToEdit.is_customisable || false,
        product_type: productToEdit.product_type || "standard",
        customisation_surcharge: productToEdit.customisation_surcharge || 0,
        customisable_fields: productToEdit.customisable_fields || {},
      });
    } else if (open) {
      form.reset({
        title: "",
        category: "",
        price: 0,
        stock_count: 0,
        story: "",
        image_url: "",
        is_custom_order: false,
        is_customisable: false,
        product_type: "standard",
        customisation_surcharge: 0,
        customisable_fields: {},
      });
    }
  }, [productToEdit, open, form]);

  async function onSubmit(data: FormValues) {
    setIsPending(true);
    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, data);
        toast.success(`Success: ${data.title} updated.`);
      } else {
        await createProduct(data);
        toast.success(`Success: ${data.title} added to inventory.`);
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-3xl tracking-tight mb-2">
            {productToEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription className="text-sm tracking-widest uppercase font-bold text-muted-foreground">
            {productToEdit ? "Update inventory details." : "Add a new item to the store catalog."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. The Quiet Morning" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="journals">Journals</SelectItem>
                        <SelectItem value="apparels">Apparels</SelectItem>
                        <SelectItem value="home decor">Home Decor</SelectItem>
                        <SelectItem value="gift hampers">Gift Hampers</SelectItem>
                        <SelectItem value="custom orders">Custom Orders</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest">Price (₹ INR)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        disabled={isCustomOrder} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest">Stock Count</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <FormField
                control={form.control}
                name="product_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest">Product Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="cap">Cap / Hat</SelectItem>
                        <SelectItem value="apparel">Apparel (Tees/Hoodies)</SelectItem>
                        <SelectItem value="bag">Bag / Tote</SelectItem>
                        <SelectItem value="journal">Journal / Notebook</SelectItem>
                        <SelectItem value="frame">Frame / Wall Art</SelectItem>
                        <SelectItem value="resin">Resin Piece</SelectItem>
                        <SelectItem value="badge">Badge / Pin</SelectItem>
                        <SelectItem value="stationery">Other Stationery</SelectItem>
                        <SelectItem value="digital">Digital Product</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customisation_surcharge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest">Customisation Surcharge (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription className="text-[10px]">Added to price if personalised.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_custom_order"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-bold text-foreground uppercase tracking-widest">Custom Order</FormLabel>
                    <FormDescription>
                      Disables fixed pricing. Status displayed as 'Custom' on Storefront.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_customisable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-bold text-foreground uppercase tracking-widest">Personalisation Features</FormLabel>
                    <FormDescription>
                      Enable customisations such as names or notes for buyers during checkout.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(val) => {
                        field.onChange(val);
                        if (!val) {
                          form.setValue("customisable_fields", {});
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isCustomisable && (
              <div className="rounded-lg border p-4 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Customisation Options</h3>
                  <p className="text-xs text-muted-foreground">Select which fields the customer can personalise for this product.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "badge_text", label: "Badge/Brief Text (max 30)" },
                    { id: "badge_style", label: "Style Selector (thumbnails)" },
                    { id: "custom_verse", label: "Bible Verse Textarea" },
                    { id: "name_text", label: "Name/Initials/Date (max 20)" },
                    { id: "colour_accent", label: "Brand Colour Picker" },
                    { id: "photo_upload", label: "Photo/Image Upload" },
                    { id: "monogram", label: "Monogram (3 chars)" },
                    { id: "print_position", label: "Print Zone (Apparel only)" },
                  ].map((field) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`customisable_fields.${field.id}`}
                      render={({ field: formField }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-muted/10">
                          <FormControl>
                            <Checkbox
                              checked={formField.value}
                              onCheckedChange={formField.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-[11px] font-medium leading-none cursor-pointer">
                              {field.label}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest">Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://unsplash.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="story"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest">Story / Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share the narrative behind this piece..." 
                      className="resize-none h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>This text profoundly drives the storytelling experience on the product detail page.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="uppercase tracking-widest font-bold text-xs px-8">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto uppercase tracking-widest font-bold text-xs px-8">
                {isPending ? "Saving..." : "Save Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
