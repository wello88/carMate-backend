import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../../db/connection.js'
import User from './user.model.js'

class Community extends Model {}

Community.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    postId: {
      type: DataTypes.STRING,     // اعاده النظر
      allowNull: false,
      unique: true,
    },
    postContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING), // قائمة من الصور
      allowNull: true,
    },
    comments: {
      type: DataTypes.STRING,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Community',
    tableName: 'communities',
    timestamps: true, // للإضافة التلقائية createdAt و updatedAt
  }
)

// إنشاء العلاقات
Community.belongsTo(User, { foreignKey: 'userId', as: 'author' })
User.hasMany(Community, { foreignKey: 'userId', as: 'posts' })

export default Community
