import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Medicine from './models/Medicine.js';
import Supplier from './models/Supplier.js';
import Sale from './models/Sale.js';
import Purchase from './models/Purchase.js';
import User from './models/User.js';
import { connectDB, closeDB } from './config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('[Seed] Seeding sample hospital inventory data...');

  // Clear existing
  await Medicine.deleteMany({});
  await Supplier.deleteMany({});
  await Sale.deleteMany({});
  await Purchase.deleteMany({});
  await User.deleteMany({});

  // 0. Seed Demo Accounts
  const adminUser = await User.create({
    name: 'Dr. Eleanor Vance (Chief Pharmacist)',
    email: 'admin@doseflow.com',
    password: 'Admin@123',
    role: 'admin'
  });

  const staffUser = await User.create({
    name: 'James Miller (Staff Pharmacist)',
    email: 'staff@doseflow.com',
    password: 'Staff@123',
    role: 'staff'
  });

  console.log(`[Seed] Created demo users: ${adminUser.email} (Admin), ${staffUser.email} (Staff)`);

  // 1. Create Suppliers
  const suppliersData = [
    {
      name: 'Apex Pharma Laboratories',
      contactPerson: 'Dr. Robert Vance',
      email: 'orders@apexpharma.com',
      phone: '+1 (555) 234-5678',
      address: '742 Healthcare Parkway, BioTech Hub, Boston, MA'
    },
    {
      name: 'MediCore Lifesciences',
      contactPerson: 'Sarah Jenkins',
      email: 'supplies@medicore.org',
      phone: '+1 (555) 876-5432',
      address: '120 Science Park Blvd, Suite 400, San Diego, CA'
    },
    {
      name: 'Beacon Global Pharmaceuticals',
      contactPerson: 'Michael Chang',
      email: 'sales@beaconpharma.com',
      phone: '+1 (555) 345-9876',
      address: '88 Apex Tower, Industrial Area, Chicago, IL'
    },
    {
      name: 'Zenith BioTech Logistics',
      contactPerson: 'Elena Rostova',
      email: 'contact@zenithbiotech.com',
      phone: '+1 (555) 654-3210',
      address: '500 Medical Center Drive, Houston, TX'
    }
  ];

  const createdSuppliers = await Supplier.insertMany(suppliersData);
  const [apex, mediCore, beacon, zenith] = createdSuppliers;

  // Helper date generators
  const now = new Date();
  const getRelativeDate = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  // 2. Create Medicines
  const medicinesData = [
    {
      name: 'Amoxicillin 500mg Capsules',
      batchNo: 'AMX-2026-A1',
      category: 'Antibiotics',
      quantity: 450,
      expiryDate: getRelativeDate(360),
      price: 18.5,
      unitCost: 11.0,
      supplierId: apex._id,
      reorderThreshold: 100,
      shelfLocation: 'Rack A-01'
    },
    {
      name: 'Azithromycin 250mg Tablets',
      batchNo: 'AZI-2025-C4',
      category: 'Antibiotics',
      quantity: 35, // Low stock!
      expiryDate: getRelativeDate(180),
      price: 24.0,
      unitCost: 15.0,
      supplierId: apex._id,
      reorderThreshold: 80,
      shelfLocation: 'Rack A-03'
    },
    {
      name: 'Paracetamol 650mg Infusion',
      batchNo: 'PCM-2026-F9',
      category: 'Analgesics',
      quantity: 720,
      expiryDate: getRelativeDate(420),
      price: 8.0,
      unitCost: 4.5,
      supplierId: mediCore._id,
      reorderThreshold: 150,
      shelfLocation: 'Cold Room B-02'
    },
    {
      name: 'Ibuprofen 400mg Tablets',
      batchNo: 'IBU-2024-X2',
      category: 'Analgesics',
      quantity: 18, // Low stock & nearing expiry!
      expiryDate: getRelativeDate(14), // Nearing expiry (14 days)
      price: 12.0,
      unitCost: 6.5,
      supplierId: mediCore._id,
      reorderThreshold: 50,
      shelfLocation: 'Rack B-01'
    },
    {
      name: 'Atorvastatin 20mg Tablets',
      batchNo: 'ATV-2026-H7',
      category: 'Cardiovascular',
      quantity: 310,
      expiryDate: getRelativeDate(300),
      price: 32.0,
      unitCost: 20.0,
      supplierId: beacon._id,
      reorderThreshold: 60,
      shelfLocation: 'Rack C-02'
    },
    {
      name: 'Amlodipine 5mg Tablets',
      batchNo: 'AML-2024-Z9',
      category: 'Cardiovascular',
      quantity: 0, // OUT OF STOCK!
      expiryDate: getRelativeDate(200),
      price: 15.0,
      unitCost: 8.0,
      supplierId: beacon._id,
      reorderThreshold: 50,
      shelfLocation: 'Rack C-04'
    },
    {
      name: 'Metoprolol Tartrate 25mg',
      batchNo: 'MTP-2024-D1',
      category: 'Cardiovascular',
      quantity: 42, // Expired batch!
      expiryDate: getRelativeDate(-8), // Expired 8 days ago
      price: 22.0,
      unitCost: 13.0,
      supplierId: beacon._id,
      reorderThreshold: 50,
      shelfLocation: 'Quarantine Bay'
    },
    {
      name: 'Salbutamol Inhaler 100mcg',
      batchNo: 'SAL-2026-M5',
      category: 'Respiratory',
      quantity: 180,
      expiryDate: getRelativeDate(450),
      price: 28.5,
      unitCost: 17.0,
      supplierId: zenith._id,
      reorderThreshold: 40,
      shelfLocation: 'Rack D-01'
    },
    {
      name: 'Montelukast 10mg Tablets',
      batchNo: 'MTK-2025-E3',
      category: 'Respiratory',
      quantity: 25, // Low stock & nearing expiry (22 days)
      expiryDate: getRelativeDate(22),
      price: 26.0,
      unitCost: 16.0,
      supplierId: zenith._id,
      reorderThreshold: 60,
      shelfLocation: 'Rack D-03'
    },
    {
      name: 'Adrenaline 1mg/ml Ampoules',
      batchNo: 'ADR-2026-EM1',
      category: 'Emergency / Critical',
      quantity: 140,
      expiryDate: getRelativeDate(180),
      price: 45.0,
      unitCost: 28.0,
      supplierId: apex._id,
      reorderThreshold: 50,
      shelfLocation: 'Crash Cart Ready'
    },
    {
      name: 'Normal Saline 0.9% 500ml',
      batchNo: 'NS-2026-IV4',
      category: 'IV Fluids',
      quantity: 850,
      expiryDate: getRelativeDate(500),
      price: 6.5,
      unitCost: 3.2,
      supplierId: mediCore._id,
      reorderThreshold: 200,
      shelfLocation: 'IV Bay 01'
    },
    {
      name: 'Ceftriaxone 1g Injection Vial',
      batchNo: 'CTX-2025-K8',
      category: 'Antibiotics',
      quantity: 12, // Critical low stock
      expiryDate: getRelativeDate(90),
      price: 52.0,
      unitCost: 34.0,
      supplierId: apex._id,
      reorderThreshold: 50,
      shelfLocation: 'Rack A-05'
    }
  ];

  const createdMedicines = await Medicine.insertMany(medicinesData);

  // Link medicines to suppliers
  for (const med of createdMedicines) {
    await Supplier.findByIdAndUpdate(med.supplierId, {
      $addToSet: { medicinesSupplied: med._id }
    });
  }

  // 3. Create Sample Historical Sales
  const salesData = [];
  const medMap = new Map();
  createdMedicines.forEach((m) => medMap.set(m.name, m));

  const saleTemplates = [
    { name: 'Paracetamol 650mg Infusion', qty: 45, daysAgo: 2, patient: 'General Ward Room 302' },
    { name: 'Paracetamol 650mg Infusion', qty: 60, daysAgo: 6, patient: 'ICU Bed 04' },
    { name: 'Paracetamol 650mg Infusion', qty: 35, daysAgo: 12, patient: 'Surgical Recovery' },
    { name: 'Normal Saline 0.9% 500ml', qty: 110, daysAgo: 1, patient: 'Emergency Department' },
    { name: 'Normal Saline 0.9% 500ml', qty: 95, daysAgo: 5, patient: 'OR Suite 2' },
    { name: 'Normal Saline 0.9% 500ml', qty: 80, daysAgo: 14, patient: 'Trauma Unit' },
    { name: 'Amoxicillin 500mg Capsules', qty: 25, daysAgo: 3, patient: 'Outpatient Clinic' },
    { name: 'Amoxicillin 500mg Capsules', qty: 30, daysAgo: 8, patient: 'Pediatrics Ward' },
    { name: 'Azithromycin 250mg Tablets', qty: 40, daysAgo: 4, patient: 'Pulmonary Care' },
    { name: 'Atorvastatin 20mg Tablets', qty: 20, daysAgo: 7, patient: 'Cardiology OPD' },
    { name: 'Salbutamol Inhaler 100mcg', qty: 15, daysAgo: 9, patient: 'Asthma Daycare' },
    { name: 'Ceftriaxone 1g Injection Vial', qty: 28, daysAgo: 2, patient: 'Inpatient Isolation' },
    { name: 'Adrenaline 1mg/ml Ampoules', qty: 6, daysAgo: 11, patient: 'Resuscitation Bay' },
    { name: 'Montelukast 10mg Tablets', qty: 12, daysAgo: 15, patient: 'Allergy Clinic' },
    { name: 'Ibuprofen 400mg Tablets', qty: 8, daysAgo: 18, patient: 'Orthopedic OPD' }
  ];

  for (const st of saleTemplates) {
    const med = medMap.get(st.name);
    if (med) {
      const date = new Date(now);
      date.setDate(date.getDate() - st.daysAgo);
      salesData.push({
        medicineId: med._id,
        medicineName: med.name,
        quantitySold: st.qty,
        unitPrice: med.price,
        totalPrice: Number((st.qty * med.price).toFixed(2)),
        patientOrBuyer: st.patient,
        prescriptionNo: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date
      });
    }
  }

  await Sale.insertMany(salesData);

  // 4. Create Sample Purchases
  const purchaseTemplates = [
    { name: 'Normal Saline 0.9% 500ml', qty: 500, daysAgo: 25, invoice: 'INV-MC-9021', supplier: mediCore },
    { name: 'Paracetamol 650mg Infusion', qty: 400, daysAgo: 20, invoice: 'INV-MC-8842', supplier: mediCore },
    { name: 'Amoxicillin 500mg Capsules', qty: 300, daysAgo: 18, invoice: 'INV-APX-4109', supplier: apex },
    { name: 'Atorvastatin 20mg Tablets', qty: 200, daysAgo: 15, invoice: 'INV-BGP-7231', supplier: beacon },
    { name: 'Salbutamol Inhaler 100mcg', qty: 100, daysAgo: 10, invoice: 'INV-ZBL-1029', supplier: zenith }
  ];

  const purchasesData = [];
  for (const pt of purchaseTemplates) {
    const med = medMap.get(pt.name);
    if (med) {
      const date = new Date(now);
      date.setDate(date.getDate() - pt.daysAgo);
      const unitCost = med.unitCost || Math.round(med.price * 0.65);
      purchasesData.push({
        medicineId: med._id,
        medicineName: med.name,
        supplierId: pt.supplier._id,
        supplierName: pt.supplier.name,
        batchNo: med.batchNo,
        quantityPurchased: pt.qty,
        unitCost,
        totalCost: Number((pt.qty * unitCost).toFixed(2)),
        invoiceNo: pt.invoice,
        date
      });
    }
  }

  await Purchase.insertMany(purchasesData);

  console.log(`[Seed] Success! Created ${createdSuppliers.length} suppliers, ${createdMedicines.length} medicines, ${salesData.length} sales, ${purchasesData.length} purchases.`);
};

// If run directly via node seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      process.exit(0);
    } catch (e) {
      console.error('[Seed Error]:', e);
      process.exit(1);
    }
  })();
}
