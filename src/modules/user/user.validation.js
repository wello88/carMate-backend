import Joi from "joi";

// Schema for updating user profile
export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    profilePhoto: Joi.string().uri().optional()
});

// Schema for adding a car
export const addCarSchema = Joi.object({
    carName: Joi.string().min(2).max(50).required(),
    nationality: Joi.string().min(2).max(50).required(),
    carModel: Joi.string().min(2).max(50).required(),
    plateNumber: Joi.string().alphanum().min(2).max(15).required(),
    trafficDepartment: Joi.string().min(2).max(50).required()
});

// Middleware for validating user requests
export const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: error.details.map((err) => err.message)
        });
    }
    next();
};
