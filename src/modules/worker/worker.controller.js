import { DATE } from "sequelize";
import { User, Worker } from "../../../db/index.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import { AppError } from "../../utils/appError.js";
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
        attributes: ["id", "firstName", "lastName", "email", "phone", "profilePhoto",], // Select user fields
    });

    const result = await apiFetures.execute();

    if (!result) {
        return res.status(404).json({ message: "No workers found" })
    }
    return res.status(200).json(result)

}

// WORKER UPDATE HIS PROFILE

export const UpdateWorkerProfile = async (req, res, next) => {
    const userId = req.authUser.id

    const { firstName, lastname, email, phone, profilePhoto, location, specialization } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
        return next(new AppError(messages.user.notfound, 404))
    }

    if (user.role !== 'worker') {
        return next(new AppError(messages.user.notfound, 404))
    }
    const worker = await Worker.findOne({ where: { id: userId } })

    if (firstName) {
        user.firstName = firstName
    }
    if (lastname) {
        user.lastName = lastname
    }
    if (email) {
        user.email = email
    }
    if (phone) {
        user.phone = phone
    }
    if (location) {
        worker.location = location
     await worker.save()
    
    }
    if (specialization) {
        worker.specialization = specialization
        await worker.save()

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
        message: messages.user.updateSuccessfully,
        success: true,
        data: {user,worker}
    })


}


//get specific user with id in params

export const getSpecificWorker = async (req, res, next) => {

    const userId = req.params.id

    const user = await User.findByPk(userId)
    const worker = await Worker.findOne({ where: { id: userId } })

    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }

    if (user.role !== 'worker') {
        return next(new AppError(messages.user.notfound, 404))
    }

    user.password = undefined
    user.isActive = undefined
    user.otp = undefined
    user.otpExpiry = undefined
    user.otpAttempts = undefined
    user.createdAt = undefined
    user.updatedAt = undefined

    res.status(200).json({
        status: messages.user.getsuccessfully,
        data: {user, worker}

    })

}
