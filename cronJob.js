// cronJob.js
import cron from 'node-cron';
import { Op } from 'sequelize';
 
import { User, Reminder,Notification } from './db/index.js';


// This function checks for reminders expiring in 3 days and sends notifications
export const sendUpcomingDeadlineNotifications = async () => {
  try {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 3);

    const reminders = await Reminder.findAll({
      where: {
        endDate: {
          [Op.gte]: new Date(targetDate.setHours(0, 0, 0, 0)),
          [Op.lt]: new Date(targetDate.setHours(23, 59, 59, 999))
        }
      },
      include: {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'profilePhoto']
      }
    });

    for (const reminder of reminders) {
      const { userId, title, User: user } = reminder;

      await Notification.create({
        userId: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        message: `Reminder "${title}" is due in 3 days.`,
        arabicMessage: `تذكير "${title}" سينتهي خلال 3 أيام.`,
        type: 'reminder'
      });
    }

    console.log(`[${new Date().toISOString()}] Reminder notifications sent for reminders expiring in 3 days.`);
  } catch (error) {
    console.error('Error sending reminder notifications:', error);
  }
};

cron.schedule('26 0 * * *', () => {
  console.log(`[${new Date().toISOString()}] Running daily reminder check at 3:39 AM…`);
  sendUpcomingDeadlineNotifications();
});

export default sendUpcomingDeadlineNotifications;
