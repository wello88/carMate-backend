import { sequelize } from "../../../db/connection.js"
import { Reminder, User, Car, Community, Winch, Worker } from "../../../db/index.js"
import Review from "../../../db/models/review.model.js"
import { AppError } from "../../utils/appError.js"
import { specialization } from "../../utils/constant/enums.js"
import { messages } from "../../utils/constant/messages.js"
import { sendEmail } from "../../utils/email.js"
import { genrateToken } from "../../utils/token.js"



//get profile from token
export const GetMyProfile = async (req, res, next) => {
    //get user id from token
    const userID = req.authUser.id

    const user = await User.findByPk(userID)
    if (!user) {
        return next(new AppError(messages.user.notfound, 404))
    }
    //check if user is worker
    if (user.role === 'worker') {

        const worker = await Worker.findOne({ where: { id: user.id } })
        if (!worker) {
            return next(new AppError(messages.worker.notfound, 404))
        }
        return res.status(200).json({
            success: true,
            message: messages.user.getsuccessfully,
            data: { user, worker }
        })

    }
    //remove password from response
    user.password = undefined
    return res.status(200).json({
        success: true,
        message: messages.user.getsuccessfully,
        data: user

    })


}




//update profile
export const UpdateMyProfile = async (req, res, next) => {

    const userId = req.authUser.id
    const { firstName, lastname, email, phone, profilePhoto, specialization, location } = req.body
    const user = await User.findByPk(userId)
    const emailExistance = email ? await User.findOne({ where: { email } }) : null;
    const worker = await Worker.findOne({ where: { id: userId } })


    if (!user) {
        return next(new AppError(messages.user.notfound, 404))
    }
    //update user

    if (firstName) {
        user.firstName = firstName
    }
    if (lastname) {
        user.lastname = lastname
    }

    const token = genrateToken({ payload: { id: user.id, email } })
    if (email) {
        //check for new email existance 
        if (emailExistance) {
            return next(new AppError(messages.user.emailExist, 409))
        }
        user.email = email
        user.status = 'pending'
        sendEmail(email, token)

    }
    if (phone) {
        user.phone = phone
    }
    if (req.files.profilePhoto) {
        const profilePhotoUrls = await Promise.all(
            req.files.profilePhoto.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, "main-image");
                return result.secure_url;
            })
        );
        user.profilePhoto = profilePhotoUrls;
    }
    if (specialization) {
        worker.specialization = specialization
        await worker.save()
    }
    if (location) {
        worker.location = location
        await worker.save()

    }
    await user.save()

    //remove senstitive data from response
    user.password = undefined
    user.otp = undefined
    user.otpExpiry = undefined
    user.otpAttempts = undefined

    return res.status(200).json({
        success: true,
        message: messages.user.updateSuccessfully,
        data: { user, worker }
    })

}




//delte my account
export const DeleteMyAccount = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    const userId = req.authUser.id
    await Reminder.destroy({ where: { userId } }, transaction)
    await Car.destroy({ where: { userId } }, transaction)

    const user = await User.findByPk(userId)
    if (!user) {
        await transaction.rollback();
        return next(new AppError(messages.user.notfound, 404))
    }


    await user.destroy({ transaction })

    // Commit transaction
    await transaction.commit();

    return res.status(200).json({
        success: true,
        message: messages.user.deleteSuccessfully
    })

}




//user add car
export const AddCar = async (req, res, next) => {

    const userId = req.authUser.id
    const { carName, carModel, nationality, plateNumber, trafficDepartment } = req.body
    const car = await Car.create({
        carName,
        carModel,
        nationality,
        plateNumber,
        trafficDepartment,
        UserID: userId
    })
    if (!car) {
        return next(new AppError(messages.car.failtocreate, 400))
    }
    return res.status(200).json({
        success: true,
        message: messages.car.createSuccessfully,
        data: car
    })
}




//user get cars
export const GetMyCars = async (req, res, next) => {

    const userId = req.authUser.id
    if (!userId) {
        return next(new AppError(messages.user.notfound, 404))
    }

    const cars = await Car.findAll({ where: { UserID: userId } })
    if (!cars) {
        return next(new AppError(messages.car.notfound, 404))
    }
    return res.status(200).json({
        success: true,
        message: messages.car.getsuccessfully,
        data: cars
    })
}



//add to reminder
export const AddReminder = async (req, res, next) => {

    const userId = req.authUser.id
    if (!userId) {
        return next(new AppError(messages.user.notfound, 404))
    }
    const { title, note, cash, startDate, endDate } = req.body

    const reminder = await Reminder.create({
        userId,
        title,
        note,
        cash,
        startDate,
        endDate
    })
    if (!reminder) {
        return next(new AppError(messages.reminder.failtocreate, 400))
    }
    return res.status(200).json({
        success: true,
        message: messages.reminder.createSuccessfully,
        data: reminder
    })


}


//get reminders
export const GetReminders = async (req, res, next) => {
    const userId = req.authUser.id
    if (!userId) {
        return next(new AppError(messages.user.notfound, 404))
    }
    const reminders = await Reminder.findAll({ where: { userId: userId } })
    if (!reminders) {
        return next(new AppError(messages.reminder.notfound, 404))
    }
    return res.status(200).json({
        success: true,
        message: messages.reminder.getsuccessfully,
        data: reminders
    })

}


//update reminder
export const UpdateReminder = async (req, res, next) => {

    const userId = req.authUser.id
    if (!userId) {
        return next(new AppError(messages.user.notfound, 404))
    }

    const reminderId = req.params.reminderId
    if (!reminderId) {
        return next(new AppError(messages.reminder.notfound, 404))
    }

    const { title, note, cash, startDate, endDate } = req.body

    const reminder = await Reminder.findOne({
        where: {
            id: reminderId,
            userId: userId // Add this condition
        }
    });
    if (!reminder) {
        return next(new AppError(messages.reminder.notfound, 404))
    }

    if (title) {
        reminder.title = title
    }
    if (note) {
        reminder.note = note
    }
    if (cash) {
        reminder.cash = cash
    }
    if (startDate) {
        reminder.startDate = startDate
    }
    if (endDate) {
        reminder.endDate = endDate
    }
    await reminder.save()
    return res.status(200).json({
        success: true,
        message: messages.reminder.updateSuccessfully,
        data: reminder
    })


}


//delete reminder
export const DeleteReminder = async (req, res, next) => {

    const userId = req.authUser.id
    if (!userId) {
        return next(new AppError(messages.user.notfound, 404))

    }
    const reminderId = req.params.reminderId
    if (!reminderId) {
        return next(new AppError(messages.reminder.notfound, 404))
    }
    const reminder = await Reminder.findOne({
        where: {
            id: reminderId,
            userId: userId // Add this condition
        }
    });
    if (!reminder) {
        return next(new AppError(messages.reminder.notfound, 404))
    }
    await reminder.destroy()
    return res.status(200).json({
        success: true,
        message: messages.reminder.deleteSuccessfully
    })


}



export const RateWinch = async (req, res) => {
    try {
        const { rating, comment } = req.body
        const { winchId } = req.params
        const userId = req.authUser.id

        // Validate rating value
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 0 and 5' })
        }

        // Check if the winch exists
        const winch = await Winch.findByPk(winchId)
        if (!winch) {
            return res.status(404).json({ message: 'Winch not found' })
        }

        // Create a new review
        const newReview = await Review.create({ winchId, userId, rating, comment })

        // Update winch rating
        await Winch.calculateRating(winchId)

        return res.status(201).json({ message: 'Review added successfully', review: newReview })
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message })
    }
}

// user can make like&dislike
export const LikePost = async (req, res, next) => {
    const userId = req.authUser.id; // Get user ID from authenticated request
    const { postId } = req.params;

    const post = await Community.findByPk(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    let updatedLikes = post.likes || [];

    if (updatedLikes.includes(userId)) {
        // Unlike: Remove userId from likes array
        updatedLikes = updatedLikes.filter((id) => id !== userId);
    } else {
        // Like: Add userId to likes array
        updatedLikes.push(userId);
    }

    await post.update({ likes: updatedLikes });

    res.json({ message: "Like status updated", likes: updatedLikes });
}