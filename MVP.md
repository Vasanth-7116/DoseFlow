# Hospital Medicine Inventory Management System — MVP

## Problem Statement
Hospitals frequently encounter medicine shortages or excess inventory because medical supplies are not monitored effectively. This platform manages stock levels, expiry dates, supplier details, and automated reorder alerts.

---

## 1. Core Inventory Management
- Add / edit / delete medicine records with:
  - Medicine name
  - Batch number
  - Quantity
  - Expiry date
  - Price
  - Supplier
- Auto-decrement stock on sale
- Auto-increment stock on purchase / restock entry

## 2. Supplier Module
- Supplier list with contact details
- Each supplier linked to the medicines they supply

## 3. Alerts
- **Low-stock alert** — triggered when quantity falls below a set threshold
- **Expiry alert** — triggered when a medicine is nearing expiry (e.g., within 30 days)

## 4. Dashboard
- Bar chart: top-selling vs least-selling medicines
- Stock-level overview: in-stock / low-stock / expired counts

## 5. Reorder Suggestion (Rule-Based "Smart Suggestion Engine")
- Formula-based suggestion using:
  - Recent sales rate
  - Current stock level
  - Expiry proximity
- Output: suggested reorder quantity per medicine
- Note: framed as a "smart suggestion engine" for the report; can be extended to a real ML model later

## 6. Sales / Purchase Entry
- **Sale entry:** select medicine + quantity → auto price calculation → stock deduction
- **Purchase entry:** select supplier + medicine + quantity → stock addition

---

## Nice-to-Have (if time permits)
- Login roles (Admin / Staff)
- Basic search and filter
- Export stock report as PDF / Excel

---

## Why This Fits the Problem Statement

| Requirement | MVP Feature |
|---|---|
| Monitor stock levels | Core inventory management + auto-update on sale/purchase |
| Expiry dates | Expiry field + expiry alerts |
| Supplier details | Supplier module |
| Automated reorder alerts | Low-stock alerts + rule-based reorder suggestion engine |
