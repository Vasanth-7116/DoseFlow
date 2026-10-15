import Medicine from '../models/Medicine.js';
import Supplier from '../models/Supplier.js';

// @desc    Get all medicines (supports search, category, status filter)
// @route   GET /api/medicines
export const getMedicines = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { batchNo: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const now = new Date();

    if (status === 'low_stock') {
      query.$expr = { $lte: ['$quantity', '$reorderThreshold'] };
    } else if (status === 'out_of_stock') {
      query.quantity = 0;
    } else if (status === 'expired') {
      query.expiryDate = { $lte: now };
    } else if (status === 'in_stock') {
      query.$and = [
        { $expr: { $gt: ['$quantity', '$reorderThreshold'] } },
        { expiryDate: { $gt: now } }
      ];
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    let medicinesQuery = Medicine.find(query)
      .populate('supplierId', 'name contactPerson email phone')
      .sort({ createdAt: -1 });

    let totalCount = null;
    let totalPages = null;

    if (isPaginated) {
      totalCount = await Medicine.countDocuments(query);
      totalPages = Math.ceil(totalCount / limit);
      medicinesQuery = medicinesQuery.skip((page - 1) * limit).limit(limit);
    }

    const medicines = await medicinesQuery;

    res.status(200).json({
      success: true,
      count: medicines.length,
      totalCount: totalCount !== null ? totalCount : medicines.length,
      currentPage: isPaginated ? page : 1,
      totalPages: isPaginated ? totalPages : 1,
      data: medicines
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
export const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('supplierId', 'name contactPerson phone email');
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.status(200).json({ success: true, data: medicine });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new medicine
// @route   POST /api/medicines
export const createMedicine = async (req, res, next) => {
  try {
    const { name, batchNo, category, quantity, expiryDate, price, unitCost, supplierId, reorderThreshold, shelfLocation } = req.body;

    const supplierExists = await Supplier.findById(supplierId);
    if (!supplierExists) {
      return res.status(400).json({ success: false, message: 'Invalid supplier ID provided' });
    }

    const medicine = await Medicine.create({
      name,
      batchNo,
      category: category || 'General',
      quantity: Number(quantity),
      expiryDate,
      price: Number(price),
      unitCost: Number(unitCost) || 0,
      supplierId,
      reorderThreshold: Number(reorderThreshold) || 50,
      shelfLocation: shelfLocation || 'Main Storage'
    });

    // Link medicine to supplier's medicinesSupplied
    await Supplier.findByIdAndUpdate(supplierId, {
      $addToSet: { medicinesSupplied: medicine._id }
    });

    const populated = await Medicine.findById(medicine._id).populate('supplierId', 'name contactPerson email phone');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Medicine added successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
export const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const oldSupplierId = medicine.supplierId?.toString();
    const newSupplierId = req.body.supplierId;

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplierId', 'name contactPerson email phone');

    // If supplier changed, update suppliers' reference arrays
    if (newSupplierId && oldSupplierId !== newSupplierId) {
      await Supplier.findByIdAndUpdate(oldSupplierId, {
        $pull: { medicinesSupplied: medicine._id }
      });
      await Supplier.findByIdAndUpdate(newSupplierId, {
        $addToSet: { medicinesSupplied: medicine._id }
      });
    }

    res.status(200).json({
      success: true,
      data: updatedMedicine,
      message: 'Medicine updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
export const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    // Remove reference from supplier
    if (medicine.supplierId) {
      await Supplier.findByIdAndUpdate(medicine.supplierId, {
        $pull: { medicinesSupplied: medicine._id }
      });
    }

    await Medicine.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove expired/quarantined medicine from shelf (decommission expired stock)
// @route   PUT /api/medicines/:id/remove-from-shelf
export const removeFromShelf = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const previousQty = medicine.quantity;
    medicine.quantity = 0;
    medicine.shelfLocation = 'Quarantine Bay (Disposed)';
    await medicine.save();

    const populated = await Medicine.findById(medicine._id)
      .populate('supplierId', 'name contactPerson email phone');

    res.status(200).json({
      success: true,
      data: populated,
      message: `Decommissioned ${previousQty} expired unit(s) of ${medicine.name}. Removed from active shelf into Quarantine Disposal.`
    });
  } catch (err) {
    next(err);
  }
};

