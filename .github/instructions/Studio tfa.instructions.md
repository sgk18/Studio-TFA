---
description: Global project context, architectural rules, and coding guidelines for the Studio TFA e-commerce platform.
applyTo: '**/*.{ts,tsx,js,jsx,css,md,sql}'
---

# 🌍 Project Context: Studio TFA
You are building "Studio TFA" (The Fearlessly Authentic), a premium, mission-driven Christian creative studio and headless e-commerce platform. The aesthetic is feminine, editorial, modern, and high-end.

## 🛠️ Core Technology Stack
- **Framework:** Next.js 16+ (App Router strictly)
- **Language:** TypeScript
- **Library:** React 19
- **Styling:** Tailwind CSS v4 & Shadcn UI
- **Backend/Auth/DB:** Supabase (Auth, PostgreSQL, Storage)
- **State Management:** Zustand (with localStorage persistence for cart)
- **Motion & UX:** Framer Motion (animations), Lenis (smooth scroll)
- **Emails:** Resend

## 🎨 Design System & Branding
- **Typography:** `Bodoni Moda` for headings and `Plus Jakarta Sans` for body/UI. Never use Inter or default system fonts.
- **Color Palette (CSS Variables):**
  - `--blush`: `#E0AEBA`
  - `--rose`: `#D17484`
  - `--crimson`: `#8B263E`
  - `--gold`: `#786825`
  - `--dark`: `#292800`
  - `--cream`: `#FDF8F4`
- **Vibe:** Soft drop-shadows, sweeping negative space, large editorial imagery, elegant page transitions. Avoid rigid, generic SaaS layouts.

---

# 🧠 Strict Coding Guidelines

## 1. Next.js App Router Rules
- **Server Components by Default:** Assume all components are React Server Components (RSC) unless interactivity (hooks, state, onClick) is explicitly required. Use `"use client"` sparingly and push it down the component tree.
- **Data Mutations:** Strictly use Next.js Server Actions (`"use server"`) for database mutations. Do NOT use standard API routes (`app/api/...`) unless building a public webhook.
- **Pagination & State:** Use URL `searchParams` for server-side pagination, sorting, and filtering. Do not use `useState` for URLs.

## 2. Supabase & Database Security
- **Data Fetching:** Always use `createServerClient` for fetching data on the server. Only use `createBrowserClient` inside highly interactive client components.
- **TypeScript:** Always use the generated `Database` types from Supabase. No `any` types.
- **Row Level Security (RLS):** Always assume RLS is active. Never bypass RLS in the client. Server Actions must respect the authenticated user's session.
- **Secrets:** Never expose `service_role` keys or `NEXT_PUBLIC_` sensitive variables.
- **No Mock Data:** If a Supabase connection is requested, do not use mock data or fake placeholders. Fetch real data or clearly state a blocking issue.

## 3. Performance & UX
- **No Blank Screens:** Use React `<Suspense>` boundaries with elegant Shadcn `<Skeleton>` fallbacks for all data-fetching components.
- **Images:** Strictly use `next/image` with proper `alt` texts (vital for SEO and accessibility).
- **Smoothness:** Ensure Framer Motion animations are purposeful (e.g., page reveals, hover states) and do not cause layout shifts (CLS).

## 4. AI Execution Directives
- **Reference Skills:** When building specific modules, proactively recall the contextual rules from the local skill files (e.g., `frontend-design-skill.md`, `ecommerce-system-skill.md`).
- **Clean Code:** Ensure modular architecture. Keep components small, separate logic from UI, and remove all unused imports before finalizing a file.
- **Do Not Hallucinate DB Schema:** Always read the existing Supabase types or SQL migrations before writing queries.