import { Router } from 'express';
import { isAuthenticated } from '../../middleware/authentication.js';
import { asyncHandler } from '../../utils/appError.js';
import { AddCategory, AddProduct, addUser, adminLogin, adminLogout, deleteProduct, deleteUser, getAllCustomerUsers, getAllProducts, getAllSellerUsers, getAllWorkerUsers, getSpecificUser, updateProduct, updateUser } from './admin.controller.js';
import { isAdmin } from '../../middleware/validation.js';
import { cloudupload } from '../../utils/multer.cloud.js';

const adminRouter = Router();   
//ADD CATEGORY
adminRouter.post('/addCategory',isAuthenticated(),isAdmin,asyncHandler(AddCategory))
//LOGIN TO ADMIN PANEL
adminRouter.post('/login/admin/145461456',asyncHandler(adminLogin))
//LOGOUT
adminRouter.post('/logout',isAuthenticated(),asyncHandler(adminLogout))
//ADD USER 
adminRouter.post('/addUser',isAuthenticated(),isAdmin,asyncHandler(addUser))
//UPDATE USER
adminRouter.put('/updateuser/:id',isAuthenticated(),isAdmin,asyncHandler(updateUser))
//DELETE USER
adminRouter.delete('/deleteuser/:id',isAuthenticated(),isAdmin,asyncHandler(deleteUser))
//GET SPECIFIC USER WITH ID
adminRouter.get('/getSpecificUser/:id',isAuthenticated(),isAdmin,asyncHandler(getSpecificUser))
//GET CUSTOMER USERS
adminRouter.get('/getcustomerusers',isAuthenticated(),isAdmin,asyncHandler(getAllCustomerUsers))
//get all worker users
adminRouter.get('/getworkerusers',isAuthenticated(),isAdmin,asyncHandler(getAllWorkerUsers))
//get all seller users
adminRouter.get('/getsellerusers',isAuthenticated(),isAdmin,asyncHandler(getAllSellerUsers))
//get all products
adminRouter.get('/getAllproducts',isAuthenticated(),isAdmin,asyncHandler(getAllProducts))
//update product
adminRouter.put('/updateproduct/:id',isAuthenticated(),isAdmin,asyncHandler(updateProduct))
//delete product
adminRouter.delete('/deleteproduct/:id',isAuthenticated(),isAdmin,asyncHandler(deleteProduct))
//add product
adminRouter.post('/addproduct',isAuthenticated(),isAdmin,
        cloudupload().fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 }])
         ,asyncHandler(AddProduct))


export default adminRouter;