import { Router } from "express";
import { getPromptByProjectId} from "../controller/promptsController";
import { authMiddleware } from "../middlewares/authMiddlewares";

const promptRouter = Router();

promptRouter.get("/prompts/:projectId", authMiddleware, getPromptByProjectId);

export default promptRouter;
