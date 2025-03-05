import { Router } from "express";
import { startSession, endSession, getMyOwnSessions } from "./session.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";




const sessionRouter = Router();

sessionRouter.post('/startsession/:postId/:offerId', isAuthenticated(), startSession);
sessionRouter.put('/endsession/:sessionId', isAuthenticated(), endSession);
sessionRouter.get('/getMyOwnSessions',isAuthenticated(), getMyOwnSessions);

export default sessionRouter;