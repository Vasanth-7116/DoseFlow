# Hospital Medicine Inventory Management System — Requirements (MERN Stack)

## Tech Stack
- **MongoDB** – database for medicines, suppliers, sales, purchases, users
- **Express.js** – backend REST API framework
- **React.js** – frontend UI
- **Node.js** – backend runtime

---

## Functional Requirements

### 1. Inventory Management
- CRUD APIs for medicines (name, batch no., quantity, expiry date, price, supplier ref)
- Stock auto-update logic on sale/purchase transactions

### 2. Supplier Management
- CRUD APIs for suppliers (name, contact, address, medicines supplied)

### 3. Alerts
- Scheduled/triggered check for low-stock (quantity < threshold)
- Scheduled/triggered check for near-expiry (expiry date within N days)
- Alert data served to frontend (dashboard/notification panel)

### 4. Dashboard
- API endpoints returning aggregated data (top/least-selling medicines, stock status counts)
- React charting library to render bar charts (e.g., Chart.js or Recharts)

### 5. Reorder Suggestion Engine
- Backend logic/service that computes suggested reorder quantity using sales rate, current stock, expiry proximity
- Exposed via API, displayed on dashboard

### 6. Sales/Purchase Entry
- API to record a sale (deduct stock, calculate price)
- API to record a purchase (add stock, log supplier)
- Transaction history stored in DB

---

## Non-Functional / Setup Requirements
- **Authentication** (even basic) if login roles are included — JWT-based
- **Environment config** — `.env` for DB connection, PORT, secrets
- **API structure** — RESTful routes, organized by resource (medicines, suppliers, sales, purchases, dashboard)
- **Frontend routing** — React Router for pages (Inventory, Suppliers, Dashboard, Sales/Purchase Entry, Alerts)
- **State management** — Context API or Redux (optional, depending on app complexity)
- **Validation** — backend (e.g., express-validator) + frontend form validation
- **Error handling** — centralized error middleware in Express

---

## Suggested Folder Structure
```
project/
├── client/          (React app)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/ (API calls)
│   │   └── App.js
├── server/          (Node + Express)
│   ├── models/      (Mongoose schemas)
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
└── README.md
```

---

## Suggested MongoDB Collections (Schemas)

| Collection | Fields |
|---|---|
| **Medicines** | name, batchNo, quantity, expiryDate, price, supplierId |
| **Suppliers** | name, contact, address, medicinesSupplied |
| **Sales** | medicineId, quantitySold, totalPrice, date |
| **Purchases** | medicineId, supplierId, quantityPurchased, cost, date |
| **Users** *(if roles included)* | name, email, password, role |
