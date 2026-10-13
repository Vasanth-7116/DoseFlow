import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { param } from 'express-validator';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'staff']).withMessage('Role must be either admin or staff'),
    validateRequest
  ],
  register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  login
);

router.get('/me', protect, getMe);

// Admin-only User & Staff Management Routes
router.route('/users')
  .get(protect, authorize('admin'), getUsers)
  .post(
    protect,
    authorize('admin'),
    [
      body('name').trim().notEmpty().withMessage('Full name is required'),
      body('email').trim().isEmail().withMessage('Please provide a valid email address'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('role').optional().isIn(['admin', 'staff']).withMessage('Role must be either admin or staff'),
      validateRequest
    ],
    createUser
  );

router.route('/users/:id')
  .put(
    protect,
    authorize('admin'),
    [
      param('id').isMongoId().withMessage('Invalid user ID'),
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('role').optional().isIn(['admin', 'staff']).withMessage('Role must be admin or staff'),
      validateRequest
    ],
    updateUser
  )
  .delete(
    protect,
    authorize('admin'),
    [
      param('id').isMongoId().withMessage('Invalid user ID'),
      validateRequest
    ],
    deleteUser
  );

export default router;
