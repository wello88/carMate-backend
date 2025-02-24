import Joi from "joi";

// Signup Validation
export const signupSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).max(100) 
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{6,100}$"))
    .required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    role: Joi.string().valid("customer", "worker", "seller").required(),
    specialization: Joi.string().min(2).max(100).when("role", {
        is: "worker",
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    
    location: Joi.string().min(2).max(255).when("role", {
        is: "worker",
        then: Joi.required(),
        otherwise: Joi.forbidden(),
    }),
    profilePhoto: Joi.string().uri().optional(),
    rating: Joi.number().min(0).max(5).optional(),
});

// Login Validation
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
});

// Forget Password Validation
export const forgetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

// Change Password Validation
export const changePasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).max(100).required(),
});

// Middleware for validation
export const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            // errors: error.details.map((err) => err.message),
        });
    }
    next();
};


export const validateLogin = Joi.object({
    email: Joi.string().email().max(150).required(),
    password: Joi.string()
        .min(6)
        .max(100)
        .required(),
});

