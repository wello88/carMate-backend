import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../connection.js';
import User from './user.model.js';

class Worker extends Model {}

Worker.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: User, key: 'id' } },
    specialization: { type: DataTypes.ENUM('Mechanic', 'Electrical', 'CarPlumber') },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    location: { type: DataTypes.STRING },
  },
  { sequelize, modelName: 'Worker', tableName: 'workers', timestamps: false }
);

Worker.belongsTo(User, { foreignKey: 'id', onDelete: 'CASCADE' });
User.hasOne(Worker, { foreignKey: 'id' });

export default Worker;
