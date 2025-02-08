import { User, Worker } from "../../../db/index.js"
import  {ApiFeature}  from "../../utils/apiFeature.js"

export const GetWrokers = async (req, res) => {
    const apiFetures = new ApiFeature(Worker, req.query)
    .pagination()
    .filter()
    .sort()
    .select()

     // Modify API features to include the User model in the query
     apiFetures.options.include.push({
        model: User,
        as: "User", // Must match the alias used in Worker.belongsTo()
        attributes: ["id", "firstName", "lastName" ,"email", "phone", "profilePhoto",], // Select user fields
    });

    const result = await apiFetures.execute();

    if (!result) {
        return res.status(404).json({ message: "No workers found" })
    }
    return res.status(200).json(result)

}