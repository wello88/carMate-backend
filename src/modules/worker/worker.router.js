import { Router } from "express";

import { GetWrokers, UpdateWorkerProfile } from "./worker.controller.js";
import { asyncHandler } from "../../utils/appError.js";
import { isAuthenticated } from "../../middleware/authentication.js";

const workerRouter = Router();

workerRouter.get("/workers",asyncHandler(GetWrokers) );
workerRouter.post('/update-worker-profile',isAuthenticated(),asyncHandler(UpdateWorkerProfile))

export default workerRouter;