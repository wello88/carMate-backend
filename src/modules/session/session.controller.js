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
  try {
      const { endDate, isDone } = req.body;
      const { sessionId } = req.params; // Use query parameter for sessionId

      // Input validation
      if (!endDate) {
          return next(new AppError("endDate is required", 400));
      }
      if (isDone === undefined) {
          return next(new AppError("isDone is required", 400));
      }
      if (typeof isDone !== "boolean") {
          return next(new AppError("isDone must be a boolean", 400));
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
      session.closed = true; // Mark session as closed
      await session.save();

      if (isDone === true) {
          // Update all offers for this post to be accepted
          await Offer.update(
              { isAccepted: true },
              { where: { postId: session.postId } }
          );

          // Update post as completed
          const post = await Post.findByPk(session.postId);
          if (!post) {
              return next(new AppError("Post not found", 404));
          }
          post.isCompleted = true;
          await post.save();

          // Close all sessions for this post
          await Session.update(
              { closed: true },
              { where: { postId: session.postId } }
          );
      }

      // Get updated session with related data
      const updatedSession = await Session.findByPk(sessionId, {
          include: [
              {
                  model: Post,
                  as: 'post',
                  attributes: ['id', 'postContent', 'images', 'isCompleted']
              },
              {
                  model: Offer,
                  as: 'offer',
                  attributes: ['id', 'cash', 'note', 'isAccepted']
              }
          ]
      });

      return res.status(200).json({
          status: "success",
          data: { session: updatedSession }
      });

  } catch (error) {
      next(error);
  }
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