import { Category, Product, User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js"; // Function to delete images from Cloudinary
import { ApiFeature } from "../../utils/apiFeature.js";


//seller add product
export const AddProduct = async (req, res, next) => {
    const { title, slug, productLink, price, description, categoryId } = req.body;
    const createdBy = req.authUser.id;

    if (req.authUser.role !== "seller") {
        return next(new AppError("Unauthorized access", 403));
    }

    // Validate required fields before any uploads
    if (!title || !slug  || !price || !description || !categoryId) {
        return next(new AppError("All fields are required", 400));
    }

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
};



//update owned products
export const UpdateProduct = async (req, res, next) => {
    const {id} = req.params
    const { title, slug, productLink, price, description,mainImage,subImages, categoryId } = req.body;
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

    if (categoryId) {
        product.categoryId = categoryId;
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
    const seller = await User.findByPk(product.createdBy,{
        attributes: ['id', 'firstName', 'lastName', 'email','profilePhoto', 'phone' ] // Select specific fields
    });
    if (!product) {
        return next(new AppError(messages.product.notfound, 404));
    }
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

    return res.status(200).json({
        status: "success",
        data: { categories }
    })

}



//get all products with apifetures
export const GetProducts = async (req, res, next) => {

    const apiFetures = new ApiFeature(Product, req.query)
        .pagination()
        .filter()
        .search()
        .sort()
        .select()

    const result = await apiFetures.execute();

    if (!result) {
        return next(new AppError(messages.product.notfound, 404));
    }

    return res.status(200).json({
        status: "success",
        ...result
    })
}