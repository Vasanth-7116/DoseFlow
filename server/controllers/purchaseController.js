import Purchase from '../models/Purchase.js';
import Medicine from '../models/Medicine.js';
import Supplier from '../models/Supplier.js';

// @desc    Get all purchase transactions
// @route   GET /api/purchases
export const getPurchases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    let query = Purchase.find()
      .populate('medicineId', 'name batchNo category quantity price')
      .populate('supplierId', 'name phone email')
      .sort({ date: -1 });

    let totalCount = null;
    let totalPages = null;

    if (isPaginated) {
      totalCount = await Purchase.countDocuments();
      totalPages = Math.ceil(totalCount / limit);
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const purchases = await query;

    res.status(200).json({
      success: true,
      count: purchases.length,
      totalCount: totalCount !== null ? totalCount : purchases.length,
      currentPage: isPaginated ? page : 1,
      totalPages: isPaginated ? totalPages : 1,
      data: purchases
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record a purchase/restock transaction
// @route   POST /api/purchases
export const createPurchase = async (req, res, next) => {
  try {
    const { medicineId, supplierId, quantityPurchased, unitCost, invoiceNo, batchNo, expiryDate, shelfLocation } = req.body;

    if (!medicineId || !supplierId || !quantityPurchased || quantityPurchased <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Medicine, supplier, and quantity (> 0) are required'
      });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const actualUnitCost = unitCost !== undefined ? Number(unitCost) : (medicine.unitCost || Math.round(medicine.price * 0.7));
    const totalCost = Number((quantityPurchased * actualUnitCost).toFixed(2));

    // Increment stock
    medicine.quantity += Number(quantityPurchased);
    if (actualUnitCost > 0) {
      medicine.unitCost = actualUnitCost;
    }
    if (batchNo) {
      medicine.batchNo = batchNo;
    }
    if (expiryDate) {
      medicine.expiryDate = new Date(expiryDate);
    }
    if (shelfLocation) {
      medicine.shelfLocation = shelfLocation;
    } else if (medicine.shelfLocation && medicine.shelfLocation.toLowerCase().includes('quarantine')) {
      // If medicine was moved to quarantine due to expiry, restore to standard active shelf
      medicine.shelfLocation = 'Main Storage';
    }
    await medicine.save();

    // Ensure medicine is in supplier's supplied list
    await Supplier.findByIdAndUpdate(supplier._id, {
      $addToSet: { medicinesSupplied: medicine._id }
    });

    // Create purchase record
    const purchase = await Purchase.create({
      medicineId: medicine._id,
      medicineName: medicine.name,
      supplierId: supplier._id,
      supplierName: supplier.name,
      quantityPurchased: Number(quantityPurchased),
      unitCost: actualUnitCost,
      totalCost,
      batchNo: batchNo || medicine.batchNo,
      expiryDate: expiryDate ? new Date(expiryDate) : medicine.expiryDate,
      invoiceNo: invoiceNo || `INV-${Date.now().toString().slice(-6)}`
    });

    const populated = await Purchase.findById(purchase._id)
      .populate('medicineId', 'name batchNo category quantity')
      .populate('supplierId', 'name phone email');

    res.status(201).json({
      success: true,
      data: populated,
      updatedStock: medicine.quantity,
      message: `Restock recorded successfully! Added ${quantityPurchased} units to ${medicine.name}. Total stock now: ${medicine.quantity}`
    });
  } catch (err) {
    next(err);
  }
};
