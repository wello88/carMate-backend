import { Router } from "express";


import { asyncHandler } from "../../utils/appError.js";
import { createPost, deletePost, getAllPosts, getOwnPosts, getPost, updatePost } from "./community.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { cloudupload } from "../../utils/multer.cloud.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js";

const communityRouter = Router();
// create post
communityRouter.post("/createPost",
    isAuthenticated(),
    cloudupload().fields([{ name: 'images', maxCount: 5 }]),
    asyncHandler(createPost) );
// get all posts
communityRouter.get("/getAllPosts",
    isAuthenticated(),
    asyncHandler(getAllPosts));
// get specific post
communityRouter.get("/getPost/:id",
    isAuthenticated(),
    asyncHandler(getPost));
// get own posts
communityRouter.get("/getOwnPosts",
    isAuthenticated(),
    asyncHandler(getOwnPosts));
// update post
communityRouter.put("/updatePost/:id",
    isAuthenticated(),
    cloudupload().fields([{ name: 'images', maxCount: 5 }]),
    asyncHandler(updatePost));
// delete post
communityRouter.delete("/deletePost/:id",
    isAuthenticated(),
    asyncHandler(deletePost));

// get all posts by user
// communityRouter.get("/getPostsByUser/:id",
//     isAuthenticated(),
//     asyncHandler(getPostsByUser));


// export router
export default communityRouter;