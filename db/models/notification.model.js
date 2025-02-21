import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';
import User from './user.model.js';

class Notification extends Model {}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    message: { type: DataTypes.STRING, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'Notification', tableName: 'notifications', timestamps: true }
);

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });

export default Notification;
