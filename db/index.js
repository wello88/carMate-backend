import { sequelize } from './connection.js';
import User from './models/user.model.js';
import Reminder from './models/reminder.model.js';
import Category from './models/category.model.js';
// import Seller from './models/seller.model.js';
import Worker from './models/worker.model.js';

export const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync({ alter: false });
    console.log('Models synchronized!');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
};



export {
  User,
  //  Seller,
    Worker,
    Reminder,
    Category
};

