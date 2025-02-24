import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../db/connection.js";
import User from "./user.model.js";
import Community from "./community.model.js";

class Comment extends Model {}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    commentContent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Community,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    timestamps: true,
  }
);

// Relations
Comment.belongsTo(User, { foreignKey: "userId", as: "author" });
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });

Comment.belongsTo(Community, { foreignKey: "postId", as: "post" });
Community.hasMany(Comment, { foreignKey: "postId", as: "comments" });

export default Comment;
