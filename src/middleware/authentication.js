import { User } from "../../db/index.js";
import { AppError } from "../utils/appError.js";
import { statusEnum } from "../utils/constant/enums.js";
import { messages } from "../utils/constant/messages.js";
import { verifyToken } from "../utils/token.js";

export const isAuthenticated = () => {
    return async (req, res, next) => {
        const { token } = req.headers;
        if (!token) {
            return next(new AppError('token required', 401));
        }

        try {
            const payload = verifyToken({ token });
            if (!payload?.id) {
                return next(new AppError('invalid payload', 401));
            }

            const user = await User.findByPk(payload.id);
            if (!user) {
                return next(new AppError('User not found', 401));
            }

            // Set the authenticated user in req
            req.authUser = user;
            next();
        } catch (error) {
            return next(new AppError('Authentication failed', 401));
        }
    }
}

export const isAuthorized = (roles = []) => {
    return async (req, res, next) => {
        const user = req.authUser;
        if (!roles.includes(user.role)) {
            return next(new AppError('not authorized', 401));
        }
        next();
    };
};
