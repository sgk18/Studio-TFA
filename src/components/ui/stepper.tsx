"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepperStep = {
  id: string;
  title: string;
  description?: string;
};

type StepperProps = {
  steps: ReadonlyArray<StepperStep>;
  activeStep: number;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
};

export function Stepper({
  steps,
  activeStep,
  onStepChange,
  className,
}: StepperProps) {
  return (
    <ol className={cn("grid gap-2 grid-cols-2 lg:grid-cols-5", className)}>
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;
        const isClickable = typeof onStepChange === "function" && index <= activeStep;

        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onStepChange?.(index)}
              disabled={!isClickable}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
                isActive
                  ? "border-primary/70 bg-primary/10"
                  : "border-border/65 bg-card/55 hover:border-primary/40",
                !isClickable && "cursor-not-allowed opacity-75"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isComplete
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                      ? "border-primary/70 bg-primary/20 text-primary"
                      : "border-border bg-background text-foreground/65"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>

              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.18em] text-foreground/72">
                  {step.title}
                </span>
                {step.description ? (
                  <span className="mt-1 block text-xs text-foreground/60">{step.description}</span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
