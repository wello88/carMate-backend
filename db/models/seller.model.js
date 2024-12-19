// import { Model, DataTypes } from 'sequelize';
// import {sequelize} from '../connection.js';
// import User from './user.model.js';

// class Seller extends Model {}

// Seller.init(
//   {
//     id: { type: DataTypes.INTEGER, primaryKey: true, references: { model: User, key: 'id' } },
//     pp: { type: DataTypes.STRING },
//   },
//   { sequelize, modelName: 'Seller', tableName: 'sellers', timestamps: false }
// );

// Seller.belongsTo(User, { foreignKey: 'id', onDelete: 'CASCADE' });
// User.hasOne(Seller, { foreignKey: 'id' });

// export default Seller;
