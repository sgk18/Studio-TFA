# Studio TFA - Frontend Architecture & Narrative Flow

## Brand Identity & Aesthetic
- **Vibe:** Editorial, intentional, and emotionally resonant. Purposeful simplicity to let the truth of the products speak louder than trends.
- **Color Palettes:**
  - *Primary/Accents:* `#E0AEBA`, `#D17484`, `#8B263E`
  - *Earth Tones/Secondary:* `#786825`, `#292800`
- **Typography:** Sophisticated serif for storytelling headings, clean sans-serif for product details and UI elements.
- **Design Principles:** Use massive amounts of negative space to pace the user's reading experience.

## Narrative Flow & Required Pages

### 1. `/` - The Prologue (Home Page)
Flows chronologically:
- **Hero (Vision):** Large, bold, minimalist text revealing the vision.
- **The Mission:** Text-driven section with massive negative space.
- **Featured Collection:** Asymmetrical layout. Sticky text sidebars that remain on screen telling the brand values while images scroll past.
- **Artist Spotlight:** Editorial-style wrap-up before the footer.

### 2. `/journal` - The Stories
- A blog/editorial section spanning deep dives into identity, inner healing, and the creative process.

### 3. `/collections` & `/collections/[category]` - The Gallery
- Product browsing, styled like an art exhibition.
- Avoid standard 4-column product grids. Use asymmetrical layouts, stagger imagery to create a meandering visual path.

### 4. `/product/[id]` - The Artwork
- Prioritizes emotional meaning.
- Includes an "Inspiration" or "The Story Behind the Art" text block *before* showing the price and "Add to Cart" button.

## Component Structure

- **Layout & Navigation:**
  - `Navbar`: Transparent and minimalist initially; changes background color upon scrolling.
  - `Footer`: Comprehensive editorial-style footer with newsletter sign-up and brand links.

- **Storytelling & Animations:**
  - `ScrollReveal`: A generic Framer Motion wrapper (opacity 0 -> 1, y-axis translation) to gently slide up text blocks and images exactly as they enter the viewport.
  - `StickySidebar`: UI component that keeps text anchored in one column while the companion imagery scrolls in the adjacent column.

- **E-Commerce:**
  - `ProductCard`: A unique card integrating the art, title, and a snippet of the "story" prior to price.
  - `StorytellingSection`: A prominent component specifically for rendering the "Inspiration" string field.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (configured with brand hex codes)
- **UI Components:** Shadcn UI + Lucide React
- **Animations:** Framer Motion
- **State/Data:** Hardcoded mock JSON data in `lib/mockData.ts`
