import {Router} from 'express';
import { asyncHandler } from "../../utils/appError.js";
import { createPost, deletePost, getAllPosts, getOwnPosts, getPost, updatePost } from "./post.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { cloudupload } from "../../utils/multer.cloud.js";



const postRouter = Router();


// create post
postRouter.post("/createPost",
    isAuthenticated(),
    cloudupload().fields([{ name: 'images', maxCount: 5 }]),
    asyncHandler(createPost) );


// get all posts
postRouter.get("/getAllPosts",
    isAuthenticated(),
    getAllPosts);

    
// get specific post
postRouter.get("/getPost/:id",
    isAuthenticated(),
    asyncHandler(getPost));
// get own posts
postRouter.get("/getOwnPosts",
    isAuthenticated(),
    asyncHandler(getOwnPosts));
// update post
postRouter.put("/updatePost/:id",
    isAuthenticated(),
    cloudupload().fields([{ name: 'images', maxCount: 5 }]),
    asyncHandler(updatePost));
// delete post
postRouter.delete("/deletePost/:id",
    isAuthenticated(),
    asyncHandler(deletePost));

// get all posts by user
// communityRouter.get("/getPostsByUser/:id",
//     isAuthenticated(),
//     asyncHandler(getPostsByUser));


// export router


export default postRouter;