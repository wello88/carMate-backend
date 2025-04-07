import { sequelize } from './connection.js';
import User from './models/user.model.js';
import Reminder from './models/reminder.model.js';
import Product from './models/product.model.js';
import Community from './models/community.model.js';
import Category from './models/category.model.js';
import Worker from './models/worker.model.js';
import Winch from './models/winch.model.js';
import Car from './models/car.model.js';
import Post from './models/mobilepost.model.js';
import Notification from './models/notification.model.js';
import Comment from './models/comment.model.js';
import PostReview from './models/post.review.model.js';
import Session from './models/session.model.js';
import Offer from './models/offer.model.js';

export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync({ alter: true });
    console.log('Models synchronized!');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
};

Offer.hasOne(Session, { foreignKey: 'offerId', as: 'session' });


export {
  User,
  Worker,
  Reminder,
  Community,
  Category,
  Product,
  Winch,
  Car,
  Post,
  Notification,
  Comment,
  PostReview,
  Session,
  Offer,
};



