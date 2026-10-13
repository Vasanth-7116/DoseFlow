# DoseFlow — Master Implementation Plan & Progress Tracker

## Project Overview
DoseFlow is a modern MERN stack Hospital Medicine Inventory Management System backed by MongoDB Atlas. This document tracks the implementation of critical missing modules: Authentication, Authorization, Input Validation, Pagination, Export features, and Security Hardening.

---

## Progress Checklist

- [x] **Phase 1: Full-Stack Authentication & Role-Based Access Control**
  - [x] 1.1 Install backend dependencies (`bcryptjs`, `jsonwebtoken`)
  - [x] 1.2 Configure `.env` with `JWT_SECRET` and `JWT_EXPIRES_IN`
  - [x] 1.3 Create User Model (`server/models/User.js`) with password hashing
  - [x] 1.4 Create Auth Middleware (`server/middleware/auth.js` for `protect` and `authorizeRoles`)
  - [x] 1.5 Implement Auth Controller (`server/controllers/authController.js` - register, login, getMe)
  - [x] 1.6 Implement Auth Routes (`server/routes/authRoutes.js`) and mount in `server/server.js`
  - [x] 1.7 Seed demo Admin and Staff accounts in `server/seed.js`
  - [x] 1.8 Guard API endpoints across medicine, supplier, sale, and purchase routes
  - [x] 1.9 Create Client Auth Service (`client/src/services/authService.js`)
  - [x] 1.10 Update Axios Interceptors in `client/src/services/api.js` for Bearer token & 401 redirection
  - [x] 1.11 Implement `AuthContext` (`client/src/context/AuthContext.jsx`)
  - [x] 1.12 Build stunning Login & Register pages (`client/src/pages/Login.jsx`, `client/src/pages/Register.jsx`)
  - [x] 1.13 Create `ProtectedRoute` wrapper (`client/src/components/Common/ProtectedRoute.jsx`)
  - [x] 1.14 Integrate User badge and Logout button in Navbar/Sidebar
  - [x] 1.15 Update `client/src/App.jsx` routing and verify end-to-end auth flow

- [x] **Phase 2: Robust Server-Side Validation**
  - [x] 2.1 Create centralized validation error handler middleware (`server/middleware/validate.js`)
  - [x] 2.2 Add validators to Auth routes (email format, password length, role enum)
  - [x] 2.3 Add validators to Medicine routes (types, positive numbers, valid ObjectId)
  - [x] 2.4 Add validators to Supplier, Sale, and Purchase routes

- [x] **Phase 3: Pagination & Query Enhancements**
  - [x] 3.1 Add pagination support (`page`, `limit`, `totalPages`) to server controllers
  - [x] 3.2 Add pagination controls in client UI for high-volume inventory, sales, and purchases

- [x] **Phase 4: Reporting & Export Module**
  - [x] 4.1 Export Inventory, Sales, and Restock data to CSV
  - [x] 4.2 Printable clean tabular reports and CSV audit downloads

- [x] **Phase 5: Security & Performance Hardening**
  - [x] 5.1 Add HTTP security headers via `helmet`
  - [x] 5.2 Add rate limiting for auth and API endpoints (`express-rate-limit`)

- [x] **Phase 6: Hospital Staff & User Management (Admin Exclusive)**
  - [x] 6.1 Implement Admin User Management API (`POST /api/auth/users`, `PUT /api/auth/users/:id`, `DELETE /api/auth/users/:id`)
  - [x] 6.2 Safeguard administrator self-deletion and self-demotion
  - [x] 6.3 Build client API service methods in `client/src/services/authService.js`
  - [x] 6.4 Create Admin-only Staff Management UI (`client/src/pages/Staff.jsx`)
  - [x] 6.5 Integrate role-gated navigation link in Sidebar and route in `App.jsx`

---

## Detailed Specifications

### 1. Default Demo Credentials (Post-Seeding)
- **Admin**: `admin@doseflow.com` / `Admin@123` (Full CRUD + User Management)
- **Staff / Pharmacist**: `staff@doseflow.com` / `Staff@123` (View + Sales + Inventory updates)

### 2. User Schema Specification
- `name`: String (Required, trimmed)
- `email`: String (Required, unique, lowercase, trimmed)
- `password`: String (Required, bcrypt hashed, `select: false`)
- `role`: String (Enum: `admin`, `staff`, default: `staff`)
- `createdAt` & `updatedAt`: Timestamps

### 3. Client Experience Guidelines
- Premium dark mode UI matching DoseFlow design system
- Smooth micro-animations, glassmorphism cards, glowing status accents
- Clear error notifications and seamless auto-login on registration
