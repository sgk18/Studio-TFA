"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  customisable_fields: z.array(
    z.object({
      name: z.string().min(1, "Name required"),
      type: z.string().min(1, "Type required"),
      required: z.boolean().default(false),
    })
  ).optional(),
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
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      price: 0,
      stock_count: 0,
      story: "",
      image_url: "",
      is_custom_order: false,
      is_customisable: false,
      customisable_fields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customisable_fields",
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
        customisable_fields: productToEdit.customisable_fields || [],
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
        customisable_fields: [],
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
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
                          form.setValue("customisable_fields", []);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isCustomisable && (
              <div className="rounded-lg border p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest">Storefront Fields</h3>
                    <p className="text-xs text-muted-foreground">Add fields that allow the buyer to personalise the product.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => append({ name: "", type: "text", required: false })}
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Add Field
                  </Button>
                </div>
                {fields.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded bg-muted/10">
                    No customisation fields added.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {fields.map((f, index) => (
                      <div key={f.id} className="flex items-start gap-3 bg-muted/10 p-3 rounded border">
                        <FormField
                          control={form.control}
                          name={`customisable_fields.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1 space-y-1">
                              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Field Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Name to print" className="h-8 text-xs" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`customisable_fields.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="w-32 space-y-1">
                              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Data Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="text">Text Entry</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`customisable_fields.${index}.required`}
                          render={({ field }) => (
                            <FormItem className="space-y-1 flex flex-col items-center pt-1.5">
                              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none">Req.</FormLabel>
                              <FormControl>
                                <div className="h-8 flex items-center">
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-5 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
