import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../db/connection.js';
import User from './user.model.js';

class PostReview extends Model {}

PostReview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reviewContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      unique: true, // Ensures one review per user
    },
  },
  {
    sequelize,
    modelName: 'PostReview',
    tableName: 'PostReviews',
    timestamps: true,
  }
);

PostReview.belongsTo(User, { foreignKey: 'userId', as: 'author' , onDelete: 'CASCADE' });
User.hasOne(PostReview, { foreignKey: 'userId', as: 'review' , onDelete: 'CASCADE' });

export default PostReview;
