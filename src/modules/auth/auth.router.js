import { Router } from "express";
import { asyncHandler } from "../../utils/appError.js";
import { forgetPassword, resetPassword, signup, verifyOtp } from "./auth.controller.js";
import { login } from "./auth.controller.js";
import { signupSchema, validateLogin, validateRequest } from "./auth.validation.js";


export const authRouter = Router()

authRouter.post('/signup',validateRequest(signupSchema),asyncHandler(signup))
authRouter.post('/login',validateRequest(validateLogin),asyncHandler(login))
authRouter.post('/verify',asyncHandler(verifyOtp))
authRouter.post('/forget-password',asyncHandler(forgetPassword))
authRouter.put('/change-password',asyncHandler(resetPassword))
export default authRouter