import { sequelize } from "../../../db/connection.js";
import { User, Worker } from "../../../db/index.js"
import Seller from "../../../db/models/seller.model.js";
import { AppError } from "../../utils/appError.js"
import { messages } from "../../utils/constant/messages.js"
import { sendEmail, sendEmailForgetPassword } from "../../utils/email.js";
import { hashPassword, comparePassword } from "../../utils/hashAndcompare.js";
import { htmlTemplateOTP } from "../../utils/htmlTemplate.js";
import { generateOTP } from "../../utils/otp.js";
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

    const hashedpassword = hashPassword({ password })
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

    // if the role is seller add to user with role seller 
    if (newUser.role === 'seller') {
        await Seller.create({
            id: newUser.id,
            rating: rating || 0
        }, { transaction });
    }   // Commit the transaction
    // await transaction.commit();


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
            email: email
        }
    });

    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }


    // Compare passwords
    const isValid = comparePassword({ password, hashPassword: user.password });

    if (!isValid) {
        console.log(user.password);
        console.log(password);

        return next(new AppError(messages.user.invalidCreadintials, 401));
    }
    // Verify user status
    if (user.status !== 'verified') {
        return next(new AppError(messages.user.notverified, 401));
    }
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



//forget password
export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;

    // Check if the user exists
    const userExist = await User.findOne({
        where: {
            email: email
        }
    });

    if (!userExist) {
        return next(new AppError(messages.user.notfound, 404));
    }

    // If OTP already sent and not expired
    if (userExist.otp && userExist.otpExpiry > Date.now()) {
        return next(new AppError(messages.user.otpAlreadySent, 400));
    }

    // Reset OTP attempt count
    userExist.otpAttempts = 0;

    // Generate and set OTP
    const otp = generateOTP();
    userExist.otp = otp;
    userExist.otpExpiry = Date.now() + 15 * 60 * 1000;

    // Save to database
    await userExist.save();

    try {
        await sendEmailForgetPassword({
            to: email,
            subject: 'Forget Password',
            html: htmlTemplateOTP(otp),
        });
    } catch (emailError) {
        // If email fails, we should remove the OTP from database
        userExist.otp = null;
        userExist.otpExpiry = null;
        await userExist.save();
        return next(new AppError('Failed to send email', 500));
    }

    // Send response
    return res.status(200).json({ message: 'Check your email', success: true });
};






// changPassword
// export const changPassword = async (req, res, next) => {
//     const { otp, newPassword, email } = req.body;

//     // Check if the user exists
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//         return next(new AppError(messages.user.notfound, 404));
//     }

//     // Ensure OTP and newPassword are strings
//     const otpString = otp.toString();
//     const storedOtpString = user.otp ? user.otp.toString() : '';

//     // Check if OTP is valid
//     if (storedOtpString !== otpString) {
//         // Using Sequelize increment for otpAttempts
//         await user.increment('otpAttempts', { by: 1 });
//         await user.reload(); // Reload to get updated value

//         // If OTP attempts exceed 3
//         if (user.otpAttempts > 3) {
//             await user.update({
//                 otp: null,
//                 otpExpiry: null,
//                 otpAttempts: null
//             });

//             return next(new AppError('Maximum OTP attempts exceeded. Please request a new OTP.', 403));
//         }

//         if (user.otpAttempts !== null) {
//             return next(new AppError(`invalid otp you have only ${4 - user.otpAttempts} attemps left`, 401));
//         }
//         return next(new AppError(`request new OTP`, 401));
//     }

//     // Check if OTP is expired
//     if (user.otpExpiry < Date.now()) {
//         const secondOTP = generateOTP();

//         await user.update({
//             otp: secondOTP,
//             otpExpiry: Date.now() + 5 * 60 * 1000,
//             otpAttempts: 0
//         });

//         await sendEmail({
//             to: email,
//             subject: 'Resent OTP',
//             html: `<h1>Your new OTP is ${secondOTP}</h1>`
//         });

//         return res.status(200).json({
//             message: "Check your email",
//             success: true
//         });
//     }

//     // Hash new password
//     const hashedPassword = hashPassword({ password: newPassword });

//     // Update password and reset OTP data using Sequelize
//     await user.update({
//         password: hashedPassword,
//         otp: null,
//         otpExpiry: null,
//         otpAttempts: null
//     });

//     return res.status(200).json({
//         message: 'Password updated successfully',
//         success: true
//     });
// };



// Verify OTP and handle OTP requests
export const verifyOtp = async (req, res, next) => {
    const { otp, email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }

    const otpString = otp.toString();
    const storedOtpString = user.otp ? user.otp.toString() : '';

    const currentTime = Date.now();
    const otpExpiryTime = user.otpExpiry ? user.otpExpiry : 0;
    const otpCooldownTime = user.lastOtpRequest ? user.lastOtpRequest : 0;

    // Check if OTP is valid (within 5 min)
    if (otpExpiryTime > currentTime) {
        if (storedOtpString !== otpString) {
            await user.increment('otpAttempts', { by: 1 });
            await user.reload();

            if (user.otpAttempts > 3) {
                await user.update({ otp: null, otpExpiry: null, otpAttempts: null, lastOtpRequest: null });
                return next(new AppError('Maximum OTP attempts exceeded. Please request a new OTP.', 403));
            }

            return next(new AppError(`Invalid OTP. You have only ${4 - user.otpAttempts} attempts left`, 401));
        }

        // OTP is valid → Reset OTP attempts & store verified status
        await user.update({ otpAttempts: 0, otp: null, otpExpiry: null, otpVerified: true });

        return res.status(200).json({ message: 'OTP verified successfully', success: true });
    }

    // OTP expired → Check cooldown for new OTP
    if (currentTime - otpCooldownTime < 30 * 1000) {
        return next(new AppError(`You must wait ${Math.ceil((30 * 1000 - (currentTime - otpCooldownTime)) / 1000)} seconds before requesting a new OTP.`, 429));
    }

    // Generate a new OTP
    const newOtp = generateOTP();
    await user.update({
        otp: newOtp,
        otpExpiry: currentTime + 5 * 60 * 1000, // Valid for 5 min
        otpAttempts: 0,
        lastOtpRequest: currentTime
    });

    await sendEmail({
        to: email,
        subject: 'Resent OTP',
        html: `<h1>Your new OTP is ${newOtp}</h1>`
    });

    return res.status(200).json({ message: "Check your email for the new OTP", success: true });
};

// Reset Password (Requires OTP Verification)
export const resetPassword = async (req, res, next) => {
    const { newPassword, email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }

    // Ensure OTP was verified before allowing password reset
    if (!user.otpVerified) {
        return next(new AppError('OTP verification required before resetting password.', 403));
    }

    // Hash new password
    const hashedPassword = hashPassword({ password: newPassword });

    // Update password & reset OTP verification flag
    await user.update({
        password: hashedPassword,
        otpVerified: false,
        lastOtpRequest: null
    });

    return res.status(200).json({ message: 'Password updated successfully', success: true });
};
