import express from "express";

import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment
} from "./comment.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";

const commentRouter = express.Router();

commentRouter.post("/comments/:postId",isAuthenticated() ,createComment); // Create a comment
commentRouter.get("/comments/:postId", getCommentsByPost); // Get all comments for a post
commentRouter.put("/comments/:commentId",isAuthenticated() ,updateComment); // Update a comment
commentRouter.delete("/comments/:commentId",isAuthenticated(), deleteComment); // Delete a comment

export default commentRouter;
