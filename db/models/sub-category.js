import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../../db/connection.js'
import Category from './category.model.js'

class SubCategory extends Model {}

SubCategory.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }, 
    arabicName: { type: DataTypes.STRING, allowNull: true, unique: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false }, 
  },
  { sequelize, modelName: 'SubCategory', tableName: 'subcategories', timestamps: true }
)

// Define associations if needed

SubCategory.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })
Category.hasMany(SubCategory, { foreignKey: 'categoryId', as: 'subcategories' })
 
export default SubCategory





