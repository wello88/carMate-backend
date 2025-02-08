import express from 'express';
import {
  createWinch,
  getAllWinches,
  getWinchById,
  updateWinch,
  deleteWinch,
} from './winch.controller.js';

const router = express.Router();

// إنشاء عنصر جديد
router.post('/winches', createWinch);

// الحصول على جميع العناصر
router.get('/winches', getAllWinches);

// الحصول على عنصر معين بواسطة المعرف
router.get('/winches/:id', getWinchById);

// تحديث عنصر معين بواسطة المعرف
router.put('/winches/:id', updateWinch);

// حذف عنصر معين بواسطة المعرف
router.delete('/winches/:id', deleteWinch);

export default router;
