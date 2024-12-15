import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('database_name', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Disable SQL logging
});

export default sequelize;
