import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../../db/connection.js'
import Category from './category.model.js' // لو عايز تربطها بالـ Category
import User from './user.model.js' // لو عايز تربطها بالـ User (createdBy)

class Product extends Model {}

Product.init( 
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    productLink: { type: DataTypes.STRING, allowNull: true },
    createdByPrice: { type: DataTypes.DECIMAL, allowNull: false },
    subImages: { type: DataTypes.JSONB, allowNull: true }, // يمكن تخزين الصور كـ JSON array
    mainImage: { type: DataTypes.STRING, allowNull: true }, // صورة رئيسية
    description: { type: DataTypes.TEXT, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false }, // معرف المستخدم الذي أنشأ المنتج
    categoryId: { type: DataTypes.INTEGER, allowNull: false }, // معرف الفئة (Category)
  },  
  { sequelize, modelName: 'Product', tableName: 'products', timestamps: true }
)
 
// العلاقات بين الـ models
Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' })
User.hasMany(Product, { foreignKey: 'createdBy', as: 'products' })

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' })
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' })

export default Product
