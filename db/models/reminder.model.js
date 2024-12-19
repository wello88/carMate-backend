import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../connection.js'

class Reminder extends Model {}

Reminder.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    note: { type: DataTypes.TEXT },
    cash: { type: DataTypes.DECIMAL, allowNull: true },
    startdate: { type: DataTypes.DATE, allowNull: true },
    enddate: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'Reminder', tableName: 'reminders', timestamps: true }
)
export default Reminder
 





