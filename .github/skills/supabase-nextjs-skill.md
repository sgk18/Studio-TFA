# <img src="../assets/icons/section-badge.svg" alt="" width="16" height="16" /> Supabase & Next.js App Router Skill

## <img src="../assets/icons/section-badge.svg" alt="" width="16" height="16" /> Purpose
Write modern, secure, and highly performant database code using Next.js 16+ App Router and Supabase SSR.

---

## <img src="../assets/icons/section-badge.svg" alt="" width="16" height="16" /> 1. Data Fetching Rules
- **Server First:** Always fetch data on the server (`page.tsx` or `layout.tsx`) using `createServerClient`.
- **Client Second:** Only use `createBrowserClient` if fetching data inside a highly interactive Client Component.

## <img src="../assets/icons/section-badge.svg" alt="" width="16" height="16" /> 2. Security & Mutations
- **Server Actions ONLY:** All database mutations (INSERT, UPDATE, DELETE) MUST be handled via Next.js Server Actions (files marked with `"use server"`).
- **Never expose secrets:** Never put `NEXT_PUBLIC_` prefix on your service role key. 
- **Row Level Security (RLS):** Always assume RLS is enabled. Pass the authenticated user's ID into queries to ensure they only see their own data.

## <img src="../assets/icons/section-badge.svg" alt="" width="16" height="16" /> 3. Types
- Always generate and use Supabase TypeScript types (`Database` interface). 
- Do NOT use `any` for database returns.