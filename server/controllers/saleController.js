import Sale from '../models/Sale.js';
import Medicine from '../models/Medicine.js';

// @desc    Get all sales transactions
// @route   GET /api/sales
export const getSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    let query = Sale.find()
      .populate('medicineId', 'name batchNo category price quantity')
      .sort({ date: -1 });

    let totalCount = null;
    let totalPages = null;

    if (isPaginated) {
      totalCount = await Sale.countDocuments();
      totalPages = Math.ceil(totalCount / limit);
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const sales = await query;

    res.status(200).json({
      success: true,
      count: sales.length,
      totalCount: totalCount !== null ? totalCount : sales.length,
      currentPage: isPaginated ? page : 1,
      totalPages: isPaginated ? totalPages : 1,
      data: sales
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record a sale transaction
// @route   POST /api/sales
export const createSale = async (req, res, next) => {
  try {
    const { medicineId, quantitySold, patientOrBuyer, prescriptionNo } = req.body;

    if (!medicineId || !quantitySold || quantitySold <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid medicine ID and quantity greater than 0 are required'
      });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Check expiry
    const now = new Date();
    if (new Date(medicine.expiryDate) < now) {
      return res.status(400).json({
        success: false,
        message: `Cannot sell expired medicine (${medicine.name}). Expiry date was ${new Date(medicine.expiryDate).toLocaleDateString()}.`
      });
    }

    // Check stock availability
    if (medicine.quantity < quantitySold) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}, requested: ${quantitySold}`
      });
    }

    // Auto-calculate price
    const unitPrice = medicine.price;
    const totalPrice = Number((quantitySold * unitPrice).toFixed(2));

    // Deduct stock
    medicine.quantity -= Number(quantitySold);
    await medicine.save();

    // Create sale record
    const sale = await Sale.create({
      medicineId: medicine._id,
      medicineName: medicine.name,
      quantitySold: Number(quantitySold),
      unitPrice,
      totalPrice,
      patientOrBuyer: patientOrBuyer || 'Walk-in Patient',
      prescriptionNo: prescriptionNo || ''
    });

    const populatedSale = await Sale.findById(sale._id).populate('medicineId', 'name batchNo category');

    res.status(201).json({
      success: true,
      data: populatedSale,
      updatedStock: medicine.quantity,
      message: `Sale recorded successfully. Deducted ${quantitySold} units of ${medicine.name}. Remaining: ${medicine.quantity}`
    });
  } catch (err) {
    next(err);
  }
};
