# 📚 LibraryOS - Advanced Library Management System

Welcome to **LibraryOS**, a modern, comprehensive, and scalable Library Management System. It is built to digitize and automate the day-to-day operations of libraries, offering seamless experiences for both Administrators and Members.

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Dedicated dashboards for Super Admin, Library Admin, Librarian, and Members.
- **Digital Library:** Upload, manage, and read E-Books/PDFs directly from the portal (powered by Cloudinary).
- **Physical Book Circulation:** Track issued books, due dates, renewals, and overdue fines.
- **Member Dashboard:** A personalized space for members to view their Active Membership Plans, Digital ID Cards, Borrowing Limits, and Current Reservations.
- **Payment & Subscriptions:** Integrated with Razorpay for membership renewals and fine collections.
- **Automated Notifications:** Email, SMS, and WhatsApp alerts for overdue books, reservations, and successful payments.

## 🛠️ Technology Stack

**Frontend (Client)**
- React.js (Vite)
- TailwindCSS for styling
- Redux / Context API for state management
- Axios for API requests
- Cypress for E2E testing

**Backend (Server)**
- Node.js & Express.js
- MongoDB with Mongoose (Database)
- JWT for Authentication
- Multer & Cloudinary for File Uploads
- Razorpay API

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine.

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
Create a `.env` file in the `server` directory and add your credentials (MongoDB URI, JWT Secret, Cloudinary Keys, Razorpay Keys, etc.).

Start the backend server:
```bash
npm run dev
```

### 3. Setup the Client (Frontend)
Open a new terminal and run:
```bash
cd client
npm install
npm run dev
```
The frontend will start running on `http://localhost:5173`.

## 🔐 Default Test Credentials

You can use the following credentials to explore different roles within the system:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `super@libraryos.com` | `password123` |
| **Library Admin** | `admin@cpl-01.com` | `password123` |
| **Member** | `aarav.sharma.cpl-01@example.com` | `password123` |

## 📦 Deployment
This project is deployment-ready. 
- The **frontend** can be deployed on Vercel, Netlify, or Render.
- The **backend** can be deployed on Render, Railway, or any Node.js hosting service.
- Ensure to set all the Environment Variables in your hosting provider's dashboard.

---
*Built with ❤️ for modern libraries.*
