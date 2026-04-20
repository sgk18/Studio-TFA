"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Palette, 
  Maximize, 
  ImagePlus,
  LoaderCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommissionStepperProps {
  productId: string;
  productTitle: string;
}

const STEPS = [
  { id: "vision", label: "Vision", icon: Sparkles, description: "Share the story or intention behind this request." },
  { id: "palette", label: "Palette", icon: Palette, description: "Select your preferred tone and mood." },
  { id: "specs", label: "Specs", icon: Maximize, description: "Preferred dimensions and framing style." },
  { id: "references", label: "References", icon: ImagePlus, description: "Upload mood board or space photos." },
];

const BRAND_COLORS = [
  { name: "Crimson", hex: "#E0AEBA" },
  { name: "Slate", hex: "#4A4A4A" },
  { name: "Oatmeal", hex: "#F5F5F0" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Charcoal", hex: "#262626" },
  { name: "Earthy", hex: "#8D7B68" },
];

export function CommissionStepper({ productId, productTitle }: CommissionStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    vision: "",
    colors: [] as string[],
    customColor: "",
    width: "",
    height: "",
    framing: "minimal",
    photos: [] as File[],
  });

  const handleNext = () => {
    if (currentStep === 0 && !formData.vision.trim()) {
      toast.error("Please share a bit of your vision first.");
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => setCurrentStep((s) => s - 1);

  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color) 
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Logic would go to a server action to insert into custom_orders/commissions
      // For now, simulating success
      await new Promise(r => setTimeout(r, 2000));
      setIsSubmitted(true);
      toast.success("Vision received ✦ Sherlin will reach out within 48 hours.");
    });
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-shell rounded-[2rem] p-10 text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-heading text-3xl tracking-tight">Your vision has been received ✦</h3>
          <p className="mt-2 text-sm text-foreground/60 leading-relaxed italic">
            Sherlin is reviewing your request. We'll be in touch within 48 hours via email to discuss the next steps of your bespoke piece.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="glass-shell rounded-[2rem] overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 p-6 border-b border-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Bespoke Workflow</p>
        </div>
        <h3 className="font-heading text-2xl tracking-tight">Request a Custom Piece</h3>
      </div>

      {/* Stepper Progress */}
      <div className="px-6 pt-6 flex justify-between">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isPast = idx < currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 group">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500 border",
                isActive ? "bg-primary text-white border-primary shadow-lg scale-110" : 
                isPast ? "bg-primary/20 text-primary border-primary/30" : "bg-muted/50 text-muted-foreground border-transparent"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn(
                "hidden sm:block text-[9px] font-bold uppercase tracking-widest",
                isActive ? "text-primary" : "text-foreground/30"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[220px]"
          >
            <div className="mb-6">
              <h4 className="text-base font-semibold text-foreground/80">{STEPS[currentStep].label}</h4>
              <p className="text-xs text-foreground/45 mt-1">{STEPS[currentStep].description}</p>
            </div>

            {currentStep === 0 && (
              <textarea
                value={formData.vision}
                onChange={(e) => setFormData({...formData, vision: e.target.value})}
                placeholder="I'm looking for a piece that captures the feeling of..."
                className="w-full bg-background/30 border border-border/70 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-[160px] resize-none"
              />
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  {BRAND_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      className={cn(
                        "group relative px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
                        formData.colors.includes(color.name) 
                          ? "bg-primary text-white border-primary" 
                          : "bg-background/20 border-border/70 text-foreground/50 hover:border-primary/40"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color.hex }} />
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Any specific hex code or palette notes?"
                  value={formData.customColor}
                  onChange={(e) => setFormData({...formData, customColor: e.target.value})}
                  className="w-full bg-background/30 border border-border/70 rounded-xl px-4 py-3 text-sm"
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Width (cm/in)</label>
                  <input
                    type="text"
                    value={formData.width}
                    onChange={(e) => setFormData({...formData, width: e.target.value})}
                    placeholder="e.g. 24in"
                    className="w-full bg-background/30 border border-border/70 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Height (cm/in)</label>
                  <input
                    type="text"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    placeholder="e.g. 36in"
                    className="w-full bg-background/30 border border-border/70 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Framing Preference</label>
                  <select 
                    value={formData.framing}
                    onChange={(e) => setFormData({...formData, framing: e.target.value})}
                    className="w-full bg-background/30 border border-border/70 rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="minimal">Minimal Floating Frame</option>
                    <option value="classic">Classic Gilded Wood</option>
                    <option value="none">Stretched Canvas (No outer frame)</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-border/70 rounded-[2rem] p-12 bg-background/20 hover:bg-primary/[0.03] transition-all">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) setFormData({...formData, photos: Array.from(e.target.files)});
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <ImagePlus className="h-10 w-10 text-foreground/20 mb-4" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
                  {formData.photos.length > 0 
                    ? `${formData.photos.length} files attached` 
                    : "Attach references or space photos"}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0 || isPending}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 disabled:opacity-20 hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-3 w-3" />
            Back
          </button>

          {currentStep === STEPS.length - 1 ? (
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isPending ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  Submit Vision ✦
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3.5 rounded-full border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/5 transition-all"
            >
              Continue
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
