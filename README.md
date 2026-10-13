# DoseFlow — Hospital Medicine Inventory Management System

**DoseFlow** is a modern full-stack MERN platform engineered for hospital pharmacies and medical centers. It solves medicine stockouts, prevents expired medication dispensing, manages supplier relationships, and uses a rule-based **Smart Suggestion Engine** to predict inventory reorders.

---

## 🚀 Key Features

### 1. Core Inventory Management
- Full CRUD operations for pharmaceutical batches (Name, Batch Code, Category, Quantity, Expiry Date, Dispense Price, Unit Cost, Supplier Reference, Reorder Threshold, Shelf Location).
- Real-time stock state badges (`In Stock`, `Low Stock`, `Out of Stock`, `Expired`).
- Search and filtering by category and stock condition.
- One-click CSV export of the active inventory catalogue.

### 2. Smart Suggestion Engine (Rule-Based Reorder Engine)
- Formulates reorder quantities per medicine by analyzing:
  - **Recent 30-Day Sales Velocity** (average daily burn rate)
  - **Lead Time Buffer** (7-day delivery horizon + 14-day safety buffer)
  - **Current Shelf Inventory & Deficit**
  - **Impending Expiry Window** (depreciates near-expiry stock from usable inventory)
- Categorizes urgency (`CRITICAL`, `HIGH`, `MEDIUM`) with explicit clinical reasons.
- One-click **"Restock"** action that pre-fills purchase orders with supplier, suggested quantity, and unit cost.

### 3. Sales & Dispensing Terminal
- Outpatient and ward dispensing with instant stock deduction.
- Live billing calculator (`Units Dispensed × Unit Price`).
- Expiry prevention: blocks dispensing of expired medicine batches.
- Stock availability validation: prevents dispensing beyond on-shelf quantity.
- Audit history logging prescription numbers, recipient wards, and timestamped transactions.

### 4. Supplier Module & Inbound Restock
- Centralized supplier directory with phone, email, and address.
- Linked inventory catalogue showing all medicines supplied by each vendor.
- Inbound shipment entry that automatically adds stock to the target medicine and updates cost records.

### 5. Clinical Alerts & Expiry Surveillance
- **Low-Stock Warnings**: Triggers when quantity falls at or below reorder threshold.
- **Near-Expiry Alerts**: Highlights batches expiring within 30–45 days for priority usage.
- **Quarantine Alerts**: Immediately flags expired medications for disposal.
- Real-time notification badge on the navigation bar.

### 6. Analytics & Dispensing Velocity Dashboard
- High-level KPIs: Total Medicines, Low Stock, Expired, Inventory Valuation ($), Total Dispensed Sales ($).
- Interactive **Dispensing Analytics & Velocity** bar chart comparing top-selling vs slowest-moving medicines.
- Stock Health Status breakdown and immediate deficit watchlist.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js & Express.js (RESTful API architecture, ES Modules)
- **Database**: MongoDB with Mongoose ODM (Auto-fallback to In-Memory MongoDB for instant zero-configuration local runs)
- **Frontend**: React 19 + Vite (Modern Dark-Mode Medical UI, Glassmorphism, CSS Custom Properties)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with global response interceptors

---

## 📂 Project Structure

```
DoseFlow/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/         # StatsCard, Modal, StatusBadge
│   │   │   └── Layout/         # Sidebar, Navbar, Layout wrapper
│   │   ├── context/            # InventoryContext (alerts, toasts, stats)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # KPI overview, Recharts, smart reorder widget
│   │   │   ├── Inventory.jsx   # Medicine catalogue, CRUD, search, CSV export
│   │   │   ├── Suppliers.jsx   # Supplier directory & linked medicines
│   │   │   ├── Sales.jsx       # Dispensing terminal with auto-calculation
│   │   │   ├── Purchases.jsx   # Restock shipment entry with stock increment
│   │   │   └── Alerts.jsx      # Categorized stock & expiry alerts
│   │   ├── services/           # Axios API wrappers
│   │   ├── App.jsx             # React Router routing
│   │   ├── index.css           # Premium medical dark-mode design system
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js          # Proxy configuration to backend (:5000)
├── server/                     # Backend Express REST API
│   ├── config/
│   │   └── db.js               # MongoDB connection with In-Memory fallback
│   ├── controllers/
│   │   ├── medicineController.js
│   │   ├── supplierController.js
│   │   ├── saleController.js
│   │   ├── purchaseController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── errorHandler.js     # Centralized error handler
│   ├── models/                 # Mongoose Schemas (Medicine, Supplier, Sale, Purchase)
│   ├── routes/                 # Express API routes
│   ├── services/
│   │   ├── alertService.js     # Low-stock & expiry monitoring logic
│   │   └── reorderService.js   # Algorithmic smart suggestion engine
│   ├── seed.js                 # Sample hospital data seeder
│   ├── server.js               # App entry point
│   └── package.json
├── MVP.md                      # Product MVP specifications
├── Requirements.md             # Functional & non-functional requirements
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Start the Backend Server
```bash
cd server
npm install
npm start
```
*Note: If no external MongoDB is running at `mongodb://127.0.0.1:27017/doseflow`, the server automatically spins up an in-memory MongoDB database and auto-seeds sample hospital medicines, suppliers, and sales.*

Backend will be active at `http://localhost:5000`.

### 3. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | KPI overview, inventory valuation, total revenue |
| `GET` | `/api/dashboard/sales-comparison` | Top & least selling medicines |
| `GET` | `/api/dashboard/alerts/low-stock` | Low-stock and depleted medicine alerts |
| `GET` | `/api/dashboard/alerts/expiry` | Near-expiry and expired medicine alerts |
| `GET` | `/api/dashboard/reorder-suggestions`| Rule-based smart reorder recommendations |
| `GET` | `/api/medicines` | Get medicines (supports `?search=`, `?category=`, `?status=`) |
| `POST` | `/api/medicines` | Add a new medicine record |
| `PUT` | `/api/medicines/:id` | Update an existing medicine record |
| `DELETE` | `/api/medicines/:id` | Remove a medicine record |
| `GET` | `/api/suppliers` | List suppliers with linked medicines |
| `POST` | `/api/suppliers` | Register a new supplier |
| `PUT` | `/api/suppliers/:id` | Update supplier details |
| `DELETE` | `/api/suppliers/:id` | Delete supplier |
| `GET` | `/api/sales` | List all dispensing transactions |
| `POST` | `/api/sales` | Record a sale & automatically deduct stock |
| `GET` | `/api/purchases` | List restock invoices |
| `POST` | `/api/purchases` | Log shipment & automatically increment stock |
