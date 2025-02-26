import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../db/connection.js";
import User from "./user.model.js";

class Car extends Model{}

Car.init(

{

    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    userID:{type:DataTypes.INTEGER,allowNull:false,references:{model:'users',key:'id'}},
    carName:{type:DataTypes.STRING,allowNull:false},
    nationality:{type:DataTypes.STRING,allowNull:false},
    carModel:{type:DataTypes.STRING,allowNull:false},
    plateNumber:{type:DataTypes.STRING,allowNull:false},
    trafficDepartment:{type:DataTypes.STRING,allowNull:false},
},{
    sequelize,
    modelName:'Car',
    tableName:'cars',
    timestamps:true
}

)
User.hasMany(Car,{foreignKey:'userID',onDelete:'CASCADE'})
Car.belongsTo(User,{foreignKey:'userID',onDelete:'CASCADE'})

export default Car;
