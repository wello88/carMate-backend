import { User } from "../../db/index.js"
import { AppError } from "../utils/appError.js"
import { messages } from "../utils/constant/messages.js"

export const isActive = () => {
    return async (req, res, next) => {
        const userId = req.authUser.id
        const user = await User.findByPk(userId)
        if (!user) {
            return next(new AppError(messages.user.notfound, 404))
        }
        if (user.isActive === false) {
            return next(new AppError(messages.user.notverified, 400))
        }
        next()
    }
}