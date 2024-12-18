import { sequelize } from "../../../db/connection.js";
import { User, Worker } from "../../../db/index.js"
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { sendEmail } from "../../utils/email.js";
import { hashPassword, comparePassword } from "../../utils/hashAndcompare.js";
import { genrateToken } from "../../utils/token.js";
export const signup = async (req, res, next) => {
    const { email, password, firstName, lastName, phone, specialization, profilePhoto, role, location, rating } = req.body;

    const transaction = await sequelize.transaction();

    // Check if user already exists
    const userExist = await User.findOne({
        where: { email },
        attributes: ['email'],
        transaction
    });

    if (userExist) {
        await transaction.rollback();
        return next(new AppError(messages.user.alreadyExist, 400));
    }

    const hashedpassword = hashPassword({password})
    // Create user within a transaction
    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedpassword,
        phone,
        role
    }, { transaction });

    // If the role is 'worker', add worker details
    if (role === 'worker') {
        // Validate worker-specific fields
        if (!specialization || !location) {
            await transaction.rollback();
            return next(new AppError('Specialization and location are required when role is worker', 400));
        }

        // Create worker record
        await Worker.create({
            id: newUser.id,
            specialization,
            location,
            rating: rating || 0
        }, { transaction });
    }
    //remove password from response
    newUser.password = undefined

    //create token
    if (newUser.role === 'customer') {
        const token = genrateToken({ payload: { email } })
        //send email
        await sendEmail(email, token)

    }

    // Commit the transaction
    await transaction.commit();

    return res.status(201).json({
        success: true,
        message: messages.user.createSuccessfully,
        data: newUser
    });
};


//login

export const login = async (req, res, next) => {

    const { email, password } = req.body;

    const user = await User.findOne({ 
        where: { 
            email: email,
            status: 'verified'
        },
        // Include password in attributes for comparison
        attributes: ['email', 'password', 'id', 'role']
    });

    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }


    // Compare passwords
    const isValid = comparePassword({password, hashPassword:user.password });

    if (!isValid) {
        console.log(user.password);
        console.log(password);
        
        return next(new AppError(messages.user.invalidCreadintials, 401));
    }
    // Verify user status
    // if (user.status === 'blocked' || user.status === 'pending') {
    //     return next(new AppError(messages.user.notverified, 401));
    // }
    user.isActive = true
    await user.save()
    // Generate token
    const token = genrateToken({
        payload: {
            email,
            id: user.id,
            role: user.role
        }
    });

    // Successful login response
    return res.status(200).json({
        success: true,
        message: messages.user.loginSuccessfully,
        data: { token }
    });
}
