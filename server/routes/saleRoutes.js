import express from 'express';
import { body } from 'express-validator';
import { getSales, createSale } from '../controllers/saleController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSales)
  .post(
    [
      body('medicineId').isMongoId().withMessage('Valid medicine ID is required'),
      body('quantitySold').isInt({ min: 1 }).withMessage('Quantity sold must be at least 1 unit'),
      validateRequest
    ],
    createSale
  );

export default router;
