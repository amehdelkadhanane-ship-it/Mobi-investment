CONTIX PHONE'S AND GADGETS
This version keeps the existing design, products, categories, cart, WhatsApp support and admin features. The customer wording is Order, not Pre-Order.
Payment gateway
Paystack checkout has been added. In Admin → Settings, enter your Paystack public key (pk_test_... for testing or pk_live_... for live payments), then Save.
The checkout collects the customer's name, phone, email and delivery address, then opens Paystack for payment in NGN.
Important: this is a static frontend. Paystack recommends initializing/validating transactions on a backend and never exposing a secret key in frontend code. For a production store, add a secure backend/database and verify payments server-side before fulfilling orders.
Admin
Open admin.html. Demo password: King2025
Files
index.html
cart.html
admin.html
style.css
admin-style.css
app.js
