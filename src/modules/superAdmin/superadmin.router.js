import { Router } from 'express';

import { asyncHandler } from '../../utils/appError.js';
import { AddAdmin } from './superadmin.controller.js';
import { isAuthenticated } from '../../middleware/authentication.js';

const superAdminRouter = Router();

superAdminRouter.post('/addAdmin',isAuthenticated(),asyncHandler(AddAdmin))

export default superAdminRouter;