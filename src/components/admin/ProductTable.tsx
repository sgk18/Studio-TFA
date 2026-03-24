"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ArrowUpDown, Plus, Search, Package, Trash2, Edit2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ProductFormDialog } from "./ProductFormDialog";
import { deleteProduct } from "@/app/admin/actions";

export function ProductTable({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  
  // Table State
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Client-side sorting
  const sortedData = [...initialData].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (aVal === null) aVal = "";
    if (bVal === null) bVal = "";

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Client-side filtering
  const filteredData = sortedData.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (stockCount: number | null, isCustomOrder: boolean) => {
    if (isCustomOrder) return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase rounded-sm tracking-widest">Custom</span>;
    if (stockCount === null || stockCount <= 0) return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase rounded-sm tracking-widest">Out of Stock</span>;
    if (stockCount <= 3) return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold uppercase rounded-sm tracking-widest">Low Stock</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-sm tracking-widest">In Stock</span>;
  };

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (product: any) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      toast.success(`Success: ${productToDelete.title} has been deleted.`);
      setIsDeleteOpen(false);
      setProductToDelete(null);
      router.refresh(); // Ensure the frontend explicitly realizes the wipe
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const onFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setTimeout(() => setProductToEdit(null), 300); // Wait for transition
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search products by title or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Button className="w-full sm:w-auto tracking-widest uppercase font-bold text-xs" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="border rounded-md bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>
                <button className="flex items-center gap-1 font-bold uppercase text-xs tracking-widest hover:text-black transition-colors" onClick={() => handleSort('title')}>
                  Title <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="font-bold uppercase text-xs tracking-widest">Category</TableHead>
              <TableHead>
                 <button className="flex items-center gap-1 font-bold uppercase text-xs tracking-widest hover:text-black transition-colors" onClick={() => handleSort('price')}>
                  Price <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead>
                <button className="flex items-center gap-1 font-bold uppercase text-xs tracking-widest hover:text-black transition-colors" onClick={() => handleSort('stock_count')}>
                  Stock <ArrowUpDown className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="font-bold uppercase text-xs tracking-widest">Status</TableHead>
              <TableHead className="text-right font-bold uppercase text-xs tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                  No products found. Add one to get started!
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative w-12 h-16 bg-muted rounded-sm overflow-hidden border">
                      {product.image_url ? (
                        <Image src={product.image_url} alt={product.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                           <Package className="w-4 h-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium font-heading text-lg">{product.title}</TableCell>
                  <TableCell className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{product.category}</TableCell>
                  <TableCell>${product.price || 0}</TableCell>
                  <TableCell>{product.stock_count || 0}</TableCell>
                  <TableCell>{getStatusBadge(product.stock_count, product.is_custom_order)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel className="text-xs uppercase tracking-widest font-bold">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => handleOpenEdit(product)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-bold" onClick={() => handleOpenDelete(product)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog 
        open={isFormOpen} 
        onOpenChange={onFormClose} 
        productToEdit={productToEdit} 
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <strong>{productToDelete?.title}</strong> and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="uppercase font-bold tracking-widest text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white uppercase font-bold tracking-widest text-xs"
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
