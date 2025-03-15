import { messages } from "../../utils/constant/messages.js";
import { AppError } from "../../utils/appError.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { Community, User } from "../../../db/index.js";
import { ApiFeature } from "../../utils/apiFeature.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js";

// create post
export const createPost = async (req, res, next) => {
    const {postContent,images,comments,likes}=req.body;
    const userId = req.authUser.id;
    // validate post content
    if (!postContent) {
        return next(new AppError(messages.post.contentRequired, 400));
    }
    // create post
    const post = await Community.create({
        postContent,
        images:[],
        comments,
        likes,
        userId: userId,
    });
    // check if post created
    if (!post) {
            return next(new AppError(messages.post.failtocreate, 400));
        }
    // Upload images
    let ImageUrls = [];
    if (req.files.images) {
        ImageUrls = await Promise.all(
            req.files.images.map(async (file) => {
            const result = await uploadToCloudinary(file.buffer, "sub-images");
                return result.secure_url;
                })
            );
        }
    // Update post with image URLs
    post.images = ImageUrls;
    await post.save();
    // return response
    return res.status(201).json({
        status: "success",
        messsage: messages.post.createSuccessfully,
    })
};

// get all posts with apifetures
export const getAllPosts = async (req, res, next) => {
    try {
        const apiFetures = new ApiFeature(Community, req.query)
            .pagination()
            .filter()
            .sort()
            .select();

        const result = await apiFetures.execute();

        if (!result.data || result.data.length === 0) {
            return next(new AppError(messages.post.notFound, 404));
        }

        // Extract all user IDs from the posts
        const userIds = [...new Set(result.data.map(post => post.userId))];
        
        // Fetch all relevant users in one query
        const users = await User.findAll({
            where: { id: userIds },
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePhoto', 'phone']
        });

        // Create a map of users by ID for quick lookup
        const userMap = {};
        users.forEach(user => {
            userMap[user.id] = user.get({ plain: true });
        });

        // Attach user data to each post
        const postsWithUsers = result.data.map(post => {
            const plainPost = post.get({ plain: true });
            const { userId, ...postWithoutUserId } = plainPost; // Remove userId
            return {
                ...postWithoutUserId,
                user: userMap[post.userId] || null
            };
        });

        
        return res.status(200).json({
            status: "success",
            count: result.count,
            data: postsWithUsers,
            page: result.page,
            size: result.size,
            totalPages: result.totalPages
        });
    } catch (error) {
        next(error);
    }
};


// get specific post
export const getPost = async (req, res, next) => {
    const post = await Community.findByPk(req.params.id);
    const user = await User.findByPk(post.userId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePhoto', 'phone']
    });
    // Transform post data
    const plainPost = post.get({ plain: true });
    const { userId, ...postWithoutUserId } = plainPost;

    const transformedPost = {
        ...postWithoutUserId,
        user: user ? user.get({ plain: true }) : null
    };

    return res.status(200).json({
        status: "success",
        data: { post: transformedPost }
    });
} 
// get own posts
export const getOwnPosts = async (req, res, next) => {
    const userId = req.authUser.id;
    const posts = await Community.findAll({ where: { userId } });
    if (!posts) {
        return next(new AppError(messages.post.notFound, 404));
    }
    // Get user data once
    const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePhoto', 'phone']
    });
   
        // Transform posts data
        const Posts = posts.map(post => {
            const plainPost = post.get({ plain: true });
            const { userId, ...postWithoutUserId } = plainPost;
            return {
                ...postWithoutUserId,
                user: user ? user.get({ plain: true }) : null
            };
        });

    return res.status(200).json({
        status: "success",
        data: { Posts } 
    })
}
// update post
export const updatePost = async (req, res, next) => {
    const {id}=req.params;
    const {postContent,images}=req.body;
    const userId = req.authUser.id;
    // find related post for user
    const post = await Community.findOne({ where: { id,userId: userId } });
    if (!post) {
        return next(new AppError(messages.post.notFound, 404));
    }
    if(postContent){
        post.postContent=postContent
    }
    // if(comments){
    //     post.comments=comments
    // }
    // if(likes){
    //     post.likes=likes
    // }
    // handle image upload
    if (req.files.images) {
        const ImageUrls = await Promise.all(
            req.files.images.map(async (file) => {
                const result = await uploadToCloudinary(file.buffer, "sub-images");
                return result.secure_url;
            })
        );
        post.images = ImageUrls;
    }
    await post.save();
    // return response
    return res.status(200).json({
        status: "success",
        data: { post: post }
    })
}
// delete post
export const deletePost = async (req, res, next) => {
    const {id}=req.params;
    const userId = req.authUser.id;
    // find related post for user
    const post = await Community.findOne({ where: { id,userId: userId } });
    if (!post) {
        return next(new AppError(messages.post.notFound, 404));
    }
    // delete image from cloudinary
    
    if(post.images && post.images.length > 0) {
        await Promise.all(post.images.map(async (url) => await deleteFromCloudinary(url)));
    }
    await post.destroy();
    // return response
    return res.status(200).json({
        status: "success",
        data: { post: post }
    })
}

// get all posts by user
export const getPostsByUser = async (req, res, next) => {
    const userId = req.params.id;
    const posts = await Community.findAll({ where: { userId } });
    if (!posts) {
        return next(new AppError(messages.post.notFound, 404));
    }
    return res.status(200).json({
        status: "success",
        data: { posts }
    })
}
