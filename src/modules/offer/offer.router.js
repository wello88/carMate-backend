import express from 'express';
import { asyncHandler } from '../../utils/appError.js';
import { createOffer, getAllOffers } from './offer.controller.js';
import { isAuthenticated } from '../../middleware/authentication.js';

const offerRouter = express.Router();

// Worker submits an offer
offerRouter.post('/offer/:postId',isAuthenticated(), asyncHandler(createOffer))
// Get all offers for a post
offerRouter.get('/:postId', isAuthenticated(), asyncHandler(getAllOffers))

export default offerRouter;
