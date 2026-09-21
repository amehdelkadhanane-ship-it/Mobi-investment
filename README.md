# CONTIX PHONE'S AND GADGETS — Live Store Build

This package is intentionally built as a real full-stack store foundation, not a localStorage demo.

## What is included

- Professional storefront layout inspired by the useful patterns of large Nigerian marketplaces:
  - search
  - category navigation
  - filters
  - product cards
  - product details
  - cart
  - checkout
  - customer order creation
- Owner/admin panel:
  - login
  - add products
  - edit products
  - delete products
  - publish/unpublish
  - mark products as your own products
  - set price/old price/stock/category/condition/brand/SKU
  - upload multiple product photos
  - manage orders and order status
  - manage store settings
  - AI admin assistant
  - marketing/analytics IDs
- Customer AI support:
  - uses current store product data as context
  - instructed not to invent prices/stock
  - can direct customers to human support
  - can create a human-handover request
- Paystack server-side initialization + verification + webhook signature verification.
- Server-side secrets through .env.
- SQLite database for a practical first deployment.
- Upload directory for product images.
- No public phone number is hard-coded into the storefront.
- Seeded real product listings with externally hosted product images from manufacturer/retailer pages found online. Replace these with your own licensed/product photos before commercial launch where necessary.

## Important before going live

1. Copy `.env.example` to `.env`.
2. Set a strong `JWT_SECRET`.
3. Set a strong `ADMIN_PASSWORD`.
4. Put your Paystack secret key ONLY in `.env` on the server.
5. Put your OpenAI key ONLY in `.env` on the server.
6. Set `SITE_URL` and `CORS_ORIGIN` to your real domain.
7. Test Paystack in test mode first, then replace keys with live keys.
8. Use HTTPS.
9. Back up `data/store.db` and `uploads/`.
10. Use only product images you have permission to use commercially. The seeded images are for the build/catalog reference and should be replaced with your own supplier/manufacturer/licensed assets before launch if required.

## Run locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env
npm start
```

Open:

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin.html

The first server start creates the database and seeds the sample products.

## GitHub Pages note

GitHub Pages can host only the static frontend. This package includes a backend because a serious store needs server-side payment verification, protected admin operations, database-backed products/orders, and protected AI/API keys.

For the simplest launch, deploy the whole Node application to a Node-compatible host (Render, Railway, VPS, etc.) and connect your custom domain to it.

If you insist on keeping the storefront on GitHub Pages, set `API_BASE_URL` in `public/config.js` to the HTTPS URL of your deployed backend and configure CORS on the backend.

## Images

The seeded catalog references real product imagery online for:
- Apple iPhone 17 Pro Max
- Samsung Galaxy S26 Ultra
- Google Pixel 10 Pro
- Oraimo PowerBox 500
- Oraimo SpaceBuds Pro

These URLs are used as starting catalog images. The admin panel lets you upload your own photos and replace them.

## AI

The customer AI endpoint is `/api/ai/chat`.
The admin AI endpoint is `/api/admin/ai`.

The AI key is never sent to the browser. If no AI key is configured, the site shows a safe fallback response instead of pretending a live model is running.

## Marketing

The admin panel contains fields for Meta, TikTok, X and Google Analytics IDs. Actual advertising accounts/campaigns still belong to you and require the relevant platform credentials/approval. This build does not pretend that an ad was purchased when it was not.

## Production checklist

- [ ] Real domain connected
- [ ] HTTPS enabled
- [ ] Live Paystack public + secret keys configured on server
- [ ] Paystack webhook URL configured as `https://YOUR-DOMAIN/api/paystack/webhook`
- [ ] Strong admin password changed
- [ ] Strong JWT secret set
- [ ] OpenAI API key configured
- [ ] SMTP configured for support/handover emails
- [ ] Your own product photos uploaded
- [ ] Shipping/delivery rules finalized
- [ ] Refund/return/privacy/terms pages reviewed
- [ ] Backup strategy configured
- [ ] Test order completed with Paystack test mode
- [ ] Test admin add/edit/delete/upload/order workflow
