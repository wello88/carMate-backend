import { Session, Post, User, Worker, Offer } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";


export const startSession = async (req, res, next) => {
    const { startDate,isAccepted } = req.body;
    if (!startDate) {
        return next(new AppError("startDate is required", 400));
    }

    const { postId, offerId } = req.params;
    if (!postId || !offerId) {
        return next(new AppError("postId and offerId are required", 400));
    }
    const userId = req.authUser.id;

    // Check if the post and offer exist
    const post = await Post.findByPk(postId);
    const offer = await Offer.findByPk(offerId);

    if (!post || !offer) {
        return next(new AppError("Post or Offer not found", 404));
    }

    // Check if a session already exists for this post and offer
    const existingSession = await Session.findOne({
        where: { postId, offerId },
    });

    if (existingSession) {
        return next(new AppError("A session for this post and offer already exists. You cannot modify the start date.", 400));
    }

    // Create session
    const session = await Session.create({
        userId,
        postId,
        workerId: offer.workerId,
        offerId,
        startDate,
        isAccepted:true,
      });
      


    res.status(201).json({
        status: "success",
        data: { session },
    });
};

export const endSession = async (req, res, next) => {
    const { endDate,isDone } = req.body;
    if (!endDate) {
        return next(new AppError("endDate is required", 400));
    }
    if (isDone === undefined) {
        return next(new AppError("isDone is required", 400));
    }
    if (typeof isDone !== "boolean") {
        return next(new AppError("isDone must be a boolean", 400));
    }
    const { sessionId } = req.params;
    if (!sessionId) {
        return next(new AppError("sessionId is required", 400));
    }

    // Find the session
    const session = await Session.findByPk(sessionId);

    if (!session) {
        return next(new AppError("Session not found", 404));
    }

    // Ensure endDate is not set already
    if (session.endDate) {
        return next(new AppError("End date is already set and cannot be modified.", 400));
    }

    // Update session with endDate and mark as done
    session.endDate = endDate;
    session.isDone = isDone;
    await session.save();

    if(session.isDone===true){
        const offer = await Offer.findByPk(session.offerId);
        if (!offer) {
            return next(new AppError("Offer not found", 404));
        }
        offer.isCompleted = true;
        await offer.save();
        const post = await Post.findByPk(session.postId);
        if (!post) {
            return next(new AppError("Post not found", 404));
        }
        post.isCompleted = true;
        await post.save();

      const closeAllSessions = await Session.update(
            { closed: true },
            { where: { postId: session.postId } }
        );
        if (!closeAllSessions) {
            return next(new AppError("Failed to close all sessions", 500));
        }  
    }

    res.status(200).json({
        status: "success",
        data: { session },
    });
};


export const getMyOwnSessions = async (req, res, next) => {
    const userId = req.authUser.id;
  
    const sessions = await Session.findAll({
      where: { userId },
      include: [
        {
          model: Post,
          as: "post", // ✅ Match alias in model
          attributes: ["id", "postContent", "images", "userId"],
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
        {
          model: Worker,
        //   as: "worker", // ✅ Match alias in model
          attributes: ["id", "specialization", "rating", "location"],
          include: [
            {
              model: User,
              attributes: ["id", "firstName", "lastName", "email", "phone"],
            },
          ],
        },
        {
          model: Offer,
          as: "offer", // ✅ Match alias in model
          attributes: ["id", "cash", "note", "workerId"],
          include: [
            {
              model: Worker,
              as: "worker",
              attributes: ["id", "specialization", "rating"],
              include: [
                {
                  model: User,
                  attributes: ["id", "firstName", "lastName", "email"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "user", // ✅ Match alias in model
          attributes: ["id", "firstName", "lastName", "email","profilePhoto"],
        },
      ],
    });
  
    res.status(200).json({
      status: "success",
      data: { sessions },
    });
  }