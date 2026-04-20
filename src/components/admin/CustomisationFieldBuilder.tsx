"use client";

import React, { useState } from "react";
import { Plus, X, Type, List, Palette, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export type CustomField = {
  id: string;
  label: string;
  name: string;
  type: "text" | "select" | "color" | "textarea";
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string;
};

interface CustomisationFieldBuilderProps {
  value: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

export function CustomisationFieldBuilder({ value, onChange }: CustomisationFieldBuilderProps) {
  const addField = () => {
    const newField: CustomField = {
      id: Math.random().toString(36).slice(2, 9),
      label: "New Field",
      name: "new_field",
      type: "text",
      required: false,
      placeholder: "",
    };
    onChange([...value, newField]);
  };

  const removeField = (id: string) => {
    onChange(value.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<CustomField>) => {
    onChange(value.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-card/30 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/70">Personalisation Fields</h4>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={addField}
          className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
        >
          <Plus className="h-3 w-3" />
          Add Field
        </Button>
      </div>

      <div className="space-y-3">
        {value.length === 0 ? (
          <p className="py-4 text-center text-[11px] italic text-muted-foreground">No customisation fields defined.</p>
        ) : (
          value.map((field) => (
            <div key={field.id} className="relative space-y-3 rounded-lg border border-border/50 bg-background/50 p-3 pt-4">
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-foreground">Label</label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="h-8 text-sm"
                    placeholder="e.g. Inscription"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-foreground">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="text">Text Input</option>
                    <option value="textarea">Long Text</option>
                    <option value="select">Dropdown</option>
                    <option value="color">Color Choice</option>
                  </select>
                </div>
              </div>

              {field.type === 'select' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-foreground">Options (comma separated)</label>
                  <Input
                    value={field.options?.join(', ') || ''}
                    onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                    className="h-8 text-sm"
                    placeholder="e.g. Classic, Modern, Minimal"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox 
                  id={`req-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) => updateField(field.id, { required: !!checked })}
                />
                <label 
                  htmlFor={`req-${field.id}`}
                  className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 cursor-pointer"
                >
                  Mark as Required
                </label>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
