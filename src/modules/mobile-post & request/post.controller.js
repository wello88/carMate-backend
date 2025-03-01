import { Post, User } from "../../../db/index.js";
import { ApiFeature } from "../../utils/apiFeature.js";
import { AppError } from "../../utils/appError.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { messages } from "../../utils/constant/messages.js";

// create post
export const createPost = async (req, res, next) => {
    const { postContent, images, comments, likes } = req.body;
    const userId = req.authUser.id;
    const userdata = await User.findByPk(userId, {
        attributes: ['firstName', 'lastName', 'profilePhoto']
    });
    // validate post content
    if (!postContent) {
        return next(new AppError(messages.post.contentRequired, 400));
    }
    // create post
    const post = await Post.create({
        postContent,
        images: [],
        userId,
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
        data: { post, userdata }
    })
};





export const getAllPosts = async (req, res, next) => {
        const apiFeatures = new ApiFeature(Post, req.query)
            .pagination()
            .filter()
            .sort()
            .select();

        // First, get the posts with pagination
        const result = await apiFeatures.execute();

        if (!result.data || result.data.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No posts found'
            });
        }

        // Extract all user IDs from the posts
        const userIds = [...new Set(result.data.map(post => post.userId))];
        
        // Fetch all relevant users in one query
        const users = await User.findAll({
            where: { id: userIds },
            attributes: ['id', 'firstName', 'lastName', 'profilePhoto']
        });
        
        // Create a map of users by ID for quick lookup
        const userMap = {};
        users.forEach(user => {
            userMap[user.id] = user.get({ plain: true });
        });
        
        // Attach user data to each post
        const postsWithAuthors = result.data.map(post => {
            const plainPost = post.get({ plain: true });
            return {
                ...plainPost,
                author: userMap[post.userId] || null
            };
        });

        return res.status(200).json({
            status: 'success',
            count: result.count,
            data: postsWithAuthors,
            page: result.page,
            size: result.size,
            totalPages: result.totalPages
        });

};

// get specific post
export const getPost = async (req, res, next) => {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
        return next(new AppError(messages.post.notFound, 404));
    }
    const user = await User.findByPk(post.userId, {
        attributes: ['firstName', 'lastName', 'profilePhoto']
    });
    post.dataValues.user = user;
    return res.status(200).json({
        status: "success",
        data: { post, user }
    })
};



// get own posts
export const getOwnPosts = async (req, res, next) => {
    const userId = req.authUser.id;
    const posts = await Post.findAll({ where: { userId } });
    if (!posts) {
        return next(new AppError(messages.post.notFound, 404));
    }
    return res.status(200).json({
        status: "success",
        data: { posts }
    })
}
// update post
export const updatePost = async (req, res, next) => {
    const { id } = req.params;
    const { postContent, images, comments, likes } = req.body;
    const userId = req.authUser.id;
    // find related post for user
    const post = await Post.findOne({ where: { id, userId: userId } });
    if (!post) {
        return next(new AppError(messages.post.notFound, 404));
    }
    if (postContent) {
        post.postContent = postContent
    }
    if (comments) {
        post.comments = comments
    }
    if (likes) {
        post.likes = likes
    }
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
    const { id } = req.params;
    const userId = req.authUser.id;
    // find related post for user
    const post = await Post.findOne({ where: { id, userId: userId } });
    if (!post) {
        return next(new AppError(messages.post.notFound, 404));
    }
    // delete image from cloudinary

    if (post.images && post.images.length > 0) {
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
    const posts = await Post.findAll({ where: { userId } });
    if (!posts) {
        return next(new AppError(messages.post.notFound, 404));
    }
    return res.status(200).json({
        status: "success",
        data: { posts }
    })
}
