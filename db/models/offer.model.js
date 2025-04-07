import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';
import User from './user.model.js';
import Post from './mobilepost.model.js';
import Worker from './worker.model.js';
import Session from './session.model.js'; 

class Offer extends Model {}

Offer.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    workerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    postId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'posts', key: 'id' } },
    cash: { type: DataTypes.DECIMAL, allowNull: false },
    note: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: 'Offer', tableName: 'offers', timestamps: true }
);

User.hasMany(Offer, { foreignKey: 'workerId', onDelete: 'CASCADE' });
Post.hasMany(Offer, { foreignKey: 'postId', onDelete: 'CASCADE' });
Offer.belongsTo(Worker, { foreignKey: 'workerId',as: 'worker' ,onDelete: 'CASCADE' });
Worker.hasMany(Offer, { foreignKey: 'workerId' });

export default Offer;
