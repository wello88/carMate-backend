import { Router } from "express";
import { asyncHandler } from "../../utils/appError.js";
import { changPassword, forgetPassword, signup } from "./auth.controller.js";
import { login } from "./auth.controller.js";


export const authRouter = Router()

authRouter.post('/signup',asyncHandler(signup))
authRouter.post('/login',asyncHandler(login))
authRouter.post('/forget-password',asyncHandler(forgetPassword))
authRouter.put('/change-password',asyncHandler(changPassword))
export default authRouter