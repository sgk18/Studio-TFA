"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type CommandContextValue = {
  search: string;
  setSearch: (value: string) => void;
};

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommandContext() {
  return React.useContext(CommandContext);
}

function Command({ className, ...props }: React.ComponentProps<"div">) {
  const [search, setSearch] = React.useState("");

  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <div
        data-slot="command"
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/70 text-foreground",
          className
        )}
        {...props}
      />
    </CommandContext.Provider>
  );
}

function CommandInput({
  className,
  value,
  onChange,
  onValueChange,
  ...props
}: React.ComponentProps<"input"> & {
  onValueChange?: (value: string) => void;
}) {
  const command = useCommandContext();

  const inputValue =
    typeof value === "string" ? value : (command?.search ?? "");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;

    onChange?.(event);
    onValueChange?.(nextValue);
    command?.setSearch(nextValue);
  };

  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center gap-3 border-b border-border/70 px-4 py-3"
    >
      <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <input
        data-slot="command-input"
        value={inputValue}
        onChange={handleChange}
        className={cn(
          "h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground",
          className
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-list"
      className={cn("max-h-[24rem] overflow-y-auto p-2", className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-empty"
      className={cn("px-4 py-6 text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  heading?: React.ReactNode;
}) {
  return (
    <div data-slot="command-group" className={cn("px-2 py-1", className)} {...props}>
      {heading ? (
        <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {heading}
        </div>
      ) : null}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-separator"
      className={cn("mx-4 my-2 h-px bg-border/70", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  value = "",
  keywords = [],
  onSelect,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & {
  value?: string;
  keywords?: string[];
  onSelect?: (value: string) => void;
}) {
  const command = useCommandContext();
  const query = (command?.search || "").toLowerCase().trim();
  const haystack = `${value} ${keywords.join(" ")}`.toLowerCase();

  if (query.length > 0 && !haystack.includes(query)) {
    return null;
  }

  return (
    <button
      type="button"
      data-slot="command-item"
      className={cn(
        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          onSelect?.(value);
        }
      }}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "rounded-full border border-border/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
