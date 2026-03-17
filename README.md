# Vendoor — Next.js 14 Frontend

Nigeria's campus marketplace. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Zustand**, wired to the Vendoor PHP backend at `vendoor.ng`.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand (persisted) |
| HTTP | Axios + auto JWT refresh interceptor |
| Payments | Paystack inline.js |
| Fonts | Syne (display) + Manrope (body) |
| Toast | react-hot-toast |
| Icons | lucide-react |

---

## Project Structure

```
src/
├── app/
│   ├── buyer/                  # Buyer storefront
│   │   ├── page.tsx            # Homepage
│   │   ├── category/[slug]/    # Product listing with filters
│   │   ├── product/[uuid]/     # Product detail
│   │   ├── vendor/[uuid]/      # Vendor profile
│   │   ├── vendors/            # All vendors
│   │   ├── categories/         # All categories
│   │   ├── search/             # Search results
│   │   ├── checkout/           # Checkout + Paystack
│   │   └── success/            # Order success + tracker
│   └── vendor/                 # Vendor portal
│       ├── register/           # Registration
│       ├── login/              # Sign in
│       ├── pending/            # Awaiting approval
│       ├── dashboard/          # Full dashboard (tabs)
│       └── forgot-password/
│
├── components/
│   ├── buyer/                  # BuyerHeader, CartDrawer, SignInSheet, ProductCard, BottomNav
│   ├── vendor/                 # DashboardLayout
│   └── ui/                     # Button, Input, Stars, Skeleton
│
├── hooks/
│   ├── useProducts.ts          # useProducts, useProduct, useSearch, useVendors
│   └── useCart.ts              # Optimistic cart + API sync
│
├── lib/
│   ├── axios.ts                # Axios instance + JWT interceptors + refresh
│   ├── api.ts                  # All API service functions
│   └── utils.ts                # ngn(), parseImages(), getDeviceInfo(), etc.
│
├── store/
│   ├── auth.ts                 # Buyer auth (Zustand + cookies)
│   ├── vendorAuth.ts           # Vendor auth (Zustand + cookies)
│   ├── cart.ts                 # Cart state (persisted)
│   └── ui.ts                   # Cart drawer / sign-in sheet open state
│
└── types/
    └── index.ts                # All TypeScript interfaces
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
# Add your Paystack public key
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/buyer`.

Vendor portal: [http://localhost:3000/vendor](http://localhost:3000/vendor)

---

## API Base URLs

All requests go to `https://vendoor.ng/store/api/`.

| Endpoint | Purpose |
|----------|---------|
| `POST /ecommerce` | All product, cart, order, vendor actions |
| `POST /signin` | Buyer + vendor login |
| `POST /refresh-jwt` | Token refresh (called automatically) |
| `POST /update-profile` | Profile update |
| `POST /upload-image` | Base64 image upload → URL |
| `POST /forgot-password` | Password reset step 1 |
| `POST /reset-password` | Password reset step 2 |

---

## JWT Token Management

The app automatically:
1. Stores JWT in cookies (`vd_jwt`, `vd_expiry`, `vd_refresh`, `vd_uuid`)
2. Checks token expiry on **every request** via Axios interceptor
3. Refreshes automatically when `expiry - now < 5 minutes`
4. Retries failed 401 requests once with the refreshed token
5. Clears auth and redirects to sign-in on persistent 401

---

## Cart Behaviour

- **Guest users**: Cart stored in Zustand (persisted to `localStorage`)
- **Logged-in users**: Optimistic local update → synced to `/ecommerce` API
- On login: `syncFromServer()` merges server cart with local cart

---

## Payment Flow (Paystack)

1. User fills checkout form
2. Billing address saved via `save_billing` API
3. Paystack inline.js loaded dynamically
4. On payment success: `checkout` API called with `payment_txn` reference
5. Cart cleared → redirect to `/buyer/success`

---

## Deployment (Vercel)

```bash
# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_PAYSTACK_KEY=pk_live_xxx
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Push to GitHub → connect to Vercel → done.

---

## Key Design Decisions

- **No Redux** — Zustand is lighter and works perfectly with Next.js App Router
- **No server actions** — All data fetching client-side to match PHP backend architecture
- **Optimistic cart** — Cart updates instantly; API sync is fire-and-forget
- **Two separate auth stores** — Buyer and vendor tokens are kept completely isolated
- **`'use client'`** only where needed — layout components are server by default
