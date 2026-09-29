import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import feedbackRouter from "./feedback";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(feedbackRouter);

export default router;
