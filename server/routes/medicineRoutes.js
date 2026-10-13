import express from 'express';
import { body, param } from 'express-validator';
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine
} from '../controllers/medicineController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // Require authentication for all medicine routes

const medicineValidationRules = [
  body('name').trim().notEmpty().withMessage('Medicine name is required'),
  body('batchNo').trim().notEmpty().withMessage('Batch number is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('expiryDate').isISO8601().withMessage('Expiry date must be a valid date'),
  body('supplierId').isMongoId().withMessage('Valid supplier reference is required'),
  validateRequest
];

router.route('/')
  .get(getMedicines)
  .post(medicineValidationRules, createMedicine);

router.route('/:id')
  .get(param('id').isMongoId().withMessage('Invalid medicine ID'), validateRequest, getMedicineById)
  .put(param('id').isMongoId().withMessage('Invalid medicine ID'), validateRequest, updateMedicine)
  .delete(param('id').isMongoId().withMessage('Invalid medicine ID'), validateRequest, authorize('admin'), deleteMedicine);

export default router;
