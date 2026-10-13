import Medicine from '../models/Medicine.js';
import Sale from '../models/Sale.js';

/**
 * Smart Suggestion Engine for Reorders
 * Formula based on:
 * - 30-day sales rate (burn velocity)
 * - Current stock level
 * - Expiry proximity (if expiring soon, existing stock can't be relied upon)
 * - Lead time buffer (default 7 days lead time, 14 days safety stock)
 */
export const getReorderSuggestions = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Get total sales per medicine in last 30 days
  const recentSales = await Sale.aggregate([
    { $match: { date: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: '$medicineId',
        totalSold: { $sum: '$quantitySold' },
        salesCount: { $sum: 1 }
      }
    }
  ]);

  const salesMap = new Map();
  recentSales.forEach((s) => {
    salesMap.set(s._id.toString(), s.totalSold);
  });

  // 2. Fetch all medicines with populated supplier details
  const medicines = await Medicine.find()
    .populate('supplierId', 'name contactPerson email phone')
    .lean();

  const now = new Date();
  const suggestions = [];

  for (const med of medicines) {
    const soldIn30Days = salesMap.get(med._id.toString()) || 0;
    // Daily consumption rate (minimum baseline 0.5 to prevent zero-reorder for stocked items)
    const dailyRate = Math.max(soldIn30Days / 30, (med.reorderThreshold || 50) / 30 * 0.4);

    const expiryDate = new Date(med.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysUntilExpiry <= 0;
    const isNearExpiry = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

    // Effective usable stock
    let effectiveStock = med.quantity;
    if (isExpired) {
      effectiveStock = 0; // Expired cannot be sold
    } else if (isNearExpiry) {
      // Heavily discounted stock reliability
      effectiveStock = Math.floor(med.quantity * 0.3);
    }

    // Lead time (days required for delivery) = 7 days
    // Safety buffer days = 14 days
    const planningHorizonDays = 21;
    const targetInventoryLevel = Math.ceil(dailyRate * planningHorizonDays);

    // If effective stock is below reorderThreshold or target level, trigger reorder
    const isStockLow = effectiveStock <= med.reorderThreshold;
    const isDeficit = effectiveStock < targetInventoryLevel;

    if (isStockLow || isDeficit || isExpired) {
      const neededQuantity = Math.max(
        targetInventoryLevel - effectiveStock,
        (med.reorderThreshold * 2) - effectiveStock,
        25 // minimum batch order
      );

      // Urgency determination
      let urgency = 'MEDIUM';
      const reasons = [];

      if (effectiveStock === 0 || isExpired) {
        urgency = 'CRITICAL';
        if (isExpired) reasons.push(`Batch expired (${Math.abs(daysUntilExpiry)}d ago)`);
        else reasons.push('Stock is zero');
      } else if (effectiveStock <= med.reorderThreshold * 0.5) {
        urgency = 'HIGH';
        reasons.push(`Stock severely depleted (${effectiveStock} < ${med.reorderThreshold})`);
      } else {
        reasons.push(`Below reorder threshold (${effectiveStock}/${med.reorderThreshold})`);
      }

      if (dailyRate >= 3) {
        reasons.push(`High turnover rate (${dailyRate.toFixed(1)} units/day)`);
      }

      if (isNearExpiry) {
        reasons.push(`Nearing expiry (${daysUntilExpiry} days left)`);
      }

      const unitCost = med.unitCost || Math.round(med.price * 0.7);
      const estimatedCost = neededQuantity * unitCost;

      suggestions.push({
        medicineId: med._id,
        name: med.name,
        batchNo: med.batchNo,
        category: med.category,
        currentStock: med.quantity,
        effectiveStock,
        reorderThreshold: med.reorderThreshold,
        dailyConsumptionRate: Number(dailyRate.toFixed(2)),
        suggestedQuantity: neededQuantity,
        estimatedUnitCost: unitCost,
        estimatedTotalCost: estimatedCost,
        urgency,
        supplier: med.supplierId,
        reasons,
        expiryDate: med.expiryDate,
        daysUntilExpiry
      });
    }
  }

  // Sort by urgency: CRITICAL first, then HIGH, then MEDIUM
  const urgencyWeight = { CRITICAL: 3, HIGH: 2, MEDIUM: 1 };
  suggestions.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);

  return suggestions;
};
