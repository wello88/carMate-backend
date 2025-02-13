import { User, Worker } from "../../../db/index.js"
import  {ApiFeature}  from "../../utils/apiFeature.js"
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { messages } from "../../utils/constant/messages.js";

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

// WORKER UPDATE HIS PROFILE

export const UpdateWorkerProfile = async(req,res,next)=>{
    const userId=req.authUser.id

    const {firstName,lastname,email,phone,profilePhoto,location,specification}=req.body

    const user = await User.findByPk(userId)
    if (!user){
        return next(new AppError(messages.user.notfound,404))
    }

    if (firstName){
        user.firstName=firstName
    }
    if (lastname){
        user.lastName=lastname
    }
    if (email){
        user.email=email
    }
    if (phone){
        user.phone=phone
    }
    if (location){
        user.location=location
    }
    if (specification){
        user.specification=specification
    }
    // handle image upload
    if (req.files.profilePhoto) {
        const profilePhotoUrls = await Promise.all(
            req.files.profilePhoto.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, "main-image");
                return result.secure_url;
            })
        );
        user.profilePhoto = profilePhotoUrls;
    }
    await user.save()

    return res.status(200).json({
        message:messages.user.updateSuccessfully,
        success:true
    })


}