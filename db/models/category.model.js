import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../db/connection.js';

class Category extends Model {}

Category.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false }, // نربطه مع user id
  },
  { sequelize, modelName: 'Category', tableName: 'categories', timestamps: true }
);

export default Category;
