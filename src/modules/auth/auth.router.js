import { Router } from "express";
import { asyncHandler } from "../../utils/appError.js";
import { signup } from "./auth.controller.js";
import { login } from "./auth.controller.js";


export const authRouter = Router()

authRouter.post('/signup',asyncHandler(signup))
authRouter.post('/login',asyncHandler(login))

export default authRouter