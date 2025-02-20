import { Router } from "express";

import { getSpecificWorker, GetWrokers, UpdateWorkerProfile } from "./worker.controller.js";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { cloudupload } from "../../utils/multer.cloud.js";

const workerRouter = Router();

workerRouter.get("/workers", asyncHandler(GetWrokers));
workerRouter.put('/update-worker-profile',
    isAuthenticated(),
    cloudupload().fields([{ name: 'profilePhoto', maxCount: 1 }]), asyncHandler(UpdateWorkerProfile))

    
workerRouter.get("/worker/:id", asyncHandler(getSpecificWorker));
export default workerRouter;