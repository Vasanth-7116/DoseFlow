import Supplier from '../models/Supplier.js';
import Medicine from '../models/Medicine.js';

// @desc    Get all suppliers
// @route   GET /api/suppliers
export const getSuppliers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    let suppliersQuery = Supplier.find(query)
      .populate('medicinesSupplied', 'name batchNo quantity price expiryDate')
      .sort({ name: 1 });

    let totalCount = null;
    let totalPages = null;

    if (isPaginated) {
      totalCount = await Supplier.countDocuments(query);
      totalPages = Math.ceil(totalCount / limit);
      suppliersQuery = suppliersQuery.skip((page - 1) * limit).limit(limit);
    }

    const suppliers = await suppliersQuery;

    res.status(200).json({
      success: true,
      count: suppliers.length,
      totalCount: totalCount !== null ? totalCount : suppliers.length,
      currentPage: isPaginated ? page : 1,
      totalPages: isPaginated ? totalPages : 1,
      data: suppliers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
export const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('medicinesSupplied', 'name batchNo quantity price expiryDate');

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
export const createSupplier = async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body;

    const supplier = await Supplier.create({
      name,
      contactPerson,
      email,
      phone,
      address
    });

    res.status(201).json({
      success: true,
      data: supplier,
      message: 'Supplier created successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
export const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('medicinesSupplied', 'name batchNo quantity price');

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({
      success: true,
      data: supplier,
      message: 'Supplier updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
export const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Check if any medicines are actively linked to this supplier
    const activeMedicinesCount = await Medicine.countDocuments({ supplierId: supplier._id });
    if (activeMedicinesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier. There are ${activeMedicinesCount} medicine(s) actively assigned to this supplier. Reassign them first.`
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
