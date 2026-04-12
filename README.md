# Studio TFA

Studio TFA (The Fearlessly Authentic) is a premium, mission-driven Christian creative studio and headless e-commerce platform built with Next.js, Supabase, and modern React tooling. The site blends editorial storytelling with commerce, allowing visitors to browse products, sign in, manage carts and checkout, submit reviews, and access role-aware admin and wholesale experiences.

## What This App Includes

- A home experience focused on brand storytelling and featured products.
- Product browsing, product detail pages, cart, and checkout flows.
- Authentication with email/password and OAuth callback handling through Supabase.
- Admin dashboards for products, orders, returns, users, and access controls.
- Wholesale and artist-facing pages with role-based visibility.
- Community, refunds, shipping, privacy policy, terms of service, and about pages.
- Email support for order confirmations and payment-related notifications.
- Supabase Storage-backed uploads for product and review photos.

## Tech Stack

- Framework: Next.js 16.2.1 with App Router
- Language: TypeScript 5
- UI: React 19, Tailwind CSS 4, shadcn/ui, Radix UI, Lucide React
- Motion: Framer Motion, Lenis, GSAP
- State: Zustand with localStorage persistence for cart state
- Backend: Supabase Auth, PostgreSQL, Storage, and SSR clients
- Email: Resend and React Email
- Payments: Razorpay integration

## Key Routes

- `/` - landing page and featured product entry point
- `/collections` and `/collections/[category]` - product browsing and category views
- `/product/[id]` - product detail, reviews, and add-to-cart actions
- `/checkout` - checkout flow
- `/login`, `/register`, `/auth/callback` - authentication flows
- `/community` - customer photo review gallery
- `/artists-corner` - artist-facing content and actions
- `/wholesale` - wholesale experience
- `/admin` - admin dashboard
- `/admin/products`, `/admin/orders`, `/admin/returns`, `/admin/users`, `/admin/access`, `/admin/custom-orders` - admin sub-sections
- `/about`, `/shipping`, `/refunds`, `/privacy-policy`, `/terms-of-service`, `/access-denied`, `/not-found`

## Project Structure

- `src/app` - App Router pages, layouts, route handlers, and server actions
- `src/components` - reusable UI components and page sections
- `src/components/admin` - admin-specific UI
- `src/components/checkout` - checkout-specific UI
- `src/lib` - shared business logic, Supabase helpers, payments, security, and utilities
- `src/actions` - server actions for cart, checkout, and custom order workflows
- `src/store` - client state stores such as the cart store
- `src/emails` - React Email templates
- `supabase` - SQL migrations and schema upgrades

## Local Development

Quick start:

1. Install dependencies with `npm install`.
2. Create `.env.local` from `.env.example`.
3. Run the app with `npm run dev`.

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Other scripts:

```bash
npm run build
npm run start
npm run lint
```

## Environment Variables

Create a `.env.local` file in the repository root and set the values required by the features you use.

Core Supabase variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` as fallback keys
- `SUPABASE_SERVICE_ROLE_KEY`

Application and auth variables:

- `NEXT_PUBLIC_SITE_URL`
- `MASTER_ADMIN_EMAIL`
- `MASTER_ADMIN_ALLOWED_IPS`

Email variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Payments variables:

- `RAZORPAY_KEY_ID` or `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

## Development Notes

- The app is built around the Next.js App Router and uses server actions for mutations.
- Supabase is used for authentication, storage, and database reads and writes.
- Admin and role-aware areas rely on server-side authorization checks.
- Public webhooks live under `src/app/api` where needed.
- The design language is editorial, minimal, and brand-led rather than a generic SaaS layout.
- Global styling and brand tokens live in `src/app/globals.css`.

## Documentation

- `DESIGN.md` describes the visual direction and narrative flow.
- `INFRASTRUCTURE-AND-PRD.md` covers the broader architecture, feature set, and platform requirements.
- `.github/instructions/Studio tfa.instructions.md` contains project-specific coding rules and conventions.

## Deployment

The project is structured for deployment on Vercel with Supabase as the backend. Before deploying, confirm that production environment variables are set and that Supabase, email, and payment webhook settings match the live domain.
