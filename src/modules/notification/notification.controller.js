import { Notification } from '../../../db/index.js';
import { AppError } from '../../utils/appError.js';
// Get all notifications for a user
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.authUser.id;

    // Fetch notifications for the logged-in user
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']], // Sort by latest
    });

    res.status(200).json({
      status: 'success',
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.authUser.id;

    // Find notification
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    // Update isRead status
    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};
