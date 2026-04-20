"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type CustomisationField = {
  id: string;
  type: "text" | "select" | "textarea" | "color" | "photo";
  label: string;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
};

interface CustomisationPanelProps {
  fields: CustomisationField[];
  onChange: (customisations: Record<string, any>) => void;
  className?: string;
}

export function CustomisationPanel({ fields, onChange, className }: CustomisationPanelProps) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(f => {
      initial[f.id] = f.defaultValue || "";
    });
    return initial;
  });

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  const handleChange = (id: string, value: any) => {
    setValues(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className={cn("space-y-6 glass-subpanel rounded-2xl p-6 border border-primary/20", className)}>
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Personalise this Piece ✦</h3>
        <p className="text-[11px] text-foreground/50 italic leading-relaxed">
          Each personalisation is carefully hand-rendered by our studio artists.
        </p>
      </div>

      <div className="grid gap-5">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              {field.label}
            </label>
            
            {field.type === "text" && (
              <Input
                id={field.id}
                placeholder={field.placeholder || "Your text..."}
                value={values[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="bg-background/40 border-primary/10 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 rounded-xl px-4"
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                id={field.id}
                placeholder={field.placeholder || "Enter your message or verse..."}
                value={values[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="bg-background/40 border-primary/10 text-sm min-h-[90px] focus:border-primary/40 focus:ring-1 focus:ring-primary/20 rounded-xl px-4 py-3"
              />
            )}

            {field.type === "select" && (
              <Select 
                value={values[field.id]} 
                onValueChange={(val) => handleChange(field.id, val)}
              >
                <SelectTrigger className="bg-background/40 border-primary/10 text-sm h-11 rounded-xl px-4">
                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/10 rounded-xl">
                  {field.options?.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-xs font-medium py-3">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "color" && (
              <div className="flex flex-wrap gap-3 p-1">
                {field.options?.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange(field.id, color)}
                    className={cn(
                      "group relative h-9 w-9 rounded-full border-2 transition-all p-0.5",
                      values[field.id] === color ? "border-primary scale-110 shadow-lg" : "border-transparent hover:scale-105 hover:border-primary/20"
                    )}
                  >
                    <div 
                      className="h-full w-full rounded-full shadow-inner" 
                      style={{ backgroundColor: color }}
                    />
                    {values[field.id] === color && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary text-[8px] flex items-center justify-center text-white font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {field.type === "photo" && (
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleChange(field.id, file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={cn(
                  "flex items-center justify-center gap-3 border border-dashed border-border/70 rounded-xl p-6 transition-all group-hover:bg-primary/[0.03]",
                  values[field.id] ? "bg-primary/[0.05] border-primary/30" : "bg-background/20"
                )}>
                  {values[field.id] instanceof File ? (
                    <div className="text-center">
                      <p className="text-xs font-bold text-primary truncate max-w-[200px]">
                        {values[field.id].name}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Click to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest">
                        Add Reference Photo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
