import express from 'express';
import {
  createWinch,
  getAllWinches,
  getWinchById,
  updateWinch,
  deleteWinch,
} from './winch.controller.js';
import { asyncHandler } from '../../utils/appError.js';
import { isAdmin } from '../../middleware/validation.js';
import { isAuthenticated } from '../../middleware/authentication.js';
import { cloudupload } from '../../utils/multer.cloud.js';

const router = express.Router();

// إنشاء عنصر جديد
router.post('/winches',isAuthenticated(),isAdmin,cloudupload().single('profilePhoto'),asyncHandler(createWinch) );

// الحصول على جميع العناصر
router.get('/winches' ,asyncHandler(getAllWinches));

// الحصول على عنصر معين بواسطة المعرف
router.get('/winches/:id', asyncHandler(getWinchById));

// تحديث عنصر معين بواسطة المعرف
router.put('/winches/:id',isAuthenticated(),isAdmin ,asyncHandler(updateWinch));

// حذف عنصر معين بواسطة المعرف
router.delete('/winches/:id',isAuthenticated() ,isAdmin ,asyncHandler(deleteWinch));

export default router;
