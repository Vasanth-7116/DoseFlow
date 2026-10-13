import Medicine from '../models/Medicine.js';

export const getLowStockAlerts = async () => {
  const medicines = await Medicine.find({
    $expr: { $lte: ['$quantity', '$reorderThreshold'] }
  })
    .populate('supplierId', 'name phone email')
    .sort({ quantity: 1 })
    .lean();

  return medicines.map((med) => ({
    ...med,
    alertType: 'LOW_STOCK',
    severity: med.quantity === 0 ? 'CRITICAL' : med.quantity <= med.reorderThreshold * 0.5 ? 'HIGH' : 'WARNING',
    message: med.quantity === 0 
      ? `Stock completely depleted (0 units)! Immediate restock required.` 
      : `Current stock (${med.quantity}) is below threshold (${med.reorderThreshold}).`
  }));
};

export const getExpiryAlerts = async (daysWindow = 45) => {
  const now = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + Number(daysWindow));

  const medicines = await Medicine.find({
    expiryDate: { $lte: thresholdDate }
  })
    .populate('supplierId', 'name phone email')
    .sort({ expiryDate: 1 })
    .lean();

  return medicines.map((med) => {
    const expiry = new Date(med.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = diffDays <= 0;

    return {
      ...med,
      alertType: isExpired ? 'EXPIRED' : 'NEARING_EXPIRY',
      daysUntilExpiry: diffDays,
      severity: isExpired ? 'CRITICAL' : diffDays <= 15 ? 'HIGH' : 'WARNING',
      message: isExpired
        ? `Expired ${Math.abs(diffDays)} day(s) ago on ${expiry.toLocaleDateString()}. Quarantine immediately.`
        : `Expires in ${diffDays} day(s) on ${expiry.toLocaleDateString()}. Plan discount or disposal.`
    };
  });
};

export const getAlertSummary = async () => {
  const now = new Date();
  const nearExpiryDate = new Date();
  nearExpiryDate.setDate(nearExpiryDate.getDate() + 30);

  const [totalMedicines, lowStockCount, outOfStockCount, expiredCount, nearExpiryCount] = await Promise.all([
    Medicine.countDocuments(),
    Medicine.countDocuments({ $expr: { $lte: ['$quantity', '$reorderThreshold'] } }),
    Medicine.countDocuments({ quantity: 0 }),
    Medicine.countDocuments({ expiryDate: { $lte: now } }),
    Medicine.countDocuments({ expiryDate: { $gt: now, $lte: nearExpiryDate } })
  ]);

  return {
    totalMedicines,
    lowStockCount,
    outOfStockCount,
    expiredCount,
    nearExpiryCount,
    totalAlerts: lowStockCount + expiredCount + nearExpiryCount
  };
};
