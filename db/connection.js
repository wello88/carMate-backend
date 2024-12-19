import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('carmate', 'postgres', '123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Disable SQL logging
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1); // Exit the process on connection failure
  }
};

export { sequelize, connectDB };