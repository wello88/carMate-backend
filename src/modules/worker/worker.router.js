import { Router } from "express";

import { GetWrokers, UpdateWorkerProfile } from "./worker.controller.js";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { cloudupload } from "../../utils/multer.cloud.js";

const workerRouter = Router();

workerRouter.get("/workers",asyncHandler(GetWrokers) );
workerRouter.put('/update-worker-profile',isAuthenticated(),cloudupload().fields([{ name: 'profilePhoto', maxCount: 1 }]),asyncHandler(UpdateWorkerProfile))

export default workerRouter;