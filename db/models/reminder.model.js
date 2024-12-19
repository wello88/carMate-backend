import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../connection.js'

class Reminder extends Model {}

Reminder.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tittle: { type: DataTypes.STRING, allowNull: false },
    note: { type: DataTypes.TEXT },
    cash: { type: DataTypes.DECIMAL, allowNull: false },
    startdate: { type: DataTypes.DATE, allowNull: false },
    enddate: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: 'Reminder', tableName: 'reminders', timestamps: true }
)
export default Reminder