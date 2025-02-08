import joi from 'joi';

export const addCategoryValidation = joi.object({
    name: joi.string().min(2).max(50).required(),
    slug: joi.string().min(2).max(50).required(),

});
