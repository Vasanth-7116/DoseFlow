import express from 'express';
import { body } from 'express-validator';
import { getPurchases, createPurchase } from '../controllers/purchaseController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPurchases)
  .post(
    [
      body('medicineId').isMongoId().withMessage('Valid medicine ID is required'),
      body('supplierId').isMongoId().withMessage('Valid supplier ID is required'),
      body('quantityPurchased').isInt({ min: 1 }).withMessage('Quantity purchased must be at least 1 unit'),
      validateRequest
    ],
    createPurchase
  );

export default router;
