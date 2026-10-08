# 📚 LibraryOS v2.0 - Next-Gen Multi-Tenant Library Management SaaS

Welcome to **LibraryOS 2.0 (Titanium Enterprise)**, a high-performance, modern, and scalable Multi-Tenant Library Management SaaS platform. Built to digitize, automate, and streamline library operations with an enterprise-grade user interface, sub-millisecond performance caching, frictionless keyboard workflows, and multi-tenant telemetry.

---

## 🚀 What's New in v2.0 (Titanium Enterprise)

### ⚡ 1. 100% Lag-Free Performance Architecture
- **Route-Level Code Splitting:** Over 80+ application views converted to dynamic lazy loading via `React.lazy()` and `<Suspense>` with smooth fallback loaders.
- **Optimized Bundle Splitting:** Vite Rollup configured with isolated vendor chunking (`vendor-react`, `vendor-redux`, `vendor-ui`, `vendor-charts`, `vendor-pdf`) to reduce initial bundle footprint by over 65%.
- **Multi-Tier Sub-Millisecond Caching:** In-memory LRU cache with automatic TTL ensures high-frequency reads (categories, shelf locations, authors, settings) execute in `<1ms`.
- **Database Connection Pooling:** MongoDB configured with multi-tenant compound indexes and tuned connection pooling (`maxPoolSize: 50`, `minPoolSize: 5`).
- **Global Stale-While-Revalidate:** TanStack React Query configured with `staleTime: 5m` and `gcTime: 15m` to eliminate redundant network roundtrips.

### 📖 2. Public Catalog Portal (100+ Unique Books)
- **Extensive Catalog:** Public portal (`/portal`) featuring **100+ unique titles** spanning **15 distinct academic disciplines** (Computer Science, Artificial Intelligence, Astrophysics, Quantum Physics, Mathematics, Philosophy, Economics, Biomedical Science, and more).
- **Strict Zero Duplicates:** Double-verification deduplication engine matching normalized ISBN-13 and titles.
- **Instant Search & Category Filter:** Live in-memory client search (<1ms) with category filter pills and live item counters.
- **Resilient Public Book Details:** Seamless fallback rendering for individual titles without requiring user authentication.

### 🤖 3. AI Copilot & Neural Engine
- **Active Production LLMs:** Powered by high-speed inference models (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`).
- **Rich Markdown & Visual Cards:** Responses render with clean typography, styled bolding, and auto-generated **Interactive Metric Summary Cards** (Active Members, Joined This Month, Overdue Books, Available Copies).
- **Zero-Crash Local Synthesis:** Polished natural language fallback synthesizer that gracefully formats live MongoDB query results even if external cloud APIs are unavailable.

### 🛡️ 4. Stability, Workers & Offline Resilience
- **Redis-Independent Fallback:** Background queue services (Bulk Book Import & Export) automatically detect Redis availability. When Redis is inactive, operations seamlessly execute via asynchronous in-memory background processors.
- **Server Crash Guard:** Integrated handlers for `EADDRINUSE` port collisions, `unhandledRejection`, and `uncaughtException` prevent silent server termination.
- **Automated Nightly Sweeps:** Automated background cron jobs handle expired OTP cleanups, password reset token purging, and invoice dunning sweeps.

---

## ✨ Core Features

- **Multi-Tenant Architecture:** Complete data isolation per library tenant via indexed `libraryId`, allowing independent operations on a shared infrastructure.
- **Smart Book Cataloging:** Add books manually or utilize **ISBN Auto-Fill** to fetch metadata (title, cover, pages, publisher, author) with automatic related-record resolution.
- **Advanced Role-Based Access Control (RBAC):**
  - `SUPER_ADMIN`: Global platform governance, tenant onboarding, billing, and system audit logs.
  - `LIBRARY_ADMIN`: Complete tenant control over branch settings, staff members, circulation limits, and automation.
  - `LIBRARIAN`: Daily operations desk, checkouts, returns, shelf management, and inventory audits.
  - `MEMBER`: Public catalog discovery, digital library access, borrowing history, and active reservations.
- **Circulation Management:** Checkouts, returns, renewals, automated due-date calculations, late fines, and reservation queues.
- **Digital Library & E-Reader:** Upload, preview, and read digital PDF documents directly within the portal.
- **Financials & Billing:** Integrated with Razorpay for automated membership subscription billing, invoices, and fine settlements.
- **Omnichannel Alerts:** Email notification dispatching with queue processing for overdue alerts, transaction receipts, and invitations.
- **Executive Command Center:** Real-time KPI telemetry, circulation dynamics charts via Recharts, and quick-action desk.
- **Global Command Palette (`Ctrl + K` / `⌘K`):** Instant keyboard-first navigation across all catalog, circulation, analytics, and settings modules.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v7, Redux Toolkit, TanStack React Query, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, BullMQ, ioredis, Node-Cron, Nodemailer |
| **Security** | JWT Authentication, Bcrypt, Helmet, Express Mongo Sanitize, XSS-Clean, CORS, Rate Limiting |
| **Integrations** | Razorpay (Payments), Groq Cloud (AI Copilot), Cloudinary (Media Storage) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/bavaliyamehulbhai/LibraryOS.git
cd LibraryOS
```

---

### 2. Configure Backend (`server/`)
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory using the template below:

```env
# SERVER SETTINGS
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# DATABASE
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/libraryos?retryWrites=true&w=majority

# SECURITY (Use strong generated secrets)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30d
REFRESH_SECRET=your_super_secret_refresh_key_here
REFRESH_EXPIRE=30d

# REDIS (Set to true if Redis server is running, or false for in-memory fallback)
USE_REDIS=false
REDIS_URL=redis://localhost:6379

# AI COPILOT (Groq Cloud API)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# RAZORPAY (Billing & Subscriptions)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# EMAIL SETTINGS (SMTP / Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_smtp_app_password
EMAIL_FROM=your_email@domain.com

# CLOUDINARY (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend server:
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

---

### 3. Configure Frontend (`client/`)
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
The client application will start on `http://localhost:5173`.

---

## 📡 API Health & Readiness Endpoints

- **Health Check:** `GET /api/v1/health` → Returns `{"status":"UP"}`
- **Database Readiness:** `GET /api/v1/readiness` → Returns `{"status":"READY","database":"Connected"}`
- **Public Catalog:** `GET /api/v1/public/books` → Lists all available public catalog titles
- **Public Categories:** `GET /api/v1/public/categories` → Lists distinct categories with live book counts

---

## 🔒 Security Best Practices

> [!IMPORTANT]
> - Never commit real credentials, database passwords, or secret keys to version control.
> - Ensure all `.env` files are added to your `.gitignore`.
> - In production environments, always set `NODE_ENV=production` and use SSL/TLS encryption for database connections.

---

## 📄 License
This project is licensed under the ISC License.

*Built with ❤️ for modern libraries and learning communities.*
