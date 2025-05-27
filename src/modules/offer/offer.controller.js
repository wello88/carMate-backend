import { Notification, Post, User, Worker } from "../../../db/index.js";
import { Session } from "../../../db/index.js";
import Offer from "../../../db/models/offer.model.js";
import { AppError } from "../../utils/appError.js";

export const createOffer = async (req, res, next) => {
    try {
        const { cash, note } = req.body;
        const workerId = req.authUser.id;
        const { postId } = req.params;

        // Check post status
        const checkStatus = await Post.findOne({ where: { id: postId } });
        if (!checkStatus) {
            return next(new AppError('Post not found', 404));
        }
        if (checkStatus.isCompleted === true) {
            return next(new AppError('Post is already completed by another worker and cannot be offered again', 400));
        }

        // Get worker details for notification
        const worker = await Worker.findOne({
            where: { id: workerId },
            include: [{
                model: User,
                attributes: ['firstName', 'lastName', 'profilePhoto']
            }]
        });

        if (!worker) {
            return next(new AppError('Worker not found', 404));
        }

        // Create offer
        const offer = await Offer.create({ workerId, postId, cash, note });

        // Get the first profile photo from the array or null
        const profilePicture = Array.isArray(worker.User.profilePhoto) && worker.User.profilePhoto.length > 0 
            ? worker.User.profilePhoto[0] 
            : null;

        // Notify the customer who created the post
        await Notification.create({
            userId: checkStatus.userId,
            firstName: worker.User.firstName,
            lastName: worker.User.lastName,
            profilePicture: profilePicture,
            type: 'offer',
            arabicMessage: `لقد قدم ${worker.User.firstName} عرضًا لمساعدتك في منشورك: ${checkStatus.postContent}. تحقق من تفاصيل العرض.`,
            message: `${worker.User.firstName} has offered help on your post: ${checkStatus.postContent}. Check the offer details.`,
        });

        res.status(201).json({
            status: 'success',
            data: { offer }
        });
    } catch (error) {
        next(error);
    }
};




export const getAllOffers = async (req, res, next) => {
  const { postId } = req.params;

  const offers = await Offer.findAll({
    where: { postId },
    include: [
      {
        model: Worker,
        as: 'worker',
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profilePhoto'],
          },
        ],
      },
      {
        model: Session,
        as: 'session',
        required: false, // allow null (if no session is associated)
        attributes: ['startDate', 'endDate'],
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    data: { offers },
  });
};
