# Studio TFA - Infrastructure & Product Requirements Document

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technical Stack](#technical-stack)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
5. [Project Structure](#project-structure)
6. [API Endpoints](#api-endpoints)
7. [Core Features & User Flows](#core-features--user-flows)
8. [Motion & Animation System](#motion--animation-system)
9. [Authentication & Security](#authentication--security)
10. [E-Commerce Workflow](#e-commerce-workflow)
11. [Admin Infrastructure](#admin-infrastructure)
12. [Deployment & Infrastructure](#deployment--infrastructure)
13. [Component Library](#component-library)
14. [Performance & SEO](#performance--seo)
15. [Future Roadmap](#future-roadmap)
16. [Development Guidelines](#development-guidelines)

---

## Executive Summary

**Studio TFA** is a premium e-commerce platform for Christ-centered, intentional art and lifestyle products. The application emphasizes emotional storytelling, visual minimalism, and smooth user experience through real-time inventory management, Supabase authentication, and sophisticated motion design.

**Target Audience:**
- Christian creatives seeking meaningful, faith-based home decor and art
- Identity-conscious consumers prioritizing intentional design over trends
- Gift-givers looking for curated, purpose-driven product collections

**Core Value Proposition:**
> "To create elegant, boldly minimalist, Christ-centred art and lifestyle products that nurture identity, spark conversations, and infuse homes with beauty and purpose."

---

## Technical Stack

### Frontend
| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2.1 |
| **Language** | TypeScript | 5.x |
| **Runtime** | React | 19.2.4 |
| **Styling** | Tailwind CSS | 4.x |
| **Component System** | shadcn/ui + Radix UI | ~1.3 + ~2.1 |
| **Animation** | Framer Motion | 12.38 |
| **Smooth Scroll** | Lenis | 1.3.21 |
| **Icons** | Lucide React | 1.0.1 |
| **Scroll Animation** | GSAP | 3.14.2 |

### Backend & Services
| Service | Purpose | Provider |
|---------|---------|----------|
| **Database** | PostgreSQL (SQL) | Supabase ("as-a-service") |
| **Auth** | User authentication & management | Supabase Auth |
| **Email/Notifications** | Order confirmation & newsletters | Resend |
| **File Storage** | Product images, assets | Supabase Storage / Unsplash |
| **Session Management** | Server & client state | Zustand + localStorage |

### Development Tools
| Tool | Purpose |
|------|---------|
| **Package Manager** | npm |
| **Linter** | ESLint 9 |
| **Code Style** | Tailwind CSS + Prettier (implicit) |
| **Type Checking** | TypeScript strict mode |
| **Deployment** | Vercel (recommended) |

**Key Dependency Versions:**
```json
{
  "@supabase/ssr": "^0.9.0",
  "@supabase/supabase-js": "^2.100.0",
  "@hookform/resolvers": "^5.2.2",
  "react-hook-form": "^7.72.0",
  "zod": "^4.3.6",
  "zustand": "^5.0.12",
  "recharts": "^3.8.0",
  "sonner": "^2.0.7"
}
```

---

## Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
│  (Next.js App Router + React 19 + Framer Motion + Lenis)   │
└────────────────────────────┬────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                                  │
    ┌───────▼────────┐            ┌──────────▼─────────┐
    │ Supabase Auth  │            │ Supabase Storage   │
    │ (OAuth + Email)│            │ (Product Images)   │
    └────────────────┘            └────────────────────┘
            │                              │
            └────────────────┬─────────────┘
                             │
            ┌────────────────▼────────────────┐
            │  Supabase PostgreSQL Database   │
            │                                 │
            │  • products                     │
            │  • categories                   │
            │  • reviews                      │
            │  • admin_access_settings        │
            │  • admin_access_audit           │
            └─────────────────────────────────┘
            
            ┌────────────────────────────────┐
            │ Third-Party Integrations       │
            │ • Resend (Email)               │
            │ • Google OAuth                 │
            │ • Unsplash (Images)            │
            └────────────────────────────────┘
```

### Request Flow

**Generic User Request:**
```
Browser Request
  ↓
Next.js Server
  ├─ Check auth state (middleware)
  ├─ Fetch data (Supabase client)
  └─ Render & stream HTML
     ↓
   To Client
     ↓
   Hydrate React Components
     ↓
   Initialize Framer Motion + Lenis
     ↓
   User Interaction (smooth scroll, animation)
```

**Auth Request:**
```
User submits login/signup form
  ↓
Server Action (auth/actions.ts)
  ↓
Supabase Auth.signInWithPassword() or signUp()
  ↓
OAuth redirect (if Google) → Google OAuth Handler
  ↓
Callback validation & redirect to requested page
```

---

## Database Schema

### Tables Overview

#### 1. **products**
Stores product catalog information.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  inspiration TEXT,           -- Biblical reference or story
  story TEXT,                 -- Product origin narrative
  sku TEXT UNIQUE,
  quantity_in_stock INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
```

#### 2. **categories**
Product taxonomy.

```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Predefined categories:
-- • books
-- • journals
-- • apparels
-- • home-decor
-- • stationeries-and-accessories
-- • gift-hampers
-- • custom-orders
-- • artists-corner
```

#### 3. **reviews**
User-submitted product reviews (requires auth).

```sql
CREATE TABLE reviews (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, user_id)  -- One review per user per product
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

#### 4. **admin_access_settings** (Security)
IP-based admin access control (no traditional login required).

```sql
CREATE TABLE admin_access_settings (
  id TEXT PRIMARY KEY,
  allowed_ips TEXT NOT NULL DEFAULT '127.0.0.1',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Singleton: id = 'singleton' always exists
```

#### 5. **admin_access_audit** (Compliance)
Audit trail for admin access attempts.

```sql
CREATE TABLE admin_access_audit (
  id BIGINT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT now(),
  attempted_email TEXT,
  ip_address TEXT,
  path TEXT,
  reason TEXT NOT NULL,
  user_agent TEXT
);

CREATE INDEX idx_admin_access_audit_created_at ON admin_access_audit(created_at DESC);
```

#### 6. **auth.users** (Supabase Native)
Built-in Supabase user table for authentication.

```sql
-- Managed by Supabase, not manually created
-- Contains: id, email, encrypted_password, email_confirmed_at, etc.
```

### Database Security (RLS - Row-Level Security)

**Policies Applied:**
- Public read on `products` and `categories`
- Public read on `reviews` (anyone can see)
- Authenticated users only for review creation
- IP-based master admin access to `admin_access_settings`
- Audit logging on every admin attempt

---

## Project Structure

```
studio-tfa/
├── src/
│   ├── app/
│   │   ├── (layout & main pages)
│   │   ├── layout.tsx                    # Root layout + LenisProvider
│   │   ├── globals.css                   # Lenis CSS + Tailwind imports
│   │   ├── page.tsx                      # Home (hero, mission, featured)
│   │   ├── about/page.tsx                # About page
│   │   ├── collections/page.tsx          # All products grid
│   │   ├── c/[category]/page.tsx         # Category-specific browse
│   │   ├── product/[id]/page.tsx         # Product detail + reviews
│   │   ├── login/page.tsx                # Email/password + Google OAuth
│   │   ├── register/page.tsx             # Sign up form
│   │   ├── auth/
│   │   │   ├── actions.ts                # signIn, signUp, signOut, OAuth handlers
│   │   │   └── callback/route.ts         # OAuth redirect handler
│   │   ├── admin/
│   │   │   ├── page.tsx                  # Dashboard (protected)
│   │   │   ├── products/page.tsx         # Product CRUD UI
│   │   │   ├── access/page.tsx           # IP management
│   │   │   └── actions.ts                # Admin server actions
│   │   ├── api/
│   │   │   └── admin/
│   │   │       └── access-status/route.ts # GET /api/admin/access-status
│   │   └── access-denied/page.tsx        # 403 error page
│   │
│   ├── components/
│   │   ├── (motion & animations)
│   │   ├── LenisProvider.tsx             # Global smooth scroll init
│   │   ├── ScrollReveal.tsx              # Fade + slide animation wrapper
│   │   ├── ScrollStack.tsx               # Stacking scroll effect
│   │   ├── ScrollStackItem.tsx           # (exported from ScrollStack)
│   │   ├── StaggeredText.tsx             # Word-by-word reveal
│   │   ├── ParallaxImage.tsx             # Spring-smoothed parallax
│   │   ├── HorizontalScroll.tsx          # Horizontal pan animation
│   │   │
│   │   ├── (layout)
│   │   ├── Navbar.tsx                    # Top navigation (transparency on scroll)
│   │   ├── Footer.tsx                    # Editorial footer + newsletter
│   │   │
│   │   ├── (e-commerce)
│   │   ├── AddToCartButton.tsx           # "Add to Cart" interaction
│   │   ├── CartButton.tsx                # Cart icon + count badge
│   │   ├── CartDrawer.tsx                # Slide-out cart sidebar
│   │   ├── ReviewForm.tsx                # User review submission
│   │   │
│   │   ├── (misc)
│   │   ├── WhatsAppFloat.tsx             # Floating WhatsApp button
│   │   ├── NewsletterPopup.tsx           # Newsletter signup modal
│   │   ├── PillNav.tsx                   # Pill-style navigation (unused?)
│   │   ├── StaggeredMenu.tsx             # Menu with stagger animation
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminAnalyticsDashboard.tsx
│   │   │   ├── AnalyticsCharts.tsx       # Using recharts
│   │   │   ├── ProductTable.tsx          # Admin product list
│   │   │   └── ProductFormDialog.tsx     # Add/edit product modal
│   │   │
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── sheet.tsx (drawer)
│   │       ├── sonner.tsx (toast provider)
│   │       └── ... (shadcn/ui exports)
│   │
│   ├── lib/
│   │   ├── (utilities)
│   │   ├── utils.ts                      # clsx & cn() helper
│   │   ├── currency.ts                   # formatINR() for ₹ display
│   │   ├── pageValidation.ts             # Product sanitization
│   │   ├── mockData.ts                   # Hardcoded product seed data (legacy)
│   │   │
│   │   ├── (supabase & server)
│   │   ├── analytics.ts                  # (unused?)
│   │   ├── client.ts                     # Supabase client-side instantiation
│   │   ├── server.ts                     # Supabase server-side (SSR)
│   │   ├── middleware.ts                 # Next.js middleware (auth refresh)
│   │   ├── resend.ts                     # Email service config
│   │   │
│   │   ├── security/
│   │   │   ├── adminAccessStore.ts       # Zustand IP store (client)
│   │   │   ├── masterAdmin.ts            # Client-side admin helpers
│   │   │   └── masterAdminServer.ts      # Server-side IP validation
│   │
│   ├── store/
│   │   └── useCart.ts                    # Zustand cart state (localStorage)
│   │
│   ├── emails/
│   │   └── OrderConfirmationEmail.tsx    # Resend email template
│   │
│   ├── utils/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── server.ts
│   │
│   └── proxy.ts                          # Request proxy configuration
│
├── public/
│   └── (static assets, favicon)
│
├── supabase/
│   └── admin-access-schema.sql           # Schema for admin RBAC
│
├── (configuration files)
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── PostCSS.config.mjs
├── tailwind.config.ts (implicit, Tailwind 4)
│
└── (docs)
    ├── README.md
    ├── DESIGN.md
    ├── AGENTS.md
    └── CLAUDE.md
```

---

## API Endpoints

### Public Endpoints (No Auth Required)

#### **GET /api/admin/access-status**
Check if current IP is whitelisted for admin access.

```
Request:
  GET /api/admin/access-status
  
Response (200):
{
  "allowed": true | false
}

Response (401):
{
  "allowed": false,
  "reason": "IP not whitelisted"
}

Headers:
  - Cache-Control: no-store (always fresh)
```

---

### Server Actions (Form Mutations)

All mutations are **Next.js Server Actions** (in `"use server"` directive).

#### **POST /auth/actions.ts - signIn(formData)**
Email/password sign-in.

```
Input:
  - email (string)
  - password (string)
  - next (string, optional redirect path)

Behavior:
  ✓ Success → redirect to `next` path or "/"
  ✗ Error → redirect to /login?error=<message>
```

#### **POST /auth/actions.ts - signUp(formData)**
User registration.

```
Input:
  - email (string)
  - password (string)
  - full_name (string)

Behavior:
  ✓ Success → redirect to /register?success=check_email
  ✗ Error → redirect to /register?error=<message>
  
Note: Email confirmation required before sign-in
```

#### **POST /auth/actions.ts - signInWithGoogle(formData)**
Google OAuth initiation.

```
Input:
  - next (string, optional redirect path)

Behavior:
  ✓ Initiates OAuth flow → redirects to Google consent screen
  ✓ Google callback → /auth/callback with `code` and `state`
  ✗ Error → redirect to /login?error=<message>
```

#### **POST /auth/actions.ts - signOut()**
Clears session and redirects home.

```
Behavior:
  → Supabase session cleared
  → Redirect to "/"
```

#### **POST /product/actions.ts - submitReview(payload)**
Submit product review (auth required).

```
Input:
  - productId (string, UUID)
  - rating (number, 1–5)
  - comment (string, optional)

Behavior:
  ✓ Success → revalidate /product/[id], return {success: true}
  ✗ Not signed in → return {error: "You must be signed in..."}
  ✗ DB error → return {error: <message>}
```

---

## Core Features & User Flows

### Feature 1: Browse & Search Products

**User Flow:**
1. User lands on `/collections` → see all products in grid
2. User clicks category in `/c/[category]` → filtered by category
3. Product cards show image, title, category, price
4. User clicks card → navigate to `/product/[id]` detail page

**Components Involved:**
- `ScrollReveal` (fade-in product cards)
- `ParallaxImage` (hover depth effect)
- `ProductCard` (custom product summary)

**Data Source:**
- Supabase `products` table (paginated)
- Category filtering by `category.name`

---

### Feature 2: Product Detail & Story

**User Flow:**
1. User navigates to `/product/[id]`
2. See large image with parallax scroll
3. See product title, price, category badge
4. See **"Inspiration"** section (biblical quote or story) — *unique differentiator*
5. See **"The Story"** section (product origin narrative)
6. Click "Add to Cart" button

**Components Involved:**
- `ParallaxImage` (full-width hero)
- `ReviewForm` (leave a review)
- `AddToCartButton` (add to cart CTA)
- `StarRating` (display avg rating)

**Data Source:**
- Single product by ID
- Reviews aggregated by `product_id`

---

### Feature 3: Cart Management

**State Management:** Zustand + localStorage persistence

**Cart Store Structure:**
```typescript
type CartStore = {
  items: CartItem[];           // [{id, title, price, image_url, quantity}, ...]
  isOpen: boolean;             // drawer visibility
  addItem(item): void;         // add or increment
  removeItem(id): void;
  updateQuantity(id, qty): void;
  clearCart(): void;
  openCart() / closeCart(): void;
  getTotal(): number;          // sum of (price * qty)
  getCount(): number;          // total items (by qty)
};
```

**User Flow:**
1. User clicks "Add to Cart" → item added to store, drawer opens
2. User sees cart with items + total price
3. User can adjust quantity or remove items
4. User clicks "Checkout" → (future: payment processor integration)
5. User closes drawer → state persists in localStorage

**Components:**
- `CartButton` (header icon + badge)
- `CartDrawer` (slide-out cart view)
- `AddToCartButton` (on product detail)

---

### Feature 4: User Authentication

**Auth Methods:**
1. **Email + Password** (via Supabase Auth)
2. **Google OAuth** (via Supabase + Google Cloud)

**User Flow (Email):**
1. User visits `/register` → fill form → submit
2. Confirmation email sent to inbox
3. User clicks link in email → account activated
4. User logs in at `/login` → redirected to homepage

**User Flow (Google OAuth):**
1. User clicks "Sign in with Google" button
2. Redirected to Google consent screen
3. User approves → redirected to `/auth/callback`
4. Callback validates auth code → session established
5. Redirected to requested page or homepage

**Components:**
- Custom forms in `/login` and `/register` pages
- Uses `react-hook-form` for form state
- Uses `zod` for validation

---

### Feature 5: Motion & Smooth Scrolling

**Global Smooth Scroll:**
- `LenisProvider` initialized in root layout
- Smooth wheel scrolling, anchor links, touch inertia
- Respects `prefers-reduced-motion` for accessibility

**Page Transitions:**
- `ScrollReveal` animations on section enter
- `StaggeredText` word-by-word reveal
- `HorizontalScroll` for brand values carousel
- `ScrollStack` for story journey (stacking cards)
- `ParallaxImage` on product pages

**Animation Presets:**
| Component | Timing | Easing | Distance |
|-----------|--------|--------|----------|
| ScrollReveal | 0.9s | cubic-bezier(0.22, 1, 0.36, 1) | 36px |
| StaggeredText | 0.06s stagger | spring (240 stiffness) | 26px blur |
| ParallaxImage | spring smoothed | 96 stiffness | -56 to 56px travel |
| HorizontalScroll | spring smoothed | 95 stiffness | -72% travel |

---

### Feature 6: Admin Dashboard (IP-Based Access)

**Access Control:**
- No traditional login required
- IP whitelisting via `admin_access_settings` table
- All admin requests checked against allowed IPs
- Audit trail logged to `admin_access_audit`

**Admin Pages:**
1. `/admin` → Dashboard (analytics overview)
2. `/admin/products` → CRUD for product catalog
3. `/admin/access` → Manage whitelisted IPs
4. `/admin/access/export` → Download audit logs

**Components:**
- `AdminAnalyticsDashboard` (charts via recharts)
- `ProductTable` (list with edit/delete actions)
- `ProductFormDialog` (add/edit modal)

---

## Motion & Animation System

### Global Smooth Scroll Physics (Lenis)

**Configuration:**
```typescript
{
  autoRaf: true,                    // Automatic requestAnimationFrame
  autoToggle: true,                 // Start/stop based on overflow
  anchors: { offset: 24,            // Anchor scroll offset (24px)
             duration: 1.15s (or 0.95s on touch)
             easing: (t) => 1 - Math.pow(1 - t, 4) },
  allowNestedScroll: true,          // Allow modals/drawers to scroll
  stopInertiaOnNavigate: true,      // Reset scroll on route change
  smoothwheel: true,                // Smooth mouse wheel
  syncTouch: true,                  // Mimic native touch on desktop
  lerp: 0.09 (or 0.13 on touch),    // Smoothing interpolation
  syncTouchLerp: 0.065,             // Touch inertia smoothing
  wheelMultiplier: 0.82,            // Wheel sensitivity
  touchMultiplier: 1,               // Touch sensitivity
  touchInertiaExponent: 1.65,       // Momentum decay
}
```

**Accessibility Fallback:**
- Detects `prefers-reduced-motion: reduce` on first load
- Skips smooth scroll initialization if enabled
- All animations disable when this is set

---

### Component-Level Animations

#### ScrollReveal (Section Entry)
```typescript
// Initial state (off-screen)
{ opacity: 0, scale: 0.985, filter: "blur(8px)", y: 36px }

// Final state (on-screen)
{ opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" }

// Timing
{ duration: 0.9s, delay: 0s, ease: [0.22, 1, 0.36, 1] }

// Viewport trigger
{ once: true, margin: "-12% 0px" }
```

**Customizable Props:**
- `distance` — travel distance (default 36px)
- `direction` — up, down, left, right
- `delay` — stagger delay
- `className` — additional Tailwind classes

---

#### StaggeredText (Word-by-Word)
```typescript
// Container stagger timing
{ staggerChildren: 0.06s, delayChildren: 0.05s }

// Each word (spring animation)
{
  type: "spring",
  stiffness: 240,
  damping: 24,
  mass: 0.45
}

// Entry: { opacity: 0, y: 26px, filter: "blur(7px)" }
// Exit: { opacity: 1, y: 0, filter: "blur(0px)" }
```

---

#### ParallaxImage (Scroll-Linked)
```typescript
// Vertical parallax range
rawY = useTransform(scrollProgress, [0, 1], [-56px, 56px])
y = useSpring(rawY, { stiffness: 96, damping: 24, mass: 0.38 })

// Scale breathing (subtle zoom)
rawScale = useTransform(scrollProgress, [0, 1], [1.08, 1.03])
scale = useSpring(rawScale, { stiffness: 110, damping: 30, mass: 0.32 })

// Opacity fade
rawOpacity = useTransform(scrollProgress, [0, 1], [0.93, 1])
opacity = useSpring(rawOpacity, { stiffness: 120, damping: 28, mass: 0.35 })
```

---

#### HorizontalScroll (Carousel)
```typescript
// Scroll progress smoothing
smoothProgress = useSpring(scrollYProgress, {
  stiffness: 95,
  damping: 26,
  mass: 0.35
})

// X-axis translation
x = useTransform(smoothProgress, [0, 1], ["0%", "-72%"])

// Extended viewport height for smooth scroll trigger
section height = 270vh (vs standard 250vh)
```

---

## Authentication & Security

### Supabase Auth Integration

**Providers:**
1. **Email + Password** (email verification required)
2. **Google OAuth** (Supabase + Google Cloud Console)

**Session Management:**
- Server-side session via middleware
- `@supabase/ssr` for session refresh
- Cookie-based persistence

**Middleware (lib/middleware.ts):**
```typescript
// Refreshes Supabase session on every request
// Ensures auth state stays in sync between server & client
```

---

### Admin IP Whitelisting

**Flow:**
1. Admin requests `/admin/*` or `/api/admin/*`
2. Server action calls `verifyMasterAdminAccess()`
3. Checks request IP against `admin_access_settings.allowed_ips`
4. Logs attempt (success/failure) to `admin_access_audit`
5. Returns `{ allowed: true/false }`

**Server Verification (masterAdminServer.ts):**
```typescript
export async function verifyMasterAdminAccess(options: {
  path: string;
  logDeniedAttempt?: boolean;
}): Promise<{ decision: { allowed: boolean } }>
```

---

### Row-Level Security (RLS)

**Database Policies:**
| Table | Operation | Role | Condition |
|-------|-----------|------|-----------|
| products | SELECT | anon, auth | Always allowed (public catalog) |
| categories | SELECT | anon, auth | Always allowed |
| reviews | SELECT | anon, auth | Always allowed (public comments) |
| reviews | INSERT | authenticated | User logged in + product exists |
| admin_access_settings | SELECT | anon, auth | Only if id = 'singleton' |
| admin_access_settings | UPDATE | IP-validated only | IP in allowed list |
| admin_access_audit | INSERT | anon, auth | Always allowed (audit log) |

---

## E-Commerce Workflow

### Add-to-Cart Flow

```
User clicks "Add to Cart"
  ↓
AddToCartButton component triggers
  ↓
useCart().addItem() called
  ↓
Zustand updates cart store + localStorage
  ↓
CartDrawer opens automatically
  ↓
User sees item in cart
  ├─ Adjust quantity (via CartDrawer)
  ├─ Remove item
  └─ Continue shopping or checkout
```

**Checkout Flow (To Be Implemented):**
```
User clicks "Checkout" in CartDrawer
  ↓
Redirect to /checkout
  ↓
Display order summary
  ↓
Payment gateway integration (Stripe, Razorpay, etc.)
  ↓
Create order record in DB
  ↓
Send confirmation email via Resend
  ↓
Clear cart, redirect to /order/[id]
```

---

### Currency Handling

**INR Formatting:**
```typescript
// Format any number as Indian Rupees
formatINR(1000)   // → "₹ 1,000"
formatINR(50.5)   // → "₹ 50" (rounds down, no decimals)
```

**Configuration:**
```typescript
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,  // No decimal places
});
```

---

## Admin Infrastructure

### Dashboard Overview (`/admin`)

**Widgets:**
1. Total Revenue (this month)
2. Total Orders
3. Inventory Status
4. Recent Orders (table)
5. Top Products (chart)

**Charts (via recharts):**
- Revenue trend (line chart)
- Category breakdown (pie chart)
- Order volume (bar chart)

---

### Product Management (`/admin/products`)

**Operations:**
- ✓ View all products (paginated table)
- ✓ Add new product (modal form)
- ✓ Edit product details
- ✗ Delete product (marked as inactive, not hard-deleted)

**Product Form Fields:**
- Title (string)
- Description (text)
- Category (select dropdown)
- Price (decimal)
- Inspiration (text — biblical reference)
- Story (textarea — origin narrative)
- Image URL / File upload
- Quantity in Stock (integer)
- Is Active (toggle)

---

### IP Access Management (`/admin/access`)

**View:**
- Current IP whitelist
- Formatted list of allowed IPs

**Actions:**
- Add new IP
- Remove existing IP
- View access audit log / export CSV

---

### Audit Logging (`/admin/access/export`)

**Log Entries Contain:**
- Timestamp
- IP address
- Attempted action path
- Reason (allowed/denied and why)
- User agent (for forensic analysis)

**Export Formats:**
- CSV (downloadable)
- JSON (for processing)

---

## Deployment & Infrastructure

### Hosting & CDN

| Component | Platform | Notes |
|-----------|----------|-------|
| **Frontend** | Vercel | Recommended for Next.js |
| **Database** | Supabase Cloud | PostgreSQL managed |
| **Auth** | Supabase Auth | OAuth + email magic links |
| **Storage** | Supabase Storage | Product images, fixtures |
| **Email** | Resend | Transactional & newsletters |
| **CDN** | Vercel Edge (built-in) | Image optimization via next/image |

---

### Build & Deployment Pipeline

**Development:**
```bash
npm run dev          # Starts on http://localhost:3000
npm run lint         # ESLint check
npm run build        # Build for production
```

**Production Deployment (Vercel):**
1. Push to git repository (GitHub/GitLab)
2. Vercel detects commit → automatic build
3. Runs `npm run build` + `npm run lint`
4. Deploys to global Vercel edge network
5. Automatic SSL, custom domains, analytics

**Environment Variables (Vercel):**
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Resend
RESEND_API_KEY=xxx

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Site Config
NEXT_PUBLIC_SITE_URL=https://studiotfa.com
```

---

### Database Migrations

**For Schema Changes:**
1. Update SQL in `supabase/admin-access-schema.sql` (or new file)
2. Test locally with `supabase db reset`
3. Deploy via Supabase Dashboard → SQL Editor
4. Verify RLS policies are intact

**Recommended Tool:**
- Supabase CLI for local development & migrations

---

## Component Library

### Motion Components

| Component | Purpose | Props |
|-----------|---------|-------|
| **LenisProvider** | Global smooth scroll initialization | None (applies globally) |
| **ScrollReveal** | Fade + translate on scroll | children, delay, direction, distance, className |
| **StaggeredText** | Word-by-word text reveal | text, className |
| **ParallaxImage** | Scroll-linked image parallax | src, alt, priority |
| **HorizontalScroll** | Carousel with scroll binding | children, title |
| **ScrollStack** | Stacking card effect on scroll | children, itemDistance, baseScale, etc. |

---

### UI Components (shadcn + Radix)

| Component | Usage |
|-----------|-------|
| Button | CTAs, form submissions |
| Card | Product cards, sections |
| Dialog | Modals (product form, alerts) |
| Sheet | Drawer (cart sidebar, navigation) |
| Form | Form wrapper + field helpers |
| Input | Text input fields |
| Select | Dropdown selector |
| Label | Form labels |
| Textarea | Long text input |
| Switch | Toggle controls |
| Table | Admin data tables |
| Accordion | FAQ or expandable sections |
| Chart | Recharts integration for analytics |

---

### Custom Components

| Component | Path | Purpose |
|-----------|------|---------|
| Navbar | components/Navbar.tsx | Header with scroll transparency |
| Footer | components/Footer.tsx | Editorial footer + newsletter |
| CartButton | components/CartButton.tsx | Cart icon in header |
| CartDrawer | components/CartDrawer.tsx | Slide-out cart view |
| AddToCartButton | components/AddToCartButton.tsx | "Add to Cart" CTA |
| ReviewForm | components/ReviewForm.tsx | User review submission |
| WhatsAppFloat | components/WhatsAppFloat.tsx | Floating WhatsApp chat button |
| NewsletterPopup | components/NewsletterPopup.tsx | Email signup modal |
| AdminDashboard | components/admin/AdminAnalyticsDashboard.tsx | Admin overview |
| ProductTable | components/admin/ProductTable.tsx | Admin product list |
| ProductFormDialog | components/admin/ProductFormDialog.tsx | Add/edit product modal |

---

## Performance & SEO

### Performance Optimizations

1. **Image Optimization:**
   - `next/image` for automatic optimization
   - Responsive srcset generation
   - Lazy loading by default
   - WebP format conversion (via Vercel)

2. **Code Splitting:**
   - Automatic per-route code splitting
   - Dynamic imports for heavy components
   - Lenis & Framer Motion bundled client-side

3. **Caching Strategy:**
   - Static generation (SSG) for public pages
   - ISR (Incremental Static Regeneration) for product catalog
   - Client-side caching for API responses
   - localStorage for cart state

4. **Bundle Analysis:**
   - Main bundle: ~200–250KB (gzipped)
   - Dependencies: React 19, Framer Motion, Lenis, shadcn/ui

---

### SEO Implementation

**Metadata:**
```typescript
// Root layout: site title, description, OG tags
// Product pages: dynamic title + description per item
// Category pages: category-specific meta
```

**Structured Data:**
- Product schema (JSON-LD) for e-commerce SEO
- Organization schema (Studio TFA branding)

**Sitemap & Robots:**
- Generated automatically by Next.js (if deployed on Vercel)
- `robots.txt` at `/public/robots.txt`

---

## Future Roadmap

### Phase 2: Core Enhancements
- [ ] Inventory management dashboard (real-time stock)
- [ ] Order history & tracking for users
- [ ] Wishlist / "Save for Later" feature
- [ ] Advanced search + filters (price range, tags, etc.)
- [ ] Related products recommendation

### Phase 3: Payment & Checkout
- [ ] Integration with Stripe or Razorpay
- [ ] Shipping address collection
- [ ] Discount codes & promotions
- [ ] Order confirmation email templates (via Resend)
- [ ] Invoice generation & PDF export

### Phase 4: Community & Content
- [ ] Blog / journal entries (story-driven content)
- [ ] User-generated content (customer photos, testimonials)
- [ ] Newsletter automation (Resend)
- [ ] Social proof (reviews, ratings aggregation)
- [ ] Email marketing campaigns

### Phase 5: Advanced Features
- [ ] Machine learning product recommendations
- [ ] Custom order requests (bespoke design)
- [ ] Batch orders for corporate gifting
- [ ] Analytics dashboard (traffic, conversion funnel)
- [ ] Multi-vendor marketplace (artist spotlight)

### Phase 6: International Expansion
- [ ] Multi-currency support
- [ ] Multi-language (i18n)
- [ ] Shipping integrations (USPS, DHL, etc.)
- [ ] Tax calculation per region
- [ ] Localized payment methods

---

## Development Guidelines

### Code Organization Principles

1. **Server vs. Client Components:**
   - Pages are Server Components by default
   - Use `"use client"` only where interactivity needed
   - Minimize client bundle size

2. **State Management:**
   - Global state (cart) → Zustand + localStorage
   - Component state → React hooks
   - Server state (auth) → Supabase session

3. **Data Fetching:**
   - Async Server Components for initial page load
   - client.ts for client-side queries (Supabase)
   - server.ts for server-side queries (SSR)

4. **Animation:**
   - Use Framer Motion `whileInView` for scroll triggers
   - Use Lenis `on('scroll', ...)` for custom scroll handlers
   - Always provide reduced-motion fallbacks

---

### Naming Conventions

| Category | Pattern | Example |
|----------|---------|---------|
| Components | PascalCase | `ProductCard.tsx`, `CartDrawer.tsx` |
| Pages | kebab-case (folders) | `/c/[category]/page.tsx` |
| Functions | camelCase | `formatINR()`, `verifyMasterAdminAccess()` |
| Hooks | camelCase, leading `use` | `useCart()`, `useReducedMotion()` |
| Constants | UPPER_SNAKE_CASE | `MAX_CART_ITEMS`, `SUPABASE_URL` |
| CSS classes | kebab-case (Tailwind) | `glass-panel`, `action-pill-link` |

---

### Type Safety

- Strict TypeScript mode always enabled
- Avoid `any` type (use `unknown` with guards)
- Export interfaces from component files
- Type API responses early

---

### Testing Strategy (Future)

```typescript
// Unit tests
- Logic functions (formatINR, sanitizeProductCards)
- Store mutations (useCart add/remove)

// Integration tests
- API routes (admin access verification)
- Auth flows (sign-in, OAuth callback)

// E2E tests (Playwright/Cypress)
- User workflows (browse → add to cart → checkout)
- Admin flows (product CRUD, IP management)
```

---

### Deployment Checklist

Before pushing to production:

- [ ] All ESLint warnings resolved
- [ ] TypeScript strict mode passes
- [ ] Environment variables set on Vercel
- [ ] Database migrations applied
- [ ] Auth credentials configured (Google OAuth, Supabase)
- [ ] Email templates tested (Resend)
- [ ] Images optimized & CDN configured
- [ ] Sitemap & robots.txt verified
- [ ] Analytics tracking setup
- [ ] Performance budget checked (<300KB JS)
- [ ] Mobile responsiveness tested
- [ ] Accessibility audit passed (WCAG 2.1 AA)

---

## Appendix: Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server

# Build & Deploy
npm run build            # Build for production
npm run lint             # Run ESLint

# Database (Supabase)
supabase db reset        # Reset local DB with schema
supabase db push         # Push migrations to cloud

# Git Workflow
git add src/
git commit -m "feat: add new feature"
git push origin main     # Triggers Vercel deployment
```

### Key Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
RESEND_API_KEY
NEXT_PUBLIC_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

### Important URLs

```
Development:        http://localhost:3000
Production:         https://studiotfa.com
Supabase Console:   https://app.supabase.com/
Vercel Dashboard:   https://vercel.com/dashboard
```

---

**Document Version:** 1.0  
**Last Updated:** April 9, 2026  
**Maintained By:** Studio TFA Dev Team
