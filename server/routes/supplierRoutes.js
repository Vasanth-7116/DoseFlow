import express from 'express';
import { body, param } from 'express-validator';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // Require authentication for all supplier routes

const supplierValidationRules = [
  body('name').trim().notEmpty().withMessage('Supplier name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address'),
  body('phone').trim().notEmpty().withMessage('Contact phone number is required'),
  validateRequest
];

router.route('/')
  .get(getSuppliers)
  .post(supplierValidationRules, createSupplier);

router.route('/:id')
  .get(param('id').isMongoId().withMessage('Invalid supplier ID'), validateRequest, getSupplierById)
  .put(param('id').isMongoId().withMessage('Invalid supplier ID'), validateRequest, updateSupplier)
  .delete(param('id').isMongoId().withMessage('Invalid supplier ID'), validateRequest, authorize('admin'), deleteSupplier);

export default router;
