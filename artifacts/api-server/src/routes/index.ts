import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import notesRouter from "./notes.js";
import orchestrateRouter from "./orchestrate.js";
import graphRouter from "./graph.js";
import twinRouter from "./twin.js";
import timelineRouter from "./timeline.js";
import collectionsRouter from "./collections.js";
import dashboardRouter from "./dashboard.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/notes", notesRouter);
router.use("/orchestrate", orchestrateRouter);
router.use("/graph", graphRouter);
router.use("/twin", twinRouter);
router.use("/timeline", timelineRouter);
router.use("/collections", collectionsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
