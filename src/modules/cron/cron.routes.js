import express from 'express';
import { sendUpcomingDeadlineNotifications } from '../../../cronJob.js';

const cronRouter = express.Router();

cronRouter.post('/reminders', async (req, res) => {
  try {
    await sendUpcomingDeadlineNotifications();
    res.status(200).json({ status: 'success', message: 'Reminders sent successfully' });
  } catch (error) {
    console.error('Error in cron API:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send reminders' });
  }
});

export default cronRouter;
