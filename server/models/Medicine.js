import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    batchNo: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    price: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative']
    },
    unitCost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative']
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier reference is required']
    },
    reorderThreshold: {
      type: Number,
      default: 50,
      min: [1, 'Reorder threshold must be at least 1']
    },
    shelfLocation: {
      type: String,
      trim: true,
      default: 'Main Storage'
    }
  },
  {
    timestamps: true
  }
);

medicineSchema.index({ name: 'text', batchNo: 'text' });

export default mongoose.model('Medicine', medicineSchema);
