import { Op } from "sequelize"
import { Category, Product, User, Worker } from "../../../db/index.js"
import { ApiFeature } from "../../utils/apiFeature.js"
import { AppError } from "../../utils/appError.js"
import { deleteFromCloudinary, uploadToCloudinary } from "../../utils/cloudinary.js"
import { messages } from "../../utils/constant/messages.js"
import { comparePassword, hashPassword } from "../../utils/hashAndcompare.js"
import { genrateToken } from "../../utils/token.js"
import { sequelize } from "../../../db/connection.js"
import slugify from 'slugify';



//admin login to admin panel
export const adminLogin = async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new AppError(messages.user.invalidCreadintials, 401));
    }

    const user = await User.findOne({
        where: {
            email: email,
            role: {
                [Op.or]: ["admin", "superadmin", "seller"]
            }
        }
    })

    if (!user) {
        return next(new AppError("User not found OR Unauthorized", 404));
    }

    if (!["admin", "superadmin", "seller"].includes(user.role)) {
        return next(new AppError(messages.user.notauthorized, 403));
    }

    // Compare passwords
    const isValid = comparePassword({ password, hashPassword: user.password });

    if (!isValid) {
        return next(new AppError(messages.user.invalidCreadintials, 401));
    }

    // Verify user status
    if (user.status !== 'verified') {
        return next(new AppError(messages.user.notverified, 401));
    }

    user.isActive = true
    await user.save()

    const token = genrateToken({ payload: { id: user.id, email, role: user.role } });
    const role = user.role
    res.status(200).json({
        status: messages.user.loginSuccessfully,
        data: {
            token, role
        }
    })

}


//logout
export const adminLogout = async (req, res, next) => {
    const userId = req.authUser.id

    const user = await User.findByPk(userId)

    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }

    user.isActive = false
    await user.save()
    res.status(200).json({
        status: messages.user.logoutsuccessfully,
        data: null
    })
}




//admin add category
export const AddCategory = async (req, res) => {

    const { name,arabicName } = req.body
    const createdBy = req.authUser.id
    const slug = slugify(name, { lower: true });

    const category = await Category.create({
        name,
        arabicName,
        slug,
        createdBy: createdBy
    })
    if (!category) {
        return next(new AppError(messages.category.failtocreate, 400))
    }
    res.status(201).json({
        status: messages.category.createSuccessfully,
        data: {
            category
        }
    })

}


//admin add user(customer, worker, seller) and if worker add specialization and location

export const addUser = async (req, res, next) => {
    const { firstName, lastName, email, password, phone, role, status, specialization, location } = req.body;
    const createdBy = req.authUser.id;

    if (role === 'admin' || role === 'superadmin') {
        return next(new AppError('You are not allowed to add admin', 401));
    }

    if (role === 'worker' && (!specialization || !location)) {
        return next(new AppError(messages.user.invalidCreadintials, 401));
    }

    const checkEmailExistance = await User.findOne({ where: { email } });
    if (checkEmailExistance) {
        return next(new AppError(messages.user.alreadyExist, 409));
    }

    const hashedPassword = hashPassword({ password });

    await sequelize.transaction(async (transaction) => {
        const user = await User.create(
            {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone,
                status,
                role,
                createdBy
            },
            { transaction }
        );

        if (role === 'worker') {
            await Worker.create(
                {
                    id: user.id, // Use the user's ID as foreign key
                    specialization,
                    location
                },
                { transaction }
            );
        }
        user.password = undefined;
        user.otpVerified = undefined;
        user.otp = undefined;
        user.otpExpiry = undefined;
        user.otpAttempts = undefined;
        user.isActive = true;

        res.status(201).json({
            status: messages.user.createSuccessfully,
            data: { user }
        });
    });
};



//admin update user
export const updateUser = async (req, res, next) => {

    const userId = req.params.id
    const { firstName, lastName, email, password, phone, role, status, specialization, location, isActive } = req.body

    const user = await User.findByPk(userId)

    const worker = await Worker.findOne({ where: { id: userId } })

    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }
    if (user.role === 'admin' || user.role === 'superadmin') {
        return next(new AppError('you are not allowed to update admin', 401));
    }


    const hashedPassword = hashPassword({ password });

    if (firstName) {
        user.firstName = firstName
    }
    if (lastName) {
        user.lastName = lastName
    }
    if (email) {
        const checkEmailExistance = await User.findOne({ where: { email } });
        if (checkEmailExistance) {
            return next(new AppError(messages.user.alreadyExist, 409));
        }
        user.email = email
    }
    if (password) {
        user.password = hashedPassword
    }
    if (phone) {
        user.phone = phone
    }
    if (role) {
        user.role = role
    }
    if (status) {
        user.status = status
    }
    if (isActive) {
        user.isActive = isActive
    }
    await user.save()
    if (specialization) {

        worker.specialization = specialization
        await worker.save()

    }
    if (location) {
        worker.location = location
        await worker.save()

    }
    user.password = undefined;
    user.otpVerified = undefined;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = undefined;
    res.status(200).json({
        status: messages.user.updateSuccessfully,
        data: {
            user,
            worker
        }
    })
}

//delete user
export const deleteUser = async (req, res, next) => {

    const userId = req.params.id

    const user = await User.findByPk(userId)
    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }
    if (user.role === 'admin' || user.role === 'superadmin') {
        return next(new AppError('you are not allowed to delete admin', 401));
    }
    await user.destroy()

    res.status(200).json({
        status: messages.user.deleteSuccessfully,
    })
}


//get specific user with id in params
export const getSpecificUser = async (req, res, next) => {

    const userId = req.params.id
    const user = await User.findByPk(userId)
    const worker = await Worker.findOne({ where: { id: userId } })
    if (!user) {
        return next(new AppError(messages.user.notfound, 404));
    }
    user.password = undefined;
    user.otpVerified = undefined;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = undefined;

    res.status(200).json({
        status: messages.user.getsuccessfully,
        data: { user, worker }
    })


}




//admin get all users with role customer
export const getAllCustomerUsers = async (req, res, next) => {
    const apiFeatures = new ApiFeature(User, req.query)


        .pagination()
        .filter()
        .sort()
        .select()
        .search();

    // Ensure get users with role worker
    apiFeatures.options.where = {
        ...apiFeatures.options.where,
        role: "customer"
    };

    const result = await apiFeatures.execute();

    if (!result || result.count === 0) {
        return next(new AppError(messages.user.notfound, 404));
    }
    res.status(200).json({
        status: "success",
        ...result
    })

}



//get all users with role worker
export const getAllWorkerUsers = async (req, res, next) => {
    const apiFeatures = new ApiFeature(User, req.query)
        .pagination()
        .filter()
        .sort()
        .select()
        .search();

    // Ensure get users with role worker
    apiFeatures.options.where = {
        ...apiFeatures.options.where,
        role: "worker"
    };

    const result = await apiFeatures.execute();

    if (!result || result.count === 0) {
        return next(new AppError(messages.product.notfound, 404));
    }

    res.status(200).json({
        status: "success",
        ...result
    });

}


//get all users with role seller
export const getAllSellerUsers = async (req, res, next) => {
    const apiFeatures = new ApiFeature(User, req.query)

        .pagination()
        .filter()
        .sort()
        .select()
        .search();

    // Ensure get users with role worker
    apiFeatures.options.where = {
        ...apiFeatures.options.where,
        role: "seller"
    };

    const result = await apiFeatures.execute();

    if (!result || result.count === 0) {
        return next(new AppError(messages.user.notfound, 404));
    }
    res.status(200).json({
        status: "success",
        ...result
    })

}

// admin add product
export const AddProduct = async (req, res, next) => {
    const { title, slug, productLink, price, description, mainImage, subImages, categoryId } = req.body;
    const createdBy = req.authUser.id;


    if (!req.files?.mainImage?.[0]) {
        return next(new AppError("Main image is required", 400));
    }

    // Attempt to create the product first before uploading images
    const product = await Product.create({
        title,
        slug,
        productLink,
        price,
        mainImage: "", // Placeholder, will update later
        subImages: [],
        description,
        createdBy,
        categoryId
    });

    if (!product) {
        return next(new AppError(messages.product.failtocreate, 400));
    }

    // Upload main image
    const mainImageUpload = await uploadToCloudinary(
        req.files.mainImage[0].buffer,
        "main-images"
    );

    let subImageUrls = [];
    if (req.files.subImages) {
        subImageUrls = await Promise.all(
            req.files.subImages.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, "sub-images");
                return result.secure_url;
            })
        );
    }

    // Update product with image URLs
    product.mainImage = mainImageUpload.secure_url;
    product.subImages = subImageUrls;
    await product.save();

    res.status(201).json({
        status: "success",
        data: { product }
    });
}



//get all products with api fetures
export const getAllProducts = async (req, res, next) => {

    const apiFetures = new ApiFeature(Product, req.query)
        .pagination()
        .filter()
        .search()
        .sort()
        .select()

    const result = await apiFetures.execute()

    if (!result) {
        return next(new AppError(messages.product.notfound, 404))
    }

    return res.status(200).json({
        status: "success",
        ...result
    })
}


//admin can update specific product
export const updateProduct = async (req, res, next) => {

    const { id } = req.params
    const { title, slug, productLink, price, description, mainImage, subImages, categoryId } = req.body;

    const product = await Product.findByPk(id)
    if (!product) {
        return next(new AppError(messages.product.notfound, 404));
    }
    if (product.createdBy !== req.authUser.id) {
        return next(new AppError('you are not allowed to update this product', 401));

    }

    if (title) {
        product.title = title;
    }

    if (slug) {
        product.slug = slug;
    }

    if (productLink) {
        product.productLink = productLink;
    }

    if (price) {
        product.price = price;
    }

    if (description) {
        product.description = description;
    }

    // Handle main image upload if provided
    if (req.files?.mainImage?.[0]) {
        const mainImageUpload = await uploadToCloudinary(req.files.mainImage[0].buffer, "main-images");
        product.mainImage = mainImageUpload.secure_url;
    }

    if (req.files.subImages) {
        const subImageUrls = await Promise.all(
            req.files.subImages.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, "sub-images");
                return result.secure_url;
            })
        );
        product.subImages = subImageUrls;
    }

    if (categoryId) {
        product.categoryId = categoryId;
    }

    await product.save()

    res.status(200).json({
        status: messages.product.updateSuccessfully,
        data: {
            product
        }
    })
}



//DELETE SPECIFIC PRODUCT
export const deleteProduct = async (req, res, next) => {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    
    if (!product) {
        return next(new AppError(messages.product.notfound, 404));
    }
    // Delete images from Cloudinary
    try {
        if (product.mainImage) {
            await deleteFromCloudinary(product.mainImage);
        }
        
        if (product.subImages && product.subImages.length > 0) {
            
            await Promise.all(product.subImages.map(async (url) => await deleteFromCloudinary(url)));
        }
    } catch (error) {
        return next(new AppError("Failed to delete images from Cloudinary", 500));
    }
    
    // Delete product from database
    await product.destroy();

    res.status(200).json({

        status: messages.product.deleteSuccessfully,
        data: {
            product
        }
    })
}