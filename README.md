# BareNest — Bare Nest Furni Studio

The website for BareNest, a furniture studio founded by Gaurav Bahri.
Showroom inauguration: **18 June 2026.**

Built with Next.js (App Router) + TypeScript, Tailwind 4, GSAP + Lenis for
motion, Supabase for orders, and Zustand for the cart.

## Stack

- **Framework:** Next.js App Router (React 19, React Compiler)
- **Styling:** Tailwind CSS 4 (`@theme inline` tokens in `globals.css`)
- **Motion:** Lenis (smooth scroll) + GSAP (scroll-linked timelines)
- **Data:** Supabase (`@supabase/ssr`) — products mirror + orders
- **Cart:** Zustand with `persist` to localStorage
- **Fonts:** Fraunces (display) + Inter (body)

## Run locally

```bash
npm install
cp .env.example .env.local      # then fill in your Supabase URL + anon key
npm run dev
```

Open <http://localhost:3000>.

## Supabase setup

1. Create a project at <https://supabase.com>.
2. Settings → API: copy the URL and the **anon** key into `.env.local`.
3. SQL editor → paste `supabase/schema.sql` and run.

Orders are inserted from the browser at checkout (RLS allows anon inserts).
If env vars are missing, the checkout silently skips the insert and still
hands off to WhatsApp — useful for the v1 launch.

## Routes

| Path              | What it is                                                  |
| ----------------- | ----------------------------------------------------------- |
| `/`               | Landing: hero, marquee, materials, categories, featured, founder, furnishings, countdown |
| `/shop`           | Catalogue with `?cat=` and `?material=` filters             |
| `/shop/[slug]`    | Product detail + add to cart                                |
| `/cart`           | Cart with qty controls                                      |
| `/checkout`       | Form → saves to Supabase + opens prefilled WhatsApp         |
| `/story`          | Founder + materials philosophy                              |
| `/showroom`       | Inauguration info, preview reservations                     |
| `/collections`    | Curated room sets                                           |

## Product catalogue

Products live in `src/lib/products.ts`. To migrate to Supabase as the source
of truth, mirror the `Product` shape in the `products` table and swap the
import for a server fetch.

## Materials policy

**Solid wood + dense MDF only.** Particle board is refused on principle.
This rule is the brand's positioning — see `src/components/sections/materials.tsx`
and `src/app/story/page.tsx`.
