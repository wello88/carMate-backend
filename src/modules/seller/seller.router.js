import { Router } from "express";
import { asyncHandler } from "../../utils/appError.js";
import { AddProduct, DeleteProduct, GetCategories, GetProducts, GetSellerProducts, UpdateProduct } from "./seller.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { cloudupload } from "../../utils/multer.cloud.js";

const SellerRouter = Router();
//add product
SellerRouter.post(
    '/addProduct',
    isAuthenticated(),
    cloudupload().fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 }]),
    asyncHandler(AddProduct)
)

//get owned products
SellerRouter.get('/getownedProducts',
    isAuthenticated(),
    asyncHandler(GetSellerProducts)
)


//update product
SellerRouter.put('/updateProduct/:id',
    isAuthenticated(),
    cloudupload().fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 }]),
    asyncHandler(UpdateProduct)
)

//delete product
SellerRouter.delete('/deleteProduct/:id',
    isAuthenticated(),
    asyncHandler(DeleteProduct)
)


//get categories
SellerRouter.get('/getCategories',
    asyncHandler(GetCategories)
)

//get products
SellerRouter.get('/getProducts',
    asyncHandler(GetProducts)
)



export default SellerRouter;