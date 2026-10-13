import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: [true, 'Medicine reference is required']
    },
    medicineName: {
      type: String,
      trim: true
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier reference is required']
    },
    supplierName: {
      type: String,
      trim: true
    },
    batchNo: {
      type: String,
      trim: true,
      default: ''
    },
    quantityPurchased: {
      type: Number,
      required: [true, 'Quantity purchased is required'],
      min: [1, 'Quantity purchased must be at least 1']
    },
    unitCost: {
      type: Number,
      required: [true, 'Unit cost is required'],
      min: [0, 'Unit cost cannot be negative']
    },
    totalCost: {
      type: Number,
      required: [true, 'Total cost is required'],
      min: [0, 'Total cost cannot be negative']
    },
    invoiceNo: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Purchase', purchaseSchema);
