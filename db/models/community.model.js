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
    postContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    images: { type: DataTypes.JSONB, allowNull: true },
    comments: {
      type: DataTypes.STRING,
      defaultValue: 0,
    },
    likes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
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
    modelName: 'Community',
    tableName: 'communities',
    timestamps: true, 
  }
)


Community.belongsTo(User, { foreignKey: 'userId', as: 'author' })
User.hasMany(Community, { foreignKey: 'userId', as: 'posts' })

export default Community
