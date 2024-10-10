import { User } from "../../db/models/user.model.js"
import { AppError } from "../utils/appError.js"
import { status } from "../utils/constant/enums.js"
import { messages } from "../utils/constant/messages.js"
import { verifyToken } from "../utils/token.js"

export const isAuthenticated = () => {
    return async (req, res, next) => {
        const { token } = req.headers
        if (!token) {
            return next(new AppError('token required', 401))
        }

        let payload = null
        try{
             payload = verifyToken({ token })
        }catch(err){
            return next(new AppError(err.message, 500))
        }

        if(!payload?._id){
            return next(new AppError('invalid payload', 401))
        }

       const user = await User.findById(payload._id)// {} , null
        if(!user){
            return next(new AppError(messages.user.notFound, 401))
        }
        req.authUser = user
        next()
    }
}

export const isAuthorized = (roles = []) =>{
    return async (req, res, next) =>{
        const user = req.authUser
        if(!roles.includes(user.role)){
            return next(new AppError('not authorized',401))
        }
        next()
    }
}