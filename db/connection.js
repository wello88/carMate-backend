import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve('./config/.env') })
const sequelize = new Sequelize(process.env.DB_NAME,
  process.env.DB_USER, String(process.env.DB_PASSWORD),
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false, // Set to false to disable SQL logging
    dialectOptions: process.env.DB_SSL === "true" ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
  });




// // connect sequelize to the database using aiven
// const sequelize = new Sequelize('carmate', 'postgres', '123', {
//   host: 'localhost',
//   port: 5432,
//   dialect: 'postgres',
//   logging: false, // Disable SQL logging

// });

// connect sequelize to the database using aiven
const sequelize = new Sequelize('carmate', 'postgres', '123', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false, // Disable SQL logging

});


const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

export { sequelize, connectDB };
