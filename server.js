require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Database = require("better-sqlite3");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const DATA = path.join(ROOT, "data");
const UPLOADS = path.join(ROOT, "uploads");

fs.mkdirSync(DATA, { recursive: true });
fs.mkdirSync(UPLOADS, { recursive: true });

const db = new Database(path.join(DATA, "store.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  brand TEXT DEFAULT '',
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  old_price INTEGER DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  condition TEXT DEFAULT 'Brand New',
  description TEXT DEFAULT '',
  specs TEXT DEFAULT '',
  images TEXT DEFAULT '[]',
  is_own INTEGER NOT NULL DEFAULT 1,
  published INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  sku TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  items TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PAYMENT_PENDING',
  payment_status TEXT NOT NULL DEFAULT 'UNPAID',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TEXT
);

CREATE TABLE IF NOT EXISTS handovers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);
`);

const defaultSettings = {
  store_name: "CONTIX PHONE'S AND GADGETS",
  tagline: "Phones, gadgets & accessories — shop with confidence.",
  currency: "NGN",
  shipping_fee: "0",
  support_email: process.env.SUPPORT_EMAIL || "",
  meta_pixel_id: process.env.META_PIXEL_ID || "",
  tiktok_pixel_id: process.env.TIKTOK_PIXEL_ID || "",
  x_pixel_id: process.env.X_PIXEL_ID || "",
  google_analytics_id: process.env.GOOGLE_ANALYTICS_ID || ""
};
for (const [k, v] of Object.entries(defaultSettings)) {
  db.prepare("INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)").run(k, v);
}

const seedProducts = [
  {
    name: "Apple iPhone 17 Pro Max 256GB",
    brand: "Apple",
    category: "Phones",
    price: 2190000,
    old_price: 2250000,
    stock: 5,
    condition: "Brand New",
    description: "Flagship iPhone 17 Pro Max with 6.9-inch display, A19 Pro performance and Pro camera system.",
    specs: "256GB • 12GB RAM • iOS 26 • 6.9-inch display • 5G • USB-C",
    images: ["https://media.btech.com/catalogs/f/f/c/b/ffcb0635488a2209f77af19d9bf32c6aab7625c4_iPhone_17_Pro_Max_Deep_Blue_PDP_Image_Position_1__en_ME.jpg"],
    is_own: 1, featured: 1, sku: "CONTIX-IP17PM-256"
  },
  {
    name: "Samsung Galaxy S26 Ultra 256GB",
    brand: "Samsung",
    category: "Phones",
    price: 1850000,
    old_price: 1950000,
    stock: 7,
    condition: "Brand New",
    description: "Premium Galaxy flagship with a large display, S Pen and multi-camera system.",
    specs: "256GB • 12GB RAM • 5G • S Pen • AMOLED display",
    images: ["https://mdsmobile.ae/cdn/shop/files/Samsung-Galaxy-S26-Ultra-5G-12GB-256GB-Cobalt-Violet.jpg"],
    is_own: 1, featured: 1, sku: "CONTIX-S26U-256"
  },
  {
    name: "Google Pixel 10 Pro 128GB",
    brand: "Google",
    category: "Phones",
    price: 1350000,
    old_price: 1450000,
    stock: 6,
    condition: "Brand New",
    description: "Pixel flagship focused on camera quality, clean Android and Google AI features.",
    specs: "128GB • 16GB RAM • 5G • OLED 120Hz • Triple rear camera",
    images: ["https://cdn.idealo.com/folder/Product/207317/5/207317591/s2_produktbild_max/google-pixel-10-pro-128gb-moonstone.jpg"],
    is_own: 1, featured: 1, sku: "CONTIX-P10P-128"
  },
  {
    name: "Oraimo PowerBox 500 50,000mAh Power Bank",
    brand: "Oraimo",
    category: "Power",
    price: 65000,
    old_price: 75000,
    stock: 15,
    condition: "Brand New",
    description: "High-capacity Oraimo power bank with fast charging and multiple outputs.",
    specs: "50,000mAh • 22.5W • 4 outputs • Type-C input/output",
    images: ["https://ke.oraimo.com/cdn/shop/files/PowerBox500.jpg"],
    is_own: 1, featured: 0, sku: "CONTIX-ORAIMO-PB500"
  },
  {
    name: "Oraimo SpaceBuds Pro ANC Earbuds",
    brand: "Oraimo",
    category: "Audio",
    price: 85000,
    old_price: 95000,
    stock: 20,
    condition: "Brand New",
    description: "Premium wireless earbuds with active noise cancellation and a charging case.",
    specs: "ANC • Bluetooth • Charging case • Touch controls",
    images: ["https://gh.oraimo.com/cdn/shop/files/SpaceBudsPro.jpg"],
    is_own: 1, featured: 0, sku: "CONTIX-ORAIMO-SBP"
  },
  {
    name: "Premium Smartwatch Series 10",
    brand: "CONTIX",
    category: "Wearables",
    price: 125000,
    old_price: 145000,
    stock: 10,
    condition: "Brand New",
    description: "Modern smartwatch with notifications, fitness features and multiple watch faces.",
    specs: "Bluetooth • Fitness tracking • Notifications • Multiple watch faces",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85"],
    is_own: 1, featured: 0, sku: "CONTIX-SW10"
  }
];

if (db.prepare("SELECT COUNT(*) AS c FROM products").get().c === 0) {
  const stmt = db.prepare(`
    INSERT INTO products
    (name,brand,category,price,old_price,stock,condition,description,specs,images,is_own,published,featured,sku)
    VALUES (@name,@brand,@category,@price,@old_price,@stock,@condition,@description,@specs,@images,@is_own,1,@featured,@sku)
  `);
  const seed = db.transaction(() => seedProducts.forEach(p => stmt.run({
    ...p, images: JSON.stringify(p.images)
  })));
  seed();
}

function getSettings() {
  const rows = db.prepare("SELECT key,value FROM settings").all();
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

function productRow(row) {
  return {
    ...row,
    images: JSON.parse(row.images || "[]"),
    is_own: Boolean(row.is_own),
    published: Boolean(row.published),
    featured: Boolean(row.featured)
  };
}

function allProducts(includeUnpublished = false) {
  const sql = includeUnpublished
    ? "SELECT * FROM products ORDER BY is_own DESC, featured DESC, datetime(created_at) DESC"
    : "SELECT * FROM products WHERE published=1 AND stock>0 ORDER BY is_own DESC, featured DESC, datetime(created_at) DESC";
  return db.prepare(sql).all().map(productRow);
}

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required." });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET || "CHANGE_ME");
    next();
  } catch {
    res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

function money(n) {
  return Number(n || 0);
}

function createReference() {
  return "CONTIX-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

async function paystack(pathname, options = {}) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  const r = await fetch("https://api.paystack.co" + pathname, {
    ...options,
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await r.json();
  if (!r.ok || data.status === false) throw new Error(data.message || "Paystack request failed.");
  return data;
}

async function aiChat(messages, adminMode = false) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const settings = getSettings();
  const products = allProducts(true).map(p => ({
    id: p.id, name: p.name, brand: p.brand, category: p.category,
    price: p.price, stock: p.stock, condition: p.condition,
    description: p.description, specs: p.specs, published: p.published
  }));

  const system = adminMode
    ? `You are the private AI assistant for the owner of ${settings.store_name}. Help the owner manage the store, analyze products/orders, draft customer replies, write product descriptions, and create marketing copy. Never reveal secrets, API keys, passwords, or internal tokens. Current store catalog: ${JSON.stringify(products)}.`
    : `You are the customer support AI for ${settings.store_name}. Be natural, helpful and concise. Use only the catalog data supplied below for product prices, availability and specifications. Never invent stock, discounts, delivery promises or policies. If the customer needs an owner/human, say that you can hand the conversation to the store team and create a handover. Store settings: ${JSON.stringify(settings)}. Catalog: ${JSON.stringify(products)}.`;

  const body = {
    model: process.env.OPENAI_MODEL,
    messages: [{ role: "system", content: system }, ...messages],
    temperature: 0.4
  };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || "AI request failed.");
  return data.choices?.[0]?.message?.content || "";
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, crypto.randomUUID() + ext);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    cb(null, allowed.includes(file.mimetype));
  }
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map(x => x.trim()) : true,
  credentials: false
}));

const apiLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-7", legacyHeaders: false });
app.use("/api/", apiLimiter);

app.post("/api/paystack/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return res.status(401).send("Invalid");
  const expected = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(req.body).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).send("Invalid");
  try {
    const event = JSON.parse(req.body.toString("utf8"));
    if (event.event === "charge.success") {
      const reference = event.data?.reference;
      if (reference) markOrderPaid(reference);
    }
    res.sendStatus(200);
  } catch {
    res.sendStatus(200);
  }
});

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true, store: getSettings().store_name }));

app.get("/api/store", (_req, res) => res.json({
  settings: getSettings(),
  products: allProducts(false)
}));

app.get("/api/products", (req, res) => {
  let products = allProducts(false);
  const q = String(req.query.q || "").trim().toLowerCase();
  const category = String(req.query.category || "").trim().toLowerCase();
  const brand = String(req.query.brand || "").trim().toLowerCase();
  const min = Number(req.query.min || 0);
  const max = Number(req.query.max || 0);
  if (q) products = products.filter(p => `${p.name} ${p.brand} ${p.description} ${p.specs}`.toLowerCase().includes(q));
  if (category) products = products.filter(p => p.category.toLowerCase() === category);
  if (brand) products = products.filter(p => p.brand.toLowerCase() === brand);
  if (min) products = products.filter(p => p.price >= min);
  if (max) products = products.filter(p => p.price <= max);
  res.json(products);
});

app.post("/api/orders", (req, res) => {
  const { customer, items } = req.body || {};
  if (!customer?.name || !customer?.email || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Customer details and cart items are required." });
  }

  const ids = items.map(x => Number(x.id)).filter(Boolean);
  const placeholders = ids.map(() => "?").join(",");
  const products = db.prepare(`SELECT * FROM products WHERE id IN (${placeholders}) AND published=1`).all(...ids);
  const byId = new Map(products.map(p => [p.id, p]));
  const normalized = [];
  let subtotal = 0;

  for (const item of items) {
    const p = byId.get(Number(item.id));
    const qty = Math.max(1, Math.min(99, Number(item.qty || 1)));
    if (!p) return res.status(400).json({ error: "One of the selected products is no longer available." });
    if (p.stock < qty) return res.status(400).json({ error: `${p.name} has only ${p.stock} unit(s) left.` });
    subtotal += p.price * qty;
    normalized.push({ id: p.id, name: p.name, price: p.price, qty, image: JSON.parse(p.images || "[]")[0] || "" });
  }

  const settings = getSettings();
  const shipping = money(settings.shipping_fee);
  const total = subtotal + shipping;
  const reference = createReference();

  db.prepare(`
    INSERT INTO orders(reference,customer_name,email,phone,address,city,state,items,subtotal,shipping,total)
    VALUES(?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    reference, customer.name.trim(), customer.email.trim(), customer.phone || "",
    customer.address || "", customer.city || "", customer.state || "",
    JSON.stringify(normalized), subtotal, shipping, total
  );

  res.json({ reference, subtotal, shipping, total, currency: settings.currency });
});

function markOrderPaid(reference) {
  const order = db.prepare("SELECT * FROM orders WHERE reference=?").get(reference);
  if (!order || order.payment_status === "PAID") return;
  const items = JSON.parse(order.items || "[]");

  const tx = db.transaction(() => {
    for (const item of items) {
      const p = db.prepare("SELECT stock FROM products WHERE id=?").get(item.id);
      if (!p || p.stock < item.qty) throw new Error("Insufficient stock for paid order.");
      db.prepare("UPDATE products SET stock=stock-?, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(item.qty, item.id);
    }
    db.prepare("UPDATE orders SET status='PAID',payment_status='PAID',paid_at=CURRENT_TIMESTAMP WHERE reference=?").run(reference);
  });
  tx();
}

app.post("/api/paystack/initialize", async (req, res) => {
  try {
    const { reference, email } = req.body || {};
    const order = db.prepare("SELECT * FROM orders WHERE reference=?").get(reference);
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (!email || email.toLowerCase() !== order.email.toLowerCase()) return res.status(400).json({ error: "Email does not match the order." });

    const data = await paystack("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: order.email,
        amount: order.total * 100,
        reference: order.reference,
        callback_url: `${process.env.SITE_URL || ""}/payment-success.html`,
        metadata: { order_reference: order.reference, customer_name: order.customer_name }
      })
    });
    res.json(data.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/paystack/verify/:reference", async (req, res) => {
  try {
    const data = await paystack(`/transaction/verify/${encodeURIComponent(req.params.reference)}`, { method: "GET" });
    if (data.data?.status === "success") markOrderPaid(req.params.reference);
    res.json(data.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
    const answer = await aiChat(messages, false);
    if (!answer) return res.json({
      answer: "I’m the CONTIX support assistant. I can help with products and orders. For anything that needs the store owner, I can hand the conversation over to the team."
    });
    res.json({ answer });
  } catch (e) {
    res.status(500).json({ error: "The AI service is temporarily unavailable." });
  }
});

app.post("/api/ai/handover", async (req, res) => {
  const { customer_name, email, message } = req.body || {};
  if (!message) return res.status(400).json({ error: "Message is required." });
  const result = db.prepare("INSERT INTO handovers(customer_name,email,message) VALUES(?,?,?)")
    .run(customer_name || "", email || "", message);
  // Email sending can be added when SMTP is configured; the handover is still safely stored.
  res.json({ ok: true, id: result.lastInsertRowid });
});

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body || {};
  const adminEmail = process.env.ADMIN_EMAIL || "admin@your-domain.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "CHANGE_THIS_NOW";
  if (email !== adminEmail || password !== adminPassword) return res.status(401).json({ error: "Invalid login details." });
  const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET || "CHANGE_ME", { expiresIn: "12h" });
  res.json({ token, email });
});

app.get("/api/admin/products", auth, (_req, res) => res.json(allProducts(true)));

app.post("/api/admin/products", auth, (req, res) => {
  const p = req.body || {};
  if (!p.name || !p.category || Number(p.price) < 0) return res.status(400).json({ error: "Name, category and valid price are required." });
  const images = Array.isArray(p.images) ? p.images : [];
  const result = db.prepare(`
    INSERT INTO products(name,brand,category,price,old_price,stock,condition,description,specs,images,is_own,published,featured,sku)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    p.name, p.brand || "", p.category, Number(p.price), Number(p.old_price || 0),
    Number(p.stock || 0), p.condition || "Brand New", p.description || "", p.specs || "",
    JSON.stringify(images), p.is_own === false ? 0 : 1, p.published === false ? 0 : 1,
    p.featured ? 1 : 0, p.sku || ""
  );
  res.json(productRow(db.prepare("SELECT * FROM products WHERE id=?").get(result.lastInsertRowid)));
});

app.put("/api/admin/products/:id", auth, (req, res) => {
  const p = req.body || {};
  const current = db.prepare("SELECT * FROM products WHERE id=?").get(Number(req.params.id));
  if (!current) return res.status(404).json({ error: "Product not found." });
  const images = Array.isArray(p.images) ? p.images : JSON.parse(current.images || "[]");
  db.prepare(`
    UPDATE products SET name=?,brand=?,category=?,price=?,old_price=?,stock=?,condition=?,description=?,specs=?,images=?,is_own=?,published=?,featured=?,sku=?,updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    p.name, p.brand || "", p.category, Number(p.price), Number(p.old_price || 0),
    Number(p.stock || 0), p.condition || "Brand New", p.description || "", p.specs || "",
    JSON.stringify(images), p.is_own ? 1 : 0, p.published ? 1 : 0, p.featured ? 1 : 0, p.sku || "",
    Number(req.params.id)
  );
  res.json(productRow(db.prepare("SELECT * FROM products WHERE id=?").get(Number(req.params.id))));
});

app.delete("/api/admin/products/:id", auth, (req, res) => {
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(Number(req.params.id));
  if (!p) return res.status(404).json({ error: "Product not found." });
  db.prepare("DELETE FROM products WHERE id=?").run(Number(req.params.id));
  res.json({ ok: true });
});

app.post("/api/admin/products/:id/images", auth, upload.array("images", 10), (req, res) => {
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(Number(req.params.id));
  if (!p) return res.status(404).json({ error: "Product not found." });
  const existing = JSON.parse(p.images || "[]");
  const urls = (req.files || []).map(f => `/uploads/${f.filename}`);
  const images = existing.concat(urls);
  db.prepare("UPDATE products SET images=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(JSON.stringify(images), p.id);
  res.json(productRow(db.prepare("SELECT * FROM products WHERE id=?").get(p.id)));
});

app.get("/api/admin/orders", auth, (_req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY datetime(created_at) DESC").all()
    .map(o => ({ ...o, items: JSON.parse(o.items || "[]") }));
  res.json(orders);
});

app.patch("/api/admin/orders/:id", auth, (req, res) => {
  const allowed = ["PAYMENT_PENDING","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];
  const status = String(req.body?.status || "");
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status." });
  db.prepare("UPDATE orders SET status=? WHERE id=?").run(status, Number(req.params.id));
  res.json(db.prepare("SELECT * FROM orders WHERE id=?").get(Number(req.params.id)));
});

app.get("/api/admin/handovers", auth, (_req, res) => {
  res.json(db.prepare("SELECT * FROM handovers ORDER BY datetime(created_at) DESC").all());
});

app.patch("/api/admin/handovers/:id", auth, (req, res) => {
  const status = req.body?.status === "CLOSED" ? "CLOSED" : "OPEN";
  db.prepare("UPDATE handovers SET status=? WHERE id=?").run(status, Number(req.params.id));
  res.json({ ok: true });
});

app.get("/api/admin/settings", auth, (_req, res) => res.json(getSettings()));

app.put("/api/admin/settings", auth, (req, res) => {
  const data = req.body || {};
  const stmt = db.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
  const tx = db.transaction(() => Object.entries(data).forEach(([k,v]) => stmt.run(k, String(v ?? ""))));
  tx();
  res.json(getSettings());
});

app.post("/api/admin/ai", auth, async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
    const answer = await aiChat(messages, true);
    res.json({ answer: answer || "Admin AI is not configured yet. Add OPENAI_API_KEY and OPENAI_MODEL to the server environment." });
  } catch {
    res.status(500).json({ error: "Admin AI is temporarily unavailable." });
  }
});

app.get("/api/admin/dashboard", auth, (_req, res) => {
  const stats = {
    products: db.prepare("SELECT COUNT(*) c FROM products").get().c,
    published: db.prepare("SELECT COUNT(*) c FROM products WHERE published=1").get().c,
    low_stock: db.prepare("SELECT COUNT(*) c FROM products WHERE stock<=3").get().c,
    orders: db.prepare("SELECT COUNT(*) c FROM orders").get().c,
    paid_orders: db.prepare("SELECT COUNT(*) c FROM orders WHERE payment_status='PAID'").get().c,
    open_handovers: db.prepare("SELECT COUNT(*) c FROM handovers WHERE status='OPEN'").get().c
  };
  res.json(stats);
});

app.use("/uploads", express.static(UPLOADS, { maxAge: "30d" }));
app.use(express.static(PUBLIC, { extensions: ["html"] }));

app.use((_req, res) => res.sendFile(path.join(PUBLIC, "index.html")));

app.listen(PORT, () => {
  console.log(`CONTIX store running on http://localhost:${PORT}`);
});
