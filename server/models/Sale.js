import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
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
    quantitySold: {
      type: Number,
      required: [true, 'Quantity sold is required'],
      min: [1, 'Quantity sold must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    },
    patientOrBuyer: {
      type: String,
      trim: true,
      default: 'Walk-in Patient'
    },
    prescriptionNo: {
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

export default mongoose.model('Sale', saleSchema);
