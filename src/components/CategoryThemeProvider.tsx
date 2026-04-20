"use client";

import React, { useEffect, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";

type ThemeConfig = {
  primary: string;
  accent: string;
  secondary: string;
};

const CATEGORY_THEMES: Record<string, ThemeConfig> = {
  "home-decor": {
    primary: "#786825", // --gold
    accent: "#E0AEBA",  // --blush
    secondary: "#292800", // --dark
  },
  "books": {
    primary: "#E0AEBA", // --blush
    accent: "#786825",  // --gold
    secondary: "#8B263E", // --crimson
  },
  "art": {
    primary: "#8B263E", // --crimson
    accent: "#D17484",  // --rose
    secondary: "#786825", // --gold
  },
};

const DEFAULT_THEME: ThemeConfig = {
  primary: "#D17484", // --rose
  accent: "#786825",  // --gold
  secondary: "#E0AEBA", // --blush
};

export const CategoryThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const pathname = usePathname();

  const theme = useMemo(() => {
    const category = params?.category as string;
    
    // Check if we are in a sub-section that should trigger a specific theme
    if (pathname.includes("/wholesale")) {
      return CATEGORY_THEMES["art"]; // Use crimson/darker for premium wholesale
    }
    
    return CATEGORY_THEMES[category] || DEFAULT_THEME;
  }, [params?.category, pathname]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--secondary", theme.secondary);
  }, [theme]);

  return <>{children}</>;
};
