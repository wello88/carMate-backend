import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../connection.js'
import User from './user.model.js'

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    postContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    images: { type: DataTypes.JSONB, allowNull: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true, 
  }
)


Post.belongsTo(User, { foreignKey: 'userId', as: 'author' })
User.hasMany(Post, { foreignKey: 'userId', as: 'post' })

export default Post
