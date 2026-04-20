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
  type: "text" | "select" | "textarea" | "color";
  label: string;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
};

interface CustomisationPanelProps {
  fields: CustomisationField[];
  onChange: (customisations: Record<string, string>) => void;
  className?: string;
}

export function CustomisationPanel({ fields, onChange, className }: CustomisationPanelProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach(f => {
      initial[f.id] = f.defaultValue || "";
    });
    return initial;
  });

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  const handleChange = (id: string, value: string) => {
    setValues(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className={cn("space-y-6 glass-subpanel rounded-2xl p-6 border border-primary/20", className)}>
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Personalise this Piece</h3>
        <p className="text-[11px] text-foreground/50">Each personalisation is carefully hand-rendered by our artists.</p>
      </div>

      <div className="grid gap-5">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">
              {field.label}
            </Label>
            
            {field.type === "text" && (
              <Input
                id={field.id}
                placeholder={field.placeholder}
                value={values[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="bg-background/50 border-primary/10 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                id={field.id}
                placeholder={field.placeholder}
                value={values[field.id]}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="bg-background/50 border-primary/10 text-sm min-h-[80px] focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
              />
            )}

            {field.type === "select" && (
              <Select 
                value={values[field.id]} 
                onValueChange={(val) => handleChange(field.id, val)}
              >
                <SelectTrigger className="bg-background/50 border-primary/10 text-sm h-10">
                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-xl border-primary/10">
                  {field.options?.map(opt => (
                    <SelectItem key={opt} value={opt.toLowerCase()} className="text-xs uppercase tracking-widest font-bold">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "color" && (
              <div className="flex gap-3">
                {field.options?.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange(field.id, color)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all p-0.5",
                      values[field.id] === color ? "border-primary" : "border-transparent"
                    )}
                  >
                    <div 
                      className="h-full w-full rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
