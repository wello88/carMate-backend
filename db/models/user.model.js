import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../db/connection.js'

class User extends Model { }

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING }, //TODO : add phone number validation ON SELLER(required to seller)
    profilePhoto: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('verified', 'pending', 'blocked'), defaultValue: 'pending' },
    role: { type: DataTypes.ENUM('seller', 'worker', 'admin', 'customer'), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
    otp: { type: DataTypes.INTEGER },
    otpExpiry: { type: DataTypes.DATE },
    otpAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { sequelize, modelName: 'User', tableName: 'users', timestamps: true }
);

export default User;

