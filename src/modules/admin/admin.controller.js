import { Category } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"

export const AddCategory = async (req, res) => {

    const {name , slug } = req.body
    const createdBy = req.authUser.id
    const category = await Category.create({
        name,
        slug,
        createdBy:createdBy
    })
    if(!category){
        return next(new AppError(messages.category.failtocreate, 400))
    }
    res.status(201).json({
        status: messages.category.createSuccessfully,
        data: {
            category
        }
    })

}