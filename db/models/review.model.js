import { Model, DataTypes, Sequelize } from 'sequelize'
import { sequelize } from '../connection.js'

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    winchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
  }
)

// Lazy load Winch to avoid circular dependency
Review.afterCreate(async (review) => {
  const { default: Winch } = await import('./winch.model.js')
  await Winch.calculateRating(review.winchId)
})

export default Review
