import joi from "joi";


// Schema for contact us form validation
export const contactUsSchema = joi.object({
    name: joi.string().min(2).max(50).required(),
    email: joi.string().email().required(),
    phoneNumber: joi.string().pattern(/^[0-9]{10,15}$/).required(),
    message: joi.string().min(10).max(500).required()
});