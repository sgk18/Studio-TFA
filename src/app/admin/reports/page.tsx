import { ReportsDashboard } from "@/components/admin/ReportsDashboard";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata = {
  title: "Reports | Studio TFA Admin",
};

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return (
    <ScrollReveal className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
          Data Export
        </p>
        <h2 className="mt-2 font-heading text-5xl tracking-tight">Reports & Intel</h2>
        <p className="mt-2 text-sm text-foreground/60 max-w-lg">
          Generate production-ready exports of your studio's operational data. 
          Use these insights for inventory planning and audit reconciliations.
        </p>
      </div>

      <ReportsDashboard />
    </ScrollReveal>
  );
}
