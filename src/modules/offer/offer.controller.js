import { Notification, Post, User, Worker } from "../../../db/index.js";
import Offer from "../../../db/models/offer.model.js";
import { AppError } from "../../utils/appError.js";

export const createOffer = async (req, res, next) => {
  
    const { cash, note } = req.body;
    const workerId = req.authUser.id;
    const { postId } = req.params;

    // Check if the post exists
    const post = await Post.findByPk(postId);
    if (!post) return next(new AppError('Post not found', 404));

    // Create offer
    const offer = await Offer.create({ workerId, postId, cash, note });

    // Notify the customer who created the post
    await Notification.create({
      userId: post.userId,
      message: `A worker has offered help on your post: ${post.postContent}. Check the offer details.`,
    });

    res.status(201).json({
      status: 'success',
      data: { offer },
    });
 
};




export const getAllOffers = async (req, res, next) => {
    
      const { postId } = req.params;
      
      const offers = await Offer.findAll({ where: { postId },include: [
        {
          model: Worker,
          as: 'worker',
          include: [
            {
              model: User, // Get User details through Worker model
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profilePhoto'], // Choose user attributes
            },
          ],
        },
      ],
     });
      
  
      res.status(200).json({
        status: 'success',
        data: { offers},
      });
   
  };