import express from 'express';
import {
  getDashboardStats,
  getSalesComparison,
  getLowStock,
  getExpiry,
  getSuggestions
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/sales-comparison', getSalesComparison);
router.get('/alerts/low-stock', getLowStock);
router.get('/alerts/expiry', getExpiry);
router.get('/reorder-suggestions', getSuggestions);

export default router;
