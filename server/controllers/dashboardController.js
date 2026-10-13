import Medicine from '../models/Medicine.js';
import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import Supplier from '../models/Supplier.js';
import { getLowStockAlerts, getExpiryAlerts, getAlertSummary } from '../services/alertService.js';
import { getReorderSuggestions } from '../services/reorderService.js';

// @desc    Get dashboard statistics overview
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const nearExpiryDate = new Date();
    nearExpiryDate.setDate(nearExpiryDate.getDate() + 30);

    const [
      totalMedicines,
      suppliersCount,
      lowStockCount,
      outOfStockCount,
      expiredCount,
      nearExpiryCount,
      allMedicines,
      salesStats,
      purchaseStats
    ] = await Promise.all([
      Medicine.countDocuments(),
      Supplier.countDocuments(),
      Medicine.countDocuments({ $expr: { $lte: ['$quantity', '$reorderThreshold'] } }),
      Medicine.countDocuments({ quantity: 0 }),
      Medicine.countDocuments({ expiryDate: { $lte: now } }),
      Medicine.countDocuments({ expiryDate: { $gt: now, $lte: nearExpiryDate } }),
      Medicine.find({}, 'quantity price unitCost'),
      Sale.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalUnitsSold: { $sum: '$quantitySold' },
            transactionCount: { $sum: 1 }
          }
        }
      ]),
      Purchase.aggregate([
        {
          $group: {
            _id: null,
            totalExpenditure: { $sum: '$totalCost' },
            totalUnitsPurchased: { $sum: '$quantityPurchased' }
          }
        }
      ])
    ]);

    // Calculate inventory valuation
    const totalInventoryValue = allMedicines.reduce(
      (acc, med) => acc + (med.quantity * (med.price || 0)),
      0
    );

    const inStockCount = Math.max(0, totalMedicines - lowStockCount - expiredCount);

    res.status(200).json({
      success: true,
      data: {
        totalMedicines,
        suppliersCount,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        expiredCount,
        nearExpiryCount,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
        totalRevenue: salesStats[0]?.totalRevenue || 0,
        totalUnitsSold: salesStats[0]?.totalUnitsSold || 0,
        salesCount: salesStats[0]?.transactionCount || 0,
        totalExpenditure: purchaseStats[0]?.totalExpenditure || 0,
        totalUnitsPurchased: purchaseStats[0]?.totalUnitsPurchased || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get top-selling & least-selling medicines for charts
// @route   GET /api/dashboard/sales-comparison
export const getSalesComparison = async (req, res, next) => {
  try {
    // Aggregate sales grouped by medicine
    const salesGrouped = await Sale.aggregate([
      {
        $group: {
          _id: '$medicineId',
          totalUnitsSold: { $sum: '$quantitySold' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: { path: '$medicine', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$medicine.name', 'Unknown'] },
          batchNo: '$medicine.batchNo',
          category: '$medicine.category',
          currentStock: '$medicine.quantity',
          totalUnitsSold: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalUnitsSold: -1 } }
    ]);

    // Also identify medicines with 0 sales
    const soldMedIds = salesGrouped.map((s) => s._id);
    const zeroSaleMedicines = await Medicine.find({ _id: { $nin: soldMedIds } })
      .select('name batchNo category quantity price')
      .limit(10)
      .lean();

    const zeroSalesFormatted = zeroSaleMedicines.map((m) => ({
      _id: m._id,
      name: m.name,
      batchNo: m.batchNo,
      category: m.category,
      currentStock: m.quantity,
      totalUnitsSold: 0,
      totalRevenue: 0
    }));

    const allRanked = [...salesGrouped, ...zeroSalesFormatted];

    const topSelling = allRanked.slice(0, 7);
    const leastSelling = [...allRanked].reverse().slice(0, 7);

    res.status(200).json({
      success: true,
      data: {
        topSelling,
        leastSelling,
        allRanked
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get low-stock alerts
// @route   GET /api/dashboard/alerts/low-stock
export const getLowStock = async (req, res, next) => {
  try {
    const alerts = await getLowStockAlerts();
    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    next(err);
  }
};

// @desc    Get expiry alerts
// @route   GET /api/dashboard/alerts/expiry
export const getExpiry = async (req, res, next) => {
  try {
    const daysWindow = req.query.days || 45;
    const alerts = await getExpiryAlerts(daysWindow);
    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    next(err);
  }
};

// @desc    Get smart reorder suggestions
// @route   GET /api/dashboard/reorder-suggestions
export const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await getReorderSuggestions();
    res.status(200).json({ success: true, count: suggestions.length, data: suggestions });
  } catch (err) {
    next(err);
  }
};
