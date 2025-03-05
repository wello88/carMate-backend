// session.model.js

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';
import User from './user.model.js';
import Post from './mobilepost.model.js';
import Worker from './worker.model.js';
import Offer from './offer.model.js';

class Session extends Model {}

Session.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    postId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'posts', key: 'id' } },
    workerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'workers', key: 'id' } },
    offerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'offers', key: 'id' } },
    startDate: { type: DataTypes.DATE, allowNull: true },
    endDate: { type: DataTypes.DATE, allowNull: true },
    isDone: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'Session', tableName: 'sessions', timestamps: true }
);

User.hasMany(Session, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.hasMany(Session, { foreignKey: 'postId', onDelete: 'CASCADE' });
Worker.hasMany(Session, { foreignKey: 'workerId', onDelete: 'CASCADE' });
Offer.hasMany(Session, { foreignKey: 'offerId', onDelete: 'CASCADE' });

Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Session.belongsTo(Worker, { foreignKey: 'workerId' }); 
Session.belongsTo(Post, { foreignKey: 'postId', as: 'post' }); 
Session.belongsTo(Offer, { foreignKey: 'offerId', as: 'offer' }); 

export default Session;
