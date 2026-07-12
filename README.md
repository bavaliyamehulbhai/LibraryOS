# 📚 LibraryOS - Multi-Tenant Library Management SaaS

Welcome to **LibraryOS**, a modern, comprehensive, and scalable Multi-Tenant Library Management SaaS platform. It is built to digitize and automate the day-to-day operations of modern libraries, offering seamless experiences for Administrators, Librarians, and Members while isolating data securely across multiple library tenants.

## ✨ Key Features

- **Multi-Tenant Architecture:** Secure data isolation (tenant-based via `libraryId`), allowing multiple libraries to operate independently on the same platform.
- **Smart Book Cataloging:** Add books manually or use the **ISBN Auto-Fill** feature which intelligently fetches book details (cover, title, pages) from external providers (Open Library/Google Books) and automatically resolves or creates Authors, Publishers, and Categories on the fly.
- **Advanced Role-Based Access Control (RBAC):** 
  - `SUPER_ADMIN`: Manages the entire SaaS platform, onboarding new libraries and configuring global limits.
  - `LIBRARY_ADMIN`: Complete control over a specific library tenant, staff, and policies.
  - `LIBRARIAN`: Manages daily circulation, members, and inventory.
  - `MEMBER`: Access to browse the catalog, view digital ID, active reservations, and borrowing history.
- **Circulation & Inventory Management:** Track issued books, due dates, renewals, overdue fines, and real-time physical copy availability.
- **Usage Tracking & Limits:** Subscription-tier limit enforcement (e.g., max books, max members) using a dedicated Usage Tracking service.
- **Digital Library & E-Books:** Upload, manage, and read E-Books/PDFs directly from the portal (powered by Cloudinary).
- **Payment & Subscriptions:** Integrated with Razorpay for membership renewals and fine collections.
- **Automated Notifications:** Email, SMS, and WhatsApp alerts for overdue books, reservations, and successful payments.
- **Premium UI/UX:** Ultra-minimalist, highly responsive design built with Tailwind CSS and dynamic micro-animations.

## 🛠️ Technology Stack

**Frontend (Client)**
- **React.js (Vite)** for lightning-fast HMR and optimized builds.
- **Tailwind CSS** for utility-first, fully responsive styling.
- **React Router DOM** for protected and role-based routing.
- **React Hook Form** for robust, performant form handling and validation.
- **Redux Toolkit** / Context API for global state management.
- **Axios** for API requests and interceptors.
- **Lucide React** for beautiful, consistent iconography.

**Backend (Server)**
- **Node.js & Express.js** for a scalable, non-blocking REST API.
- **MongoDB with Mongoose** (Database) utilizing compound indexes for tenant isolation.
- **Joi** for strict request payload validation.
- **JWT (JSON Web Tokens)** for secure stateless authentication.
- **Multer & Cloudinary** for asset and file uploads.
- **Razorpay API** for payment gateway integration.

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16+) and [Git](https://git-scm.com/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/bavaliyamehulbhai/LibraryOS.git
cd LibraryOS
```

### 2. Setup the Server (Backend)
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and configure the environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup the Client (Frontend)
Open a new terminal and run:
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory (if required) for API base URLs.

Start the frontend development server:
```bash
npm run dev
```
The frontend will start running on `http://localhost:5173`.

## 📦 Deployment
This project is built to be production-ready and deployment-friendly. 
- The **Frontend** can be seamlessly deployed on Vercel, Netlify, or AWS Amplify.
- The **Backend** can be deployed on Render, Railway, AWS EC2, or DigitalOcean App Platform.
- Ensure that all required Environment Variables are properly set in your deployment environments.

---
*Built with ❤️ for the future of library management.*
