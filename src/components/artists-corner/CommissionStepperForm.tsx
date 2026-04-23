"use client";

import { useMemo, useState, useTransition } from "react";
import { LoaderCircle, Palette, Sparkles, UploadCloud, Ruler, Image as ImageIcon, CheckCircle2, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

import { submitCustomOrderAction } from "@/actions/customOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "vision", title: "Vision", description: "Share the story." },
  { id: "palette", title: "Palette", description: "Choose tones." },
  { id: "dimensions", title: "Dimensions", description: "Size & Frame." },
  { id: "references", title: "References", description: "Multi-upload." },
  { id: "summary", title: "Summary", description: "Review & Submit." },
] as const;

const COLOR_SWATCHES = [
  { label: "Blush Veil", hex: "#E0AEBA" },
  { label: "Rose Script", hex: "#D17484" },
  { label: "Carmine Depth", hex: "#8B263E" },
  { label: "Gold Leaf", hex: "#786825" },
  { label: "Ivory Light", hex: "#FDF8F4" },
  { label: "Oak Ink", hex: "#292800" },
  { label: "Mist Sage", hex: "#BFC9BA" },
  { label: "Clay Bloom", hex: "#C08A7A" },
] as const;

export type CommissionPrefill = {
  fullName: string;
  email: string;
  isAuthenticated: boolean;
};

export function CommissionStepperForm({ prefill }: { prefill: CommissionPrefill }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fullName, setFullName] = useState(prefill.fullName);
  const [email, setEmail] = useState(prefill.email);
  const [vision, setVision] = useState("");
  const [selectedPalette, setSelectedPalette] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState({ width: "12", height: "18", unit: "inches", framing: "No Frame" });
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();

  const atFinalStep = currentStep === STEPS.length - 1;

  const referenceFileLabel = useMemo(() => {
    if (!referenceFile) {
      return "No file selected yet";
    }

    const kb = Math.round(referenceFile.size / 1024);
    return `${referenceFile.name} (${kb}KB)`;
  }, [referenceFile]);

  const togglePalette = (label: string) => {
    setSelectedPalette((current) => {
      if (current.includes(label)) {
        return current.filter((value) => value !== label);
      }
      if (current.length >= 8) {
        return current;
      }
      return [...current, label];
    });

    setFieldErrors((current) => ({
      ...current,
      colorPalette: undefined,
    }));
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex > currentStep) {
      return;
    }
    setCurrentStep(stepIndex);
  };

  const goToNextStep = () => {
    const nextErrors = validateForStep(currentStep, {
      fullName,
      email,
      vision,
      selectedPalette,
      referenceFile,
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...nextErrors }));
      return;
    }

    setFieldErrors({});
    setCurrentStep((step) => Math.min(STEPS.length - 1, step + 1));
  };

  const submit = () => {
    const visionErrors = validateForStep(0, {
      fullName,
      email,
      vision,
      selectedPalette,
      referenceFile,
    });
    const paletteErrors = validateForStep(1, {
      fullName,
      email,
      vision,
      selectedPalette,
      referenceFile,
    });

    const allErrors = {
      ...visionErrors,
      ...paletteErrors,
    };

    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      if (allErrors.fullName || allErrors.email || allErrors.vision) {
        setCurrentStep(0);
      } else {
        setCurrentStep(1);
      }
      return;
    }

    setSubmissionMessage("");
    setSubmittedOrderId(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("fullName", fullName.trim());
      formData.set("email", email.trim());
      formData.set("vision", vision.trim());
      formData.set("paletteNotes", paletteNotes.trim());

      for (const colorLabel of selectedPalette) {
        formData.append("colorPalette", colorLabel);
      }

      if (referenceFile) {
        formData.set("referenceFile", referenceFile);
      }

      const result = await submitCustomOrderAction(formData);

      if (result.status === "error") {
        setSubmissionMessage(result.message);
        setFieldErrors((result.fieldErrors ?? {}) as FieldErrors);
        toast.error(result.message);
        return;
      }

      setSubmissionMessage(result.message);
      setSubmittedOrderId(result.orderId ?? null);
      setFieldErrors({});
      toast.success("Commission submitted successfully.");

      setVision("");
      setSelectedPalette([]);
      setPaletteNotes("");
      setReferenceFile(null);
      setCurrentStep(0);
    });
  };

  return (
    <Card className="glass-shell border border-primary/25 shadow-[0_28px_56px_rgba(41,40,0,0.12)]">
      <CardHeader className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Request Custom Commission</p>
        <CardTitle className="font-heading text-3xl tracking-tight md:text-4xl">
          Shape your one-of-one piece
        </CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-7 text-foreground/70">
          Move through each step to define your brief. We verify every submission and move it into the studio Kanban board.
        </CardDescription>
        <Stepper steps={STEPS} activeStep={currentStep} onStepChange={goToStep} className="pt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {currentStep === 0 ? (
          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="commission-full-name">Full name</Label>
                <Input
                  id="commission-full-name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setFieldErrors((current) => ({ ...current, fullName: undefined }));
                  }}
                  placeholder="Your full name"
                />
                {fieldErrors.fullName ? (
                  <p className="text-xs text-destructive">{fieldErrors.fullName}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission-email">Email</Label>
                <Input
                  id="commission-email"
                  type="email"
                  value={email}
                  readOnly={prefill.isAuthenticated}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldErrors((current) => ({ ...current, email: undefined }));
                  }}
                  placeholder="you@example.com"
                />
                {fieldErrors.email ? (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission-vision">Vision brief</Label>
              <Textarea
                id="commission-vision"
                value={vision}
                onChange={(event) => {
                  setVision(event.target.value);
                  setFieldErrors((current) => ({ ...current, vision: undefined }));
                }}
                placeholder="Describe the scripture, mood, occasion, and message you want the final piece to carry."
                className="min-h-[170px]"
              />
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-foreground/60">
                <span>Minimum 20 characters</span>
                <span>{vision.trim().length} typed</span>
              </div>
              {fieldErrors.vision ? (
                <p className="text-xs text-destructive">{fieldErrors.vision}</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {currentStep === 1 ? (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-foreground/72">
              <Palette className="h-4 w-4 text-primary" />
              Choose up to 8 tones for your commission direction.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {COLOR_SWATCHES.map((swatch) => {
                const selected = selectedPalette.includes(swatch.label);

                return (
                  <button
                    key={swatch.label}
                    type="button"
                    onClick={() => togglePalette(swatch.label)}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                      selected
                        ? "border-primary/70 bg-primary/10"
                        : "border-border/65 bg-card/45 hover:border-primary/45"
                    )}
                  >
                    <span className="text-sm font-medium">{swatch.label}</span>
                    <span
                      className="h-7 w-7 rounded-full border border-black/10"
                      style={{ backgroundColor: swatch.hex }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs uppercase tracking-[0.14em] text-foreground/60">
              {selectedPalette.length} selected
            </p>
            {fieldErrors.colorPalette ? (
              <p className="text-xs text-destructive">{fieldErrors.colorPalette}</p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="palette-notes">Palette notes (optional)</Label>
              <Textarea
                id="palette-notes"
                value={paletteNotes}
                onChange={(event) => setPaletteNotes(event.target.value)}
                placeholder="Add texture, finish, or contrast notes."
                className="min-h-28"
              />
            </div>
          </section>
        ) : null}

        {currentStep === 2 ? (
          <section className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-card/55 p-4">
              <p className="text-sm leading-7 text-foreground/72">
                Upload one reference image to guide typography, composition, or styling. Files are stored in Supabase Storage and linked to your custom order.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission-reference-file">Reference image</Label>
              <Input
                id="commission-reference-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setReferenceFile(file);
                  setFieldErrors((current) => ({ ...current, referenceFile: undefined }));
                }}
              />
              <p className="text-xs uppercase tracking-[0.14em] text-foreground/60">{referenceFileLabel}</p>
              {fieldErrors.referenceFile ? (
                <p className="text-xs text-destructive">{fieldErrors.referenceFile}</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm text-foreground/75">
              <p className="font-semibold text-primary">Studio readiness checklist</p>
              <ul className="mt-2 space-y-1">
                <li>Vision complete: {vision.trim().length >= 20 ? "Yes" : "No"}</li>
                <li>Palette selected: {selectedPalette.length > 0 ? "Yes" : "No"}</li>
                <li>Reference attached: {referenceFile ? "Yes" : "Optional"}</li>
              </ul>
            </div>
          </section>
        ) : null}

        {submissionMessage ? (
          <div
            className={cn(
              "rounded-xl border px-3 py-2 text-sm",
              submittedOrderId
                ? "border-primary/45 bg-primary/10 text-primary"
                : "border-destructive/45 bg-destructive/10 text-destructive"
            )}
          >
            <p>{submissionMessage}</p>
            {submittedOrderId ? <p className="mt-1 text-xs">Order ID: {submittedOrderId}</p> : null}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.14em] text-foreground/60">
          Step {currentStep + 1} of {STEPS.length}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canMoveBack || isPending}
            onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
          >
            Back
          </Button>

          {!atFinalStep ? (
            <Button type="button" onClick={goToNextStep} disabled={isPending}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={isPending}>
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Submitting
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <UploadCloud className="h-4 w-4" />
                  Submit commission
                </span>
              )}
            </Button>
          )}
        </div>
      </CardFooter>

      <div className="flex items-center gap-2 border-t border-border/60 px-6 py-4 text-xs text-foreground/65">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Your request appears in the admin Kanban board after successful submission.
      </div>
    </Card>
  );
}

function validateForStep(
  step: number,
  values: {
    fullName: string;
    email: string;
    vision: string;
    selectedPalette: string[];
    referenceFile: File | null;
  }
): FieldErrors {
  const nextErrors: FieldErrors = {};

  if (step === 0) {
    if (values.fullName.trim().length < 2) {
      nextErrors.fullName = "Full name must be at least 2 characters.";
    }

    if (!values.email.includes("@") || values.email.trim().length < 5) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (values.vision.trim().length < 20) {
      nextErrors.vision = "Vision brief must be at least 20 characters.";
    }
  }

  if (step === 1 && values.selectedPalette.length === 0) {
    nextErrors.colorPalette = "Choose at least one color direction.";
  }

  if (step === 2 && values.referenceFile && !values.referenceFile.type.startsWith("image/")) {
    nextErrors.referenceFile = "Reference upload must be an image file.";
  }

  return nextErrors;
}
