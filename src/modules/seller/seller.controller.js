import { Category, Product, User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js"; // Function to delete images from Cloudinary
import { ApiFeature } from "../../utils/apiFeature.js";
import SubCategory from "../../../db/models/sub-category.js";


//seller add product
export const AddProduct = async (req, res, next) => {
    const { title,arabicTitle ,slug, productLink, price, description,arabicDescription ,subCategoryId } = req.body;
    const createdBy = req.authUser.id;

    if (req.authUser.role !== "seller") {
        return next(new AppError("Unauthorized access", 403));
    }

    // Validate required fields before any uploads
    if (!title || !slug  || !price || !description || !subCategoryId) { 
        return next(new AppError("All fields are required", 400));
    }

    if (!req.files?.mainImage?.[0]) {
        return next(new AppError("Main image is required", 400));
    }

    // Attempt to create the product first before uploading images
    const product = await Product.create({
        title,
        arabicTitle,
        slug: slugify(slug, { lower: true }),
        productLink,
        price,
        mainImage: "", // Placeholder, will update later
        subImages: [],
        description,
        arabicDescription,
        createdBy,
        subCategoryId
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
};



//update owned products
export const UpdateProduct = async (req, res, next) => {
    const {id} = req.params
    const { title, arabicTitle,slug,arabicDescription, productLink, price, description,mainImage,subImages, SubCategoryId } = req.body;
    const sellerId = req.authUser.id;

    //find belongs products to seller
    const product = await Product.findOne({
        where: {
            id,
            createdBy: sellerId
        }
    });
    if (!product) {
        return next(new AppError(messages.product.notfound, 404));
    }

    if (title) {
        product.title = title;
    }
    if (arabicTitle) {
        product.arabicTitle = arabicTitle;
    }
    if (arabicDescription) {
        product.arabicDescription = arabicDescription;
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

    if (SubCategoryId) {
        product.SubCategoryId = SubCategoryId;
    }
    // Handle main image upload if provided
    if (req.files?.mainImage?.[0]) {
        const mainImageUpload = await uploadToCloudinary(req.files.mainImage[0].buffer, "main-images");
        product.mainImage = mainImageUpload.secure_url;
    }
    
    // Handle sub-image uploads if provided
    if (req.files.subImages) {
        const subImageUrls = await Promise.all(
            req.files.subImages.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, "sub-images");
                return result.secure_url;
            })
        );
        product.subImages = subImageUrls;
    }

    await product.save();

    res.status(200).json({
        status: "success",
        data: { product }
    });
 

}


//get owned products
export const GetSellerProducts = async (req, res, next) => {
    const sellerId = req.authUser.id; // Get logged-in seller ID

    const apiFeatures = new ApiFeature(Product, req.query)
        .pagination()
        .filter()
        .sort()
        .select()
        .search();

    // Ensure products are filtered by the logged-in seller
    apiFeatures.options.where = {
        ...apiFeatures.options.where,
        createdBy: sellerId
    };

    const result = await apiFeatures.execute();

    if (!result || result.count === 0) {
        return next(new AppError(messages.product.notfound, 404));
    }

    res.status(200).json({
        status: "success",
        data: { result }
    });
};

//get specific product with it's created by id data 
export const GetSpecificProduct = async (req, res, next) => {

    const { id } = req.params; // Get product ID from URL
    const product = await Product.findByPk(id);

    if (!product) {
        return next(new AppError(messages.product.notfound, 404));
    }
    const seller = await User.findByPk(product.createdBy,{
        attributes: ['id', 'firstName', 'lastName', 'email','profilePhoto', 'phone' ] // Select specific fields
    });
    return res.status(200).json({
        status: "success",
        data: { product , seller }
    })


}

//delete owned product
export const DeleteProduct = async (req, res, next) => {
    const { id } = req.params; // Get product ID from URL
    const sellerId = req.authUser.id; // Get logged-in seller ID
      
    // Find the product and ensure it belongs to the seller
    const product = await Product.findOne({
        where: { id, createdBy: sellerId }
    });

    if (!product) {
        return next(new AppError("Product not found or unauthorized", 404));
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
        status: "success",
        message: "Product deleted successfully"
    });
};





//get all product categories 
export const GetCategories = async (req, res, next) => {

    const categories = await Category.findAll()
    if (!categories) {
        return next(new AppError(messages.category.notfound, 404));
    }
    // Fetch all categories with their subcategories
    const catrgory_with_subCat = await Promise.all(
        categories.map(async (category) => {
            const subcategories = await SubCategory.findAll({
                where: { categoryId: category.id }
            });
            return { ...category.toJSON(), subcategories };
        })
    );

    catrgory_with_subCat.forEach((category) => {
        delete category.categoryId; // Remove the categoryId field from the response
        delete category.createdAt; // Remove createdAt field if not needed
        delete category.updatedAt; // Remove updatedAt field if not needed
        delete category.createdBy; // Remove createdBy field if not needed
    })

    return res.status(200).json({
        status: "success",
        data: { catrgory_with_subCat }
    })

}


export const GetSubCategories = async (req, res, next) => {
    const { categoryId } = req.params; // Get category ID from query parameters

    if (!categoryId) {
        return next(new AppError("Category ID is required", 400));
    }

    const subCategories = await SubCategory.findAll({
        where: { categoryId: categoryId } // Assuming you have a parentId field for subcategories
    });
    const category = await Category.findByPk(categoryId, {
        attributes: ['id', 'name', 'arabicName', 'slug']
    });
    if (!category) {
        return next(new AppError(messages.category.notfound, 404));
    }
    if (!subCategories) {
        return next(new AppError(messages.category.notfound, 404));
    }

    return res.status(200).json({
        status: "success",
        data: { subCategories, category }
    });
}


//get all products with apifetures
export const GetProducts = async (req, res, next) => {
    try {
        const { categoryId, subCategoryId } = req.query;
        
        // Remove categoryId from query params since we'll handle it separately
        const filteredQuery = { ...req.query };
        delete filteredQuery.categoryId;
        
        const apiFetures = new ApiFeature(Product, filteredQuery)
            .pagination()
            .filter()
            .search()
            .sort()
            .select();

        // Setup includes and where clauses
        apiFetures.options.include = [{
            model: SubCategory,
            as: 'Subcategory',
            attributes: ['id', 'name', 'arabicName', 'slug'],
            required: true, // This makes it an INNER JOIN
            where: categoryId ? { categoryId } : {},
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'arabicName', 'slug']
            }]
        }];

        // Add subCategoryId to where clause if provided
        if (subCategoryId) {
            apiFetures.options.where = {
                ...apiFetures.options.where,
                subCategoryId
            };
        }

        const result = await apiFetures.execute();

        if (!result?.data || result.data.length === 0) {
            return next(new AppError(messages.product.notfound, 404));
        }

        // Get user details
        const userIds = [...new Set(result.data.map(product => product.createdBy))];
        const users = await User.findAll({
            where: { id: userIds },
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePhoto', 'phone']
        });

        const userMap = {};
        users.forEach(user => {
            userMap[user.id] = user.get({ plain: true });
        });

        // Transform response
        const transformedData = result.data.map(product => {
            const plainProduct = product.get({ plain: true });
            return {
                ...plainProduct,
                createdBy: userMap[plainProduct.createdBy] || null
            };
        });

        return res.status(200).json({
            status: "success",
            count: result.count,
            data: transformedData,
            page: result.page,
            size: result.size,
            totalPages: result.totalPages
        });

    } catch (error) {
        next(error);
    }
};