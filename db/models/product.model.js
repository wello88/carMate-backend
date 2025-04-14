import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../../db/connection.js'
import Category from './category.model.js' // لو عايز تربطها بالـ Category
import User from './user.model.js' // لو عايز تربطها بالـ User (createdBy)
import SubCategory from './sub-category.js'

class Product extends Model {}

Product.init( 
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    arabicTitle: { type: DataTypes.STRING, allowNull: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    productLink: { type: DataTypes.STRING, allowNull: true },
    price: { type: DataTypes.DECIMAL, allowNull: false },
    subImages: { type: DataTypes.JSONB, allowNull: true }, // يمكن تخزين الصور كـ JSON array
    mainImage: { type: DataTypes.STRING, allowNull: true }, // صورة رئيسية
    description: { type: DataTypes.TEXT, allowNull: true },
    arabicDescription: { type: DataTypes.TEXT, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false }, // معرف المستخدم الذي أنشأ المنتج
    subCategoryId: { type: DataTypes.INTEGER, allowNull: false }, // معرف الفئة (Category)
  },  
  { sequelize, modelName: 'Product', tableName: 'products', timestamps: true }
)
 
// العلاقات بين الـ models
Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' })
User.hasMany(Product, { foreignKey: 'createdBy', as: 'products' })

Product.belongsTo(SubCategory, { foreignKey: 'subCategoryId', as: 'Subcategory' })
SubCategory.hasMany(Product, { foreignKey: 'subCategoryId', as: 'products' })

export default Product
