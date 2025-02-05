import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../connection.js'
import User from './user.model.js'

class Reminder extends Model {}

Reminder.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false ,references:{model:'users',key:'id'}},
    title: { type: DataTypes.STRING, allowNull: false },
    note: { type: DataTypes.TEXT },
    cash: { type: DataTypes.DECIMAL, allowNull: true },
    startDate: { type: DataTypes.DATE, allowNull: true },
    endDate: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'Reminder', tableName: 'reminders', timestamps: true }
)
User.hasMany(Reminder, { foreignKey: 'userId', onDelete: 'CASCADE' })
export default Reminder
 





