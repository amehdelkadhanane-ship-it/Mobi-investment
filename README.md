# CONTIX PHONE'S AND GADGETS — Fresh Build

This is the fresh build/test version. It is intentionally configured for development/testing first, not public launch.

## What is included
- Responsive storefront
- Product catalog with search, categories, sorting and own-products-first ordering
- Product detail modal
- Cart and checkout flow
- Nigerian Naira pricing
- Server-side order creation using server prices/stock
- Admin authentication with JWT
- Admin product CRUD
- Multiple product image upload
- Stock, SKU, brand, condition, category, featured/published controls
- Orders dashboard and status updates
- Customer AI support endpoint (optional API key)
- Human handover requests stored in database
- Owner/admin AI endpoint (optional API key)
- Paystack test-mode integration (keys optional until payment testing)
- Webhook signature verification
- Helmet security headers, rate limiting by simple in-process guard, CORS controls
- SQLite for build/testing
- No API secrets in frontend code

## Build phase
1. Copy `.env.example` to `.env`.
2. Change `ADMIN_PASSWORD` and `JWT_SECRET`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:10000`.
6. Admin: `http://localhost:10000/admin.html`.

Do not put `.env` in GitHub.

## Deployment later
This project is designed so the same Express service can serve both storefront and backend. For the final domain, it is preferable to deploy this whole app on a Node host rather than splitting the frontend and backend unnecessarily.

SQLite and local uploads are suitable for build/testing. Before public launch, move to persistent storage/database or a host with durable volumes and verify backups.

## Payment testing
Set `PAYSTACK_MODE=test` and add Paystack test keys only when ready to test payments. Never put the secret key in `public/` or GitHub source files.
