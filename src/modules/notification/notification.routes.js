import express from 'express';
import { isAuthenticated } from '../../middleware/authentication.js';
import { asyncHandler } from '../../utils/appError.js';
import { getNotifications, markNotificationAsRead } from './notification.controller.js';

const notificationRouter = express.Router();

// Get all notifications for the authenticated user
notificationRouter.get('/', isAuthenticated(), asyncHandler(getNotifications));

// Mark a notification as read
notificationRouter.patch('/:notificationId', isAuthenticated(), asyncHandler(markNotificationAsRead));

export default notificationRouter;
