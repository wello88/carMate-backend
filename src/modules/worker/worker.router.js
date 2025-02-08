import { Router } from "express";

import { GetWrokers } from "./worker.controller.js";
import { asyncHandler } from "../../utils/appError.js";

const workerRouter = Router();

workerRouter.get("/workers",asyncHandler(GetWrokers) );

export default workerRouter;