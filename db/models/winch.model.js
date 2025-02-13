import { Model, DataTypes, Sequelize } from 'sequelize'
import { sequelize } from '../connection.js'
import Review from './review.model.js'

class Winch extends Model {
  static async calculateRating(winchId) {
    const result = await Review.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('rating')), 'averageRating']],
      where: { winchId },
    })

    const avgRating = result?.dataValues?.averageRating || 0
    await Winch.update({ rating: avgRating }, { where: { id: winchId } })
    return avgRating
  }
}

Winch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: { 
      allowNull: true,
      type: DataTypes.FLOAT,
      validate: {
        min: 0,
        max: 5,
      },
    },
  },
  {
    sequelize,
    modelName: 'Winch',
    tableName: 'winch',
    timestamps: true,
  }
)

export default Winch 