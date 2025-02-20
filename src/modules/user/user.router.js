import { Router } from "express";
import { asyncHandler } from "../../utils/appError.js";
import { AddCar, AddReminder, DeleteMyAccount, GetMyCars, GetMyProfile, GetReminders, UpdateMyProfile, UpdateReminder, DeleteReminder, LikePost, RateWinch } from "./user.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { addCarSchema, updateProfileSchema, validateRequest } from "./user.validation.js";
import { isAdmin } from "../../middleware/validation.js";
import { cloudupload } from "../../utils/multer.cloud.js";

const userRouter = Router()
userRouter.get('/myprofile', isAuthenticated(), asyncHandler(GetMyProfile))
userRouter.put('/updateprofile', isAuthenticated(), validateRequest(updateProfileSchema),
    cloudupload().fields([{ name: 'profilePhoto', maxCount: 1 }]), asyncHandler(UpdateMyProfile))


userRouter.delete('/deleteprofile', isAuthenticated(), asyncHandler(DeleteMyAccount))
userRouter.post('/addcar', isAuthenticated(), validateRequest(addCarSchema), asyncHandler(AddCar))
userRouter.get('/getcars', isAuthenticated(), asyncHandler(GetMyCars))
userRouter.post("/addreminder", isAuthenticated(), asyncHandler(AddReminder))
userRouter.get("/getreminder", isAuthenticated(), asyncHandler(GetReminders))
userRouter.put("/updatereminder/:reminderId", isAuthenticated(), asyncHandler(UpdateReminder))
userRouter.delete("/deletereminder/:reminderId", isAuthenticated(), asyncHandler(DeleteReminder))
userRouter.post("/LikePost/:postId", isAuthenticated(), asyncHandler(LikePost))
userRouter.post('/rate-winch/:winchId', isAuthenticated(), isAdmin, asyncHandler(RateWinch))
export default userRouter