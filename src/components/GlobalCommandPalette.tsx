"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { createClient } from "@/utils/supabase/client";
import { resolveDisplayPrice } from "@/lib/commerce";
import { formatINR } from "@/lib/currency";
import {
  isRecord,
  readFirstString,
  resolveProductCategory,
  toNumber,
  toSlug,
} from "@/lib/catalogFilters";

type SearchProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  story: string;
};

const ROUTE_ITEMS = [
  { href: "/", label: "Homepage", keywords: ["home", "hero", "studio"] },
  {
    href: "/collections",
    label: "All Collections",
    keywords: ["shop", "catalog", "products"],
  },
  {
    href: "/collections/books",
    label: "Books Collection",
    keywords: ["books", "reading", "scripture"],
  },
  {
    href: "/collections/journals",
    label: "Journals Collection",
    keywords: ["journals", "writing", "reflection"],
  },
  {
    href: "/artists-corner",
    label: "Artists Corner",
    keywords: ["commission", "custom", "personalization", "studio"],
  },
  {
    href: "/community",
    label: "Community Gallery",
    keywords: ["reviews", "photos", "five star"],
  },
  { href: "/about", label: "About Studio TFA", keywords: ["about", "mission"] },
] as const;

export function GlobalCommandPalette({
  isWholesale = false,
}: {
  isWholesale?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [keyboardModifier, setKeyboardModifier] = useState("Ctrl");

  useEffect(() => {
    setKeyboardModifier(
      typeof navigator !== "undefined" && /mac/i.test(navigator.platform)
        ? "Cmd"
        : "Ctrl"
    );
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditableElement =
        target !== null &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (isEditableElement) {
        return;
      }

      const pressedOpenShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (pressedOpenShortcut) {
        event.preventDefault();
        setIsOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    if (!isOpen || products.length > 0 || isLoadingProducts) {
      return;
    }

    let active = true;

    const loadProducts = async () => {
      setIsLoadingProducts(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("products")
        .select("id, title, category, price, story")
        .limit(60);

      if (!active) return;

      if (error) {
        setIsLoadingProducts(false);
        return;
      }

      const nextProducts = (Array.isArray(data) ? data : [])
        .map((row) => toSearchProduct(row))
        .filter((item): item is SearchProduct => item !== null);

      setProducts(nextProducts);
      setIsLoadingProducts(false);
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [isLoadingProducts, isOpen, products.length]);

  const normalizedQuery = query.trim().toLowerCase();

  const routeMatches = useMemo(() => {
    if (!normalizedQuery) return ROUTE_ITEMS.slice(0, 6);

    return ROUTE_ITEMS.filter((item) => {
      const haystack = `${item.label} ${item.href} ${item.keywords.join(" ")}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const productMatches = useMemo(() => {
    if (!normalizedQuery) return products.slice(0, 8);

    return products
      .filter((item) => {
        const haystack = `${item.title} ${item.category} ${item.story}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 10);
  }, [normalizedQuery, products]);

  const hasResults = routeMatches.length > 0 || productMatches.length > 0;

  const navigate = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="action-pill-link gap-2 px-3.5 py-2 text-xs"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Search</span>
        <kbd className="hidden rounded-full border border-current/35 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] md:inline-flex">
          {keyboardModifier}+K
        </kbd>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0" showCloseButton={false}>
          <Command className="border-0 bg-transparent shadow-none">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/55">
                Global Search
              </p>
              <CommandShortcut>{keyboardModifier}+K</CommandShortcut>
            </div>

            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search pages, products, categories..."
              autoFocus
            />

            <CommandList className="max-h-[68vh] pb-3">
              {isLoadingProducts ? (
                <div className="px-4 py-5 text-sm text-muted-foreground">Loading products...</div>
              ) : null}

              {!isLoadingProducts && !hasResults ? (
                <CommandEmpty>No matching routes or products found.</CommandEmpty>
              ) : null}

              {routeMatches.length > 0 ? (
                <CommandGroup heading="Navigate">
                  {routeMatches.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${item.label} ${item.href}`}
                      keywords={item.keywords as string[]}
                      onSelect={() => navigate(item.href)}
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {item.href}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}

              {routeMatches.length > 0 && productMatches.length > 0 ? (
                <CommandSeparator />
              ) : null}

              {productMatches.length > 0 ? (
                <CommandGroup heading="Products">
                  {productMatches.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.title} ${item.category} ${item.story}`}
                      keywords={[item.category, toSlug(item.category)]}
                      onSelect={() => navigate(`/product/${item.id}`)}
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          {item.category}
                        </p>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                        {formatINR(resolveDisplayPrice(item.price, isWholesale))}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

function toSearchProduct(value: unknown): SearchProduct | null {
  if (!isRecord(value)) return null;

  const id = readFirstString(value, ["id"]);
  const title = readFirstString(value, ["title"]);
  const story =
    readFirstString(value, ["story", "description", "inspiration"]) ||
    "Narrative design piece from Studio TFA.";
  const category = resolveProductCategory(value);

  if (!id || !title) return null;

  return {
    id,
    title,
    category,
    story,
    price: toNumber(value.price),
  };
}
