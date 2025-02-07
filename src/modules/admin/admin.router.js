import { Router } from 'express';
import { isAuthenticated } from '../../middleware/authentication.js';
import { asyncHandler } from '../../utils/appError.js';
import { AddCategory } from './admin.controller.js';
import { isAdmin } from '../../middleware/validation.js';

const adminRouter = Router();   

adminRouter.post('/addCategory',isAuthenticated(),isAdmin,asyncHandler(AddCategory))


export default adminRouter;