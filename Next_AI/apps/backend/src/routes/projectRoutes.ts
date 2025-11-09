import { Router } from "express";
import { createProject, deleteProject, getProject, getProjects, updateProject } from "../controller/projectController";
import { authMiddleware } from "../middlewares/authMiddlewares";

const ProjectRouter = Router();

ProjectRouter.post("/create-project", authMiddleware, createProject);
ProjectRouter.get("/get-projects", authMiddleware, getProjects);
ProjectRouter.get("/get-project/:id", authMiddleware, getProject);
ProjectRouter.put("/update-project/:id", authMiddleware, updateProject);
ProjectRouter.delete("/delete-project/:id", authMiddleware, deleteProject);

export default ProjectRouter;
