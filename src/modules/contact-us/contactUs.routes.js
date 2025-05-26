import { Router } from "express";
import { getcontactFormData, submitContactForm } from "./contactUs.controller.js";
import { asyncHandler } from "../../utils/appError.js";


 const contactUsRouter = Router();
 contactUsRouter.post('/contactus', asyncHandler(submitContactForm))
 contactUsRouter.get('/contactus', asyncHandler(getcontactFormData))

 export default contactUsRouter;