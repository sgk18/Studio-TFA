"use client";

import React, { useState, useTransition } from "react";
import { 
  FileSpreadsheet, 
  FileText, 
  LoaderCircle, 
  BarChart4, 
  Users, 
  Package,
  Calendar,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exportToExcel, exportToCSV } from "@/lib/admin/SheetJSExporter";
import { getInventoryValuationReport, getAllOrdersReport } from "@/actions/adminStats";
import { toast } from "sonner";
import { startOfMonth, endOfMonth, format } from "date-fns";

export function ReportsDashboard() {
  const [isPending, startTransition] = useTransition();
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const runExport = (type: "orders" | "inventory" | "customers") => {
    startTransition(async () => {
      try {
        let data: any[] = [];
        let name = "";

        if (type === "inventory") {
          data = await getInventoryValuationReport();
          name = `Inventory_Valuation_${format(new Date(), "yyyy-MM-dd")}`;
        } else if (type === "orders") {
          data = await getAllOrdersReport({
            from: new Date(dateRange.from).toISOString(),
            to: new Date(dateRange.to).toISOString(),
          });
          name = `Orders_Report_${dateRange.from}_to_${dateRange.to}`;
        }

        if (data.length === 0) {
          toast.error("No data found for the selected period.");
          return;
        }

        await exportToExcel(data, name, "Studio TFA Report");
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} intel exported ✦`);
      } catch (err: any) {
        toast.error(err.message || "Export failed.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Orders Report */}
        <Card className="glass-shell border-none bg-card/45 overflow-hidden group">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em]">Sales Audit</CardTitle>
            </div>
            <CardDescription className="text-xs">Detailed export of all orders, customers, and payment statuses within a range.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 pb-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">From</label>
                <input 
                  type="date" 
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full bg-background/50 border border-border/70 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">To</label>
                <input 
                  type="date" 
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full bg-background/50 border border-border/70 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <Button 
              className="w-full h-11 gap-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
              onClick={() => runExport("orders")}
              disabled={isPending}
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <DownloadIcon className="h-4 w-4" />}
              Generate Sales Report
            </Button>
          </CardContent>
        </Card>

        {/* Inventory Report */}
        <Card className="glass-shell border-none bg-card/45 overflow-hidden group">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em]">Inventory Valuation</CardTitle>
            </div>
            <CardDescription className="text-xs">Live snapshot of total stock value, unit pricing, and catalog liquidity.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-end pt-5">
            <Button 
              variant="outline"
              className="w-full h-11 gap-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
              onClick={() => runExport("inventory")}
              disabled={isPending}
            >
              <FileText className="h-4 w-4" />
              Export Valuation XLS
            </Button>
          </CardContent>
        </Card>

        {/* Intelligence Summary */}
        <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-3xl tracking-tight text-primary">Data Integrity</h3>
            <p className="mt-4 text-[13px] leading-relaxed text-foreground/70 italic">
              "Numbers are the visible manifestation of your studio's curation. Use these reports to align your artistic vision with operational reality."
            </p>
          </div>
          <div className="mt-6 flex items-center gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Compliance</p>
              <p className="text-xs font-bold text-primary">Standard Export v1.2</p>
            </div>
            <div className="h-10 w-px bg-primary/10" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Format</p>
              <p className="text-xs font-bold text-primary">XLSX / SheetJS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
