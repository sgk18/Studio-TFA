"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Upload, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const BRAND_COLORS = [
  { label: "Blush", hex: "#E0AEBA" },
  { label: "Rose", hex: "#D17484" },
  { label: "Carmine", hex: "#8B263E" },
  { label: "Gold", hex: "#786825" },
  { label: "Ivory", hex: "#FDF8F4" },
  { label: "Oak", hex: "#292800" },
];

const BADGE_STYLES = ["Classic", "Floral", "Scripture", "Minimal", "Wreath"];
const PRINT_POSITIONS = ["Front", "Back", "Sleeve", "Chest"];

interface CustomisationPanelProps {
  productType: string;
  enabledFields: Record<string, boolean>;
  surcharge: number;
  onChange: (customisations: Record<string, any>) => void;
  className?: string;
}

export function CustomisationPanel({ 
  productType, 
  enabledFields, 
  surcharge,
  onChange, 
  className 
}: CustomisationPanelProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  // Notify parent on change
  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  const handleChange = (id: string, value: any) => {
    setValues(prev => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('customisation-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('customisation-uploads')
        .getPublicUrl(filePath);

      handleChange("photo_url", data.publicUrl);
      toast.success("Image uploaded successfully.");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-8 glass-subpanel rounded-[1.8rem] p-6 lg:p-8 border border-primary/20", className)}>
      <header className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-primary flex items-center gap-2">
          Personalise your piece ✦
        </h3>
        <p className="text-[11px] text-foreground/50 italic leading-relaxed max-w-xs">
          Each custom detail is hand-rendered by our artists to anchor your space in meaning.
        </p>
        {surcharge > 0 && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mt-2">
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">+ ₹{surcharge} for personalisation</span>
          </div>
        )}
      </header>

      <div className="grid gap-7">
        {enabledFields.badge_text && (
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Badge / Brief Text (Max 30)
            </Label>
            <Input
              maxLength={30}
              placeholder="Your word, name, or verse"
              value={values.badge_text || ""}
              onChange={(e) => handleChange("badge_text", e.target.value)}
              className="bg-background/40 border-primary/10 rounded-xl"
            />
          </div>
        )}

        {enabledFields.badge_style && (
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Select Style
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BADGE_STYLES.map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleChange("badge_style", style)}
                  className={cn(
                    "px-3 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg border transition-all",
                    values.badge_style === style 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background/40 border-primary/10 text-foreground/60 hover:border-primary/30"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        )}

        {enabledFields.custom_verse && (
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Bible Verse
            </Label>
            <Textarea
              maxLength={200}
              placeholder="Enter a Bible verse that speaks to you..."
              value={values.custom_verse || ""}
              onChange={(e) => handleChange("custom_verse", e.target.value)}
              className="bg-background/40 border-primary/10 rounded-xl min-h-[100px]"
            />
          </div>
        )}

        {enabledFields.name_text && (
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Name / Date / Initials (Max 20)
            </Label>
            <Input
              maxLength={20}
              placeholder="e.g. Elizabeth | 22.04.24"
              value={values.name_text || ""}
              onChange={(e) => handleChange("name_text", e.target.value)}
              className="bg-background/40 border-primary/10 rounded-xl"
            />
          </div>
        )}

        {enabledFields.monogram && (
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Monogram (Max 3 Characters)
            </Label>
            <Input
              maxLength={3}
              placeholder="ABC"
              className="uppercase bg-background/40 border-primary/10 rounded-xl"
              value={values.monogram || ""}
              onChange={(e) => handleChange("monogram", e.target.value.toUpperCase())}
            />
          </div>
        )}

        {enabledFields.colour_accent && (
          <div className="space-y-4">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Colour Accent
            </Label>
            <div className="flex flex-wrap gap-3">
              {BRAND_COLORS.map(color => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => handleChange("colour_accent", color.hex)}
                  className={cn(
                    "group relative h-10 w-10 rounded-full border-2 transition-all p-0.5",
                    values.colour_accent === color.hex ? "border-primary scale-110" : "border-transparent hover:border-primary/20"
                  )}
                  title={color.label}
                >
                  <div className="h-full w-full rounded-full shadow-inner" style={{ backgroundColor: color.hex }} />
                  {values.colour_accent === color.hex && (
                    <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white drop-shadow" />
                    </div>
                  )}
                </button>
              ))}
              <div className="relative group flex items-center">
                <input 
                  type="color" 
                  className="w-10 h-10 rounded-full border-2 border-transparent cursor-pointer p-0 overflow-hidden bg-transparent"
                  onChange={(e) => handleChange("colour_accent", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {enabledFields.photo_upload && (
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Reference Photo
            </Label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
              />
              <div className={cn(
                "flex flex-col items-center justify-center gap-3 border border-dashed border-border/70 rounded-xl p-8 transition-all group-hover:bg-primary/[0.03]",
                values.photo_url ? "bg-primary/[0.05] border-primary/30" : "bg-background/20"
              )}>
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : values.photo_url ? (
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">Image Ready ✓</p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Click to replace</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-foreground/20" />
                    <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest">
                      Upload Artwork
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {enabledFields.print_position && productType === "apparel" && (
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              Print Position
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {PRINT_POSITIONS.map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handleChange("print_position", pos)}
                  className={cn(
                    "px-3 py-3 text-[10px] uppercase tracking-widest font-bold rounded-lg border transition-all",
                    values.print_position === pos 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background/40 border-primary/10 text-foreground/60 hover:border-primary/30"
                  )}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
