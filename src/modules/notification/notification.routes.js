import express from 'express';
import { isAuthenticated } from '../../middleware/authentication.js';
import { asyncHandler } from '../../utils/appError.js';
import { deleteAllNotifications, deleteNotification, getNotifications, markNotificationAsRead } from './notification.controller.js';

const notificationRouter = express.Router();

// Get all notifications for the authenticated user
notificationRouter.get('/', isAuthenticated(), asyncHandler(getNotifications));

// Mark a notification as read
notificationRouter.patch('/:notificationId', isAuthenticated(), asyncHandler(markNotificationAsRead));

// Delete a notification (optional, if needed)
notificationRouter.delete('/:notificationId', isAuthenticated(), asyncHandler(deleteNotification));

//delete all notifications for the authenticated user
notificationRouter.delete('/', isAuthenticated(), asyncHandler(deleteAllNotifications));


export default notificationRouter;
