import { User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { roles, statusEnum } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";
import { hashPassword } from "../../utils/hashAndcompare.js";

export const AddAdmin = async (req, res,next) => {   

const { firstName, lastName, email, password, role, status } = req.body;
const createdBy = req.authUser.id;
const isvalid = req.authUser.role === 'superadmin';
if (!isvalid) {
    return next(new AppError('you are not allowed to add admin', 403));
}
const checkEmailExistance = await User.findOne({ where: { email } });
if (checkEmailExistance) {
    return next(new AppError(messages.user.alreadyExist,409));
}
const hashedPassword = hashPassword({ password });
const admin = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role:roles.ADMIN,
    status:statusEnum.VERIFIED,
    createdBy
});
if (!admin) {
    return next(new AppError('admin not created', 400));
}
res.status(201).json({
    status: 'success',
    data: {
        admin
    }
})



}