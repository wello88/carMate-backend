// import joi from 'joi';

// export const createSellerValidation = joi.object({
//     firstName: joi.string().min(2).max(50).required(),
//     lastName: joi.string().min(2).max(50).required(),
//     email: joi.string().email().required(),
//     password: joi.string().min(6).max(100).required(),
//     phone: joi.string().pattern(/^[0-9]{10,15}$/).optional(),
//     role: joi.string().valid( 'seller').required(),
//     profilePhoto: joi.string().uri().optional(),
//     rating: joi.number().min(0).max(5).optional(),
// });