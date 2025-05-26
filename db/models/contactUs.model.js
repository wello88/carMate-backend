import { Model ,DataTypes} from "sequelize";
import { sequelize } from "../connection.js";

class ContactUs extends Model{}

ContactUs.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, required: true },
    email: { type: DataTypes.STRING, required: true },
    phoneNumber: { type: DataTypes.STRING, required: true },
    message: { type: DataTypes.STRING, required: true },
  },
  {
    sequelize,
    modelName: 'ContactUs',
    tableName: 'contactus',
    timestamps: true,
  }

);


export default ContactUs;