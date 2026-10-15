# DOSEFLOW: SYSTEM OVERVIEW, ARCHITECTURE, WORKFLOWS & VIVA GUIDE

**Project Title**: DoseFlow: Intelligent Pharmacy Inventory & Clinical Dispensing Management System  
**Student Name**: N. Vasanth (310624205295)  
**Department**: Department of Information Technology (IT)  
**College**: Easwari Engineering College, Chennai  
**Supervisor**: Grandhi Sai Lakshmi  
**Head of Department**: Dr. Anandhi  
**Tech Stack**: MERN (MongoDB, Express.js, React.js 19 + Vite, Node.js)  
**Submission Date**: October 2026  

---

## 1. Executive Summary & Clinical Problem Context

### What is DoseFlow?
**DoseFlow** is an intelligent, full-stack pharmaceutical inventory and clinical dispensing management system built on the **MERN** stack (MongoDB, Express.js, React.js 19, Node.js). It bridges the operational gap between **hospital procurement (supplier restocks)**, **shelf inventory control**, and **patient dispensing (sales)** in a hospital or retail pharmacy.

### Why was it built?
Traditional pharmacies rely on manual registers or disconnected spreadsheets, leading to three fatal risks:
1. **Stockouts**: Discovering a medicine is out of stock only when an emergency patient needs it.
2. **Hazardous Expiry Dispensing**: Accidentally giving expired medicines to patients due to lack of point-of-sale safeguards.
3. **Expired Restock Confusion**: When adding new stock to an expired drug, naive systems only increment the counter without updating the expiration date, leaving the drug marked as expired.

DoseFlow replaces manual guesswork with **deterministic mathematical models**, **dynamic velocity reorders**, and **strict point-of-sale clinical lockouts**.

---

## 2. System Architecture & Tech Stack

DoseFlow uses a **3-Tier Decoupled Client-Server Architecture**:

```
+-------------------------------------------------------------------------+
|                        PRESENTATION TIER (Frontend)                     |
|  • React.js 19 (SPA with Vite bundler)                                  |
|  • Context API (AuthContext, InventoryContext) for global state         |
|  • Axios HTTP client with Bearer Token interceptors                     |
|  • Medical Dark Theme (Curated CSS custom tokens, glassmorphism cards)  |
+------------------------------------+------------------------------------+
                                     | JSON over REST APIs
                                     v
+-------------------------------------------------------------------------+
|                        APPLICATION TIER (Backend)                       |
|  • Node.js (v20+ LTS runtime) & Express.js server                       |
|  • Stateless Authentication: JSON Web Tokens (JWT) & BCrypt passwording |
|  • Input validation pipelines: express-validator                        |
|  • Business Logic: reorderService, alertService, controllers            |
+------------------------------------+------------------------------------+
                                     | Mongoose ODM (TCP)
                                     v
+-------------------------------------------------------------------------+
|                           DATA TIER (Database)                          |
|  • MongoDB (Cloud Atlas / In-Memory fallback for testing)               |
|  • 5 Collections: users, medicines, suppliers, purchases, sales         |
|  • Compound Indexing: name, batchNo, category, expiryDate               |
+-------------------------------------------------------------------------+
```

---

## 3. Project Directory Structure

```
DoseFlow/
│
├── server/                              # BACKEND REST API
│   ├── config/
│   │   └── db.js                        # MongoDB Mongoose connection with error exit
│   ├── controllers/
│   │   ├── authController.js            # User signup, password hashing, JWT generation
│   │   ├── medicineController.js        # Medicine CRUD, search, filter & removeFromShelf
│   │   ├── purchaseController.js        # Inbound restock, batch code & expiry date renewal
│   │   ├── saleController.js            # Dispense POS, atomic stock decrement & expiry lockout
│   │   ├── supplierController.js        # Vendor directory & supplied medicine mapping
│   │   └── dashboardController.js       # KPI metrics & analytics aggregation
│   ├── middleware/
│   │   ├── auth.js                      # Token verification (protect) & Role authorization
│   │   ├── errorHandler.js              # Centralized HTTP error handling
│   │   └── validate.js                  # express-validator result handler
│   ├── models/                          # MONGOOSE DATA SCHEMAS
│   │   ├── User.js                      # Admin/Pharmacist credentials & bcrypt pre-save hook
│   │   ├── Medicine.js                  # Drug details, batchNo, expiryDate, shelfLocation
│   │   ├── Supplier.js                  # Vendor contact details & supplied medicine IDs
│   │   ├── Purchase.js                  # Inbound restock transaction & invoice history
│   │   └── Sale.js                      # Outpatient/ward dispense records & prescription ref
│   ├── routes/                          # EXPRESS ROUTE MOUNTS
│   │   ├── authRoutes.js                # /api/auth (login, register)
│   │   ├── medicineRoutes.js            # /api/medicines
│   │   ├── purchaseRoutes.js            # /api/purchases
│   │   ├── saleRoutes.js                # /api/sales
│   │   ├── supplierRoutes.js            # /api/suppliers
│   │   └── dashboardRoutes.js           # /api/dashboard (stats, reorders, alerts)
│   ├── services/                        # CLINICAL ALGORITHMS
│   │   ├── alertService.js              # Expiry count & threshold alerts
│   │   └── reorderService.js            # 30-day velocity, lead-time horizon & order sizing
│   ├── seed.js                          # Database seeding script for sample clinical data
│   ├── .env                             # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json                     # Server dependencies
│   └── server.js                        # Main Express entry point & middleware mounting
│
└── client/                              # FRONTEND REACT SPA
    ├── src/
    │   ├── components/
    │   │   ├── Common/                  # Modal, Pagination, StatsCard, StatusBadge
    │   │   └── Layout/                  # Navigation bar & Sidebar
    │   ├── context/
    │   │   ├── AuthContext.jsx          # Login/Logout state & token persistence
    │   │   └── InventoryContext.jsx     # Global refresh triggers & toast notifications
    │   ├── hooks/
    │   │   └── useDebounce.js           # Debounced input for live search efficiency
    │   ├── pages/                       # APPLICATION VIEWS
    │   │   ├── Dashboard.jsx            # Real-time KPIs, charts & reorder suggestions
    │   │   ├── Inventory.jsx            # Medicine master table, batch CRUD, shelf removal
    │   │   ├── Sales.jsx                # Point-of-Sale terminal with live bill calculator
    │   │   ├── Purchases.jsx            # Inbound restock form with batch renewal & CSV export
    │   │   ├── Alerts.jsx               # Clinical expiry watch & "Remove from Shelf" buttons
    │   │   ├── Suppliers.jsx            # Vendor directory management
    │   │   ├── Staff.jsx                # User role management (Admin only)
    │   │   └── Login.jsx                # Secure login screen
    │   ├── services/                    # API CALL CLIENTS
    │   │   ├── api.js                   # Axios instance with auth token headers
    │   │   ├── authService.js           # Auth endpoint callers
    │   │   ├── medicineService.js       # Medicine CRUD & removeFromShelf callers
    │   │   ├── purchaseService.js       # Purchase & restock callers
    │   │   └── saleService.js           # Dispensing sales callers
    │   ├── App.jsx                      # Route definitions & protected route guards
    │   ├── index.css                    # Design system (HSL colors, glassmorphism, responsive grid)
    │   └── main.jsx                     # React DOM entry point
    ├── package.json                     # Client dependencies (React 19, Lucide, Recharts)
    └── vite.config.js                   # Vite configuration & dev server proxy
```

---

## 4. Database Schema Design & Relationships

DoseFlow uses five interconnected Mongoose schemas:

```
+---------------+             +------------------+             +-----------------+
|   Supplier    | 1         N |     Medicine     | 1         N |      Sale       |
|---------------|-------------|------------------|-------------|-----------------|
| _id           |             | _id              |             | _id             |
| name          |             | name             |             | medicineId (FK) |
| contactPerson |             | batchNo          |             | quantitySold    |
| email, phone  |             | category         |             | unitPrice       |
| address       |             | quantity         |             | totalPrice      |
+---------------+             | price, unitCost  |             | patientOrBuyer  |
        | 1                   | expiryDate       |             | prescriptionNo  |
        |                     | shelfLocation    |             | date            |
        | N                   | reorderThreshold |             +-----------------+
+---------------+             | supplierId (FK)  |
|   Purchase    |             +------------------+
|---------------|                      | 1
| _id           |                      |
| supplierId(FK)|                      | N
| medicineId(FK)|----------------------+
| qtyPurchased  |
| unitCost      |
| batchNo       |
| expiryDate    |
| invoiceNo     |
+---------------+
```

1. **`User`**: Tracks `name`, `email`, `password` (hashed via BCrypt), and `role` (`'admin'` or `'pharmacist'`).
2. **`Medicine`**: Stores on-shelf inventory (`quantity`), clinical batch identifier (`batchNo`), `expiryDate`, `price` (dispensing price), `unitCost` (wholesale purchase price), `shelfLocation` (e.g., `'Rack A-01'`), and minimum threshold (`reorderThreshold`).
3. **`Supplier`**: Stores company name, contact person, phone, email, and the array of `medicinesSupplied`.
4. **`Purchase`**: Records inbound inventory shipments with `invoiceNo`, `batchNo`, `expiryDate`, `quantityPurchased`, and `totalCost`.
5. **`Sale`**: Records outpatient/ward sales transactions with `patientOrBuyer`, `prescriptionNo`, `quantitySold`, and `totalPrice`.

---

## 5. Core End-to-End Workflows

### Workflow 1: Authentication & Role-Based Authorization
1. Staff member enters email and password on `/login`.
2. Backend searches the `User` collection. BCrypt compares the plain password with the stored hash using `bcrypt.compare()`.
3. If valid, the server signs a **JSON Web Token (JWT)** containing `{ id, role }` and returns it.
4. The client stores the token in `localStorage`. All subsequent requests automatically attach `Authorization: Bearer <token>` via Axios request interceptors in `api.js`.
5. Administrative routes (like deleting a drug or viewing staff lists) are protected on the backend using the `authorize('admin')` middleware.

---

### Workflow 2: Inbound Restock with Batch & Expiry Renewal
*(This solves the exact problem where restocking an expired drug previously left it marked as expired).*

```
Pharmacist selects expired drug -> React auto-fills future expiry & new batch
         |
         v
Pharmacist enters Qty, Cost & Invoice -> Submits Form
         |
         v
POST /api/purchases { medicineId, quantityPurchased, batchNo, expiryDate, unitCost }
         |
         v
Backend updates Medicine document:
  • medicine.quantity += quantityPurchased
  • medicine.batchNo = newBatchNo
  • medicine.expiryDate = new Date(expiryDate)     <-- (Future Date!)
  • medicine.shelfLocation = 'Main Storage'         <-- (Restored from Quarantine!)
         |
         v
Backend creates immutable Purchase record
         |
         v
HTTP 201 Created -> Status badge on Dashboard & Inventory flips to "In Stock" (Green)
```

---

### Workflow 3: Clinical Dispensing & POS with Expiry Lockout
1. A pharmacist navigates to the **Sales Terminal** (`/sales`).
2. Pharmacist selects a medication (e.g., *Amoxicillin 500mg*).
3. The interface displays live available stock (`medicine.quantity`) and price.
4. When submitting the dispense transaction:
   * **Backend Expiry Lockout**:
     ```javascript
     const now = new Date();
     if (new Date(medicine.expiryDate) < now) {
       return res.status(400).json({
         success: false,
         message: `Cannot sell expired medicine (${medicine.name}). Expiry was ${medicine.expiryDate}.`
       });
     }
     ```
   * **Stock Availability Check**: Verifies `medicine.quantity >= quantitySold`.
   * **Atomic Stock Deduction**: Decrements `medicine.quantity -= quantitySold`.
   * **Receipt Creation**: Generates an auditable `Sale` record linking patient name and prescription reference number.

---

### Workflow 4: Batch Expiry Monitoring & "Remove from Shelf" Decommissioning
1. The **Alerts Engine** (`/alerts`) continuously calculates `diffDays = (expiryDate - today)`.
2. Any batch where `diffDays <= 0` is flagged as **"Quarantined from Dispense"** (Red Alert).
3. In Good Pharmacy Practice, degraded stock cannot sit on active racks. The pharmacist clicks **"Remove from Shelf"**:
   * Calls `PUT /api/medicines/:id/remove-from-shelf`.
   * Sets `medicine.quantity = 0`.
   * Reassigns `medicine.shelfLocation = 'Quarantine Bay (Disposed)'`.
   * The system logs the removal and updates the card to `"Decommissioned (0 units)"`.
4. When fresh stock arrives, clicking **"Restock New Batch"** takes them directly to Purchases with renewal prefilled.

---

### Workflow 5: Dynamic Reorder Point (Smart Reorder Engine)
Rather than using static arbitrary thresholds, DoseFlow uses a dynamic supply-chain algorithm:

$$\mathbf{Target\ Inventory\ Level} = \lceil d \times (L + SS) \rceil$$

* **$d$ (Daily Demand Velocity)**: Average sales per day over the last 30 days:
  $$d = \max\left(\frac{\text{Sales in 30 Days}}{30},\; \frac{\text{reorderThreshold}}{30} \times 0.4\right)$$
* **$L$ (Lead Time)**: $7\text{ days}$ (time taken for suppliers to ship).
* **$SS$ (Safety Stock Buffer)**: $14\text{ days}$ (buffer against demand spikes).
* **Total Planning Horizon**: $7 + 14 = \mathbf{21\text{ days}}$.

#### Restock Alert Trigger:
An alert is raised if **Current Usable Stock $\le$ Threshold** OR **Current Usable Stock < Target Inventory Level**.

#### Suggested Order Quantity:
$$Q_{\text{reorder}} = \max\Big(\text{Target Level} - \text{Effective Stock},\; (2 \times \text{Threshold}) - \text{Effective Stock},\; 25\Big)$$

---

## 6. Detailed Feature Highlights

| Feature | Technical Implementation | Value to Hospital |
| :--- | :--- | :--- |
| **Real-Time KPI Dashboard** | MongoDB aggregation pipeline (`$match`, `$group`, `$sum`) + Recharts | Executive overview of total stock valuation, revenue, and active alerts. |
| **Debounced Live Search** | Custom `useDebounce` hook (300ms delay) | Searches medicine name and batch number instantly without overloading API. |
| **Color-Coded Status Badges** | `StatusBadge.jsx` computing dynamic date differences | Immediate visual triage: Green (In Stock), Amber (Low Stock / Expiring), Red (Expired). |
| **Quarantine Blockade** | Strict validation in `saleController.js` | 100% mathematical guarantee that expired lots cannot be dispensed to patients. |
| **One-Click Shelf Removal** | Dedicated `PUT /:id/remove-from-shelf` endpoint | Decommissions degraded inventory off active shelves to quarantine disposal. |
| **Batch Expiry Renewal** | Inbound restock controller updating `expiryDate` + `batchNo` | Restocking seamlessly brings expired medications back to safe dispensing status. |
| **CSV Export Utilities** | Client-side blob generation (`encodeURI`) | Instant one-click CSV export of inventory master tables and purchase invoice logs. |

---

## 7. Quick Viva-Voce Cheatsheet (Questions & Answers)

### Q1: "What technology stack did you use and why?"
> **Answer:** "I used the **MERN** stack: React 19 for a fast, responsive Single Page Application, Node.js and Express.js for the asynchronous RESTful API layer, and MongoDB with Mongoose ODM for scalable, schema-validated document persistence. MERN provides full-stack JavaScript unity, fast JSON serialization, and high query performance."

### Q2: "How does your system prevent medical errors with expired drugs?"
> **Answer:** "At the presentation layer, expired batches are dynamically badged as *Quarantined from Dispense*. At the backend layer, `saleController.js` inspects the medicine's `expiryDate` against `new Date()`. If expired, it unconditionally rejects the sale with HTTP 400. Furthermore, pharmacists have a dedicated *Remove from Shelf* feature that zeroes out degraded stock and archives it to Quarantine Disposal."

### Q3: "What happens when you restock an expired medicine?"
> **Answer:** "In naive systems, restocking only adds quantity while leaving the old expired date untouched, causing the medicine to stay expired. In DoseFlow, the restock form captures a **New Batch Number** and a **New Expiry Date**. The backend updates both the quantity and the expiration date, restoring the medicine's clinical status back to *In Stock*."

### Q4: "How is the restock threshold calculated?"
> **Answer:** "It uses a dynamic velocity formula: $\text{Target Level} = \text{Daily Consumption Rate} \times \text{Planning Horizon (21 days)}$. Daily consumption is computed from actual sales over the past 30 days, while the 21-day horizon factors in 7 days of supplier lead time plus 14 days of safety stock."
