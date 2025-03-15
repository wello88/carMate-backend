import { messages } from "../../utils/constant/messages.js";
import { AppError } from "../../utils/appError.js";
import { Community, Comment, User } from "../../../db/index.js"; // Ensure Comment model exists
import { where } from "sequelize";
import { sequelize } from "../../../db/connection.js";

// ✅ Create a Comment
export const createComment = async (req, res, next) => {
    try {
        const postId = req.params.postId
        const { commentContent } = req.body;
        const userId = req.authUser.id;

        // Validate comment content
        if (!commentContent) {
            return next(new AppError(messages.comment.contentRequired, 400));
        }

        // Check if post exists
        const post = await Community.findByPk(postId);
        if (!post) {
            return next(new AppError(messages.post.notFound, 404));
        }

        // Create comment
        const comment = await Comment.create({
            postId,
            userId,
            commentContent
        });
        // In createComment controller
        await Community.update(
            { comment: sequelize.literal('comment + 1') },
            { where: { id: postId } }
        );

        return res.status(201).json({
            status: "success",
            message: "Comment added successfully",
            data: { comment }
        });

    } catch (error) {
        next(error);
    }
};

// ✅ Get All Comments for a Post
export const getCommentsByPost = async (req, res, next) => {
    try {
        const { postId } = req.params;

        // Check if post exists
        const post = await Community.findByPk(postId);
        if (!post) {
            return next(new AppError(messages.post.notFound, 404));
        }

        const comments = await Comment.findAll({
            where: { postId },
            order: [['createdAt', 'DESC']] // Optional: sort by newest first
        });

        // Get comment count
        const commentCount = comments.length;

        //map on each comment to return user details
        const commentsWithUser = await Promise.all(comments.map(
            async (comment) => {
                const user = await User.findByPk(comment.userId);
                return {
                    id: comment.id,
                    commentContent: comment.commentContent,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        profilePhoto: user.profilePhoto
                    }
                };
            }));

        return res.status(200).json({
            status: "success",
            data: {
                totalComments: commentCount,
                comments: commentsWithUser
            }
        });

    } catch (error) {
        next(error);
    }
};

// ✅ Update a Comment
export const updateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { commentContent } = req.body;
        const userId = req.authUser.id;

        // Validate comment content
        if (!commentContent) {
            return next(new AppError(messages.comment.contentRequired, 400));
        }

        // Find the comment
        const comment = await Comment.findOne({ where: { id: commentId } });
        if (!comment) {
            return next(new AppError(messages.comment.notFound, 404));
        }

        // Check if the user is the comment creator
        if (comment.userId !== userId) {
            return next(new AppError(messages.comment.notauthorized, 403));
        }

        // Update comment
        comment.commentContent = commentContent;
        await comment.save();

        return res.status(200).json({
            status: "success",
            message: "Comment updated successfully",
            data: { comment }
        });

    } catch (error) {
        next(error);
    }
};


// ✅ Delete a Comment
export const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.authUser.id;

        // Find the comment
        const comment = await Comment.findOne({ where: { id: commentId } });
        if (!comment) {
            return next(new AppError(messages.comment.notFound, 404));
        }

        // Find the related post
        const post = await Community.findByPk(comment.postId);
        if (!post) {
            return next(new AppError(messages.post.notFound, 404));
        }

        // Check if the user is the comment owner OR the post owner
        if (comment.userId !== userId && post.userId !== userId) {
            return next(new AppError(messages.comment.notauthorized, 403));
        }
        // In deleteComment controller
        await Community.update(
            { comment: sequelize.literal('comment - 1') },
            { where: { id: comment.postId } }
        );
        // Delete comment
        await comment.destroy();

        return res.status(200).json({
            status: "success",
            message: "Comment deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};
