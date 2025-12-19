import type { Request } from "express";
import type { Response } from "express";
import {prisma} from "db/client"


export const createProject = async (req:any, res:any) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }
        
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User ID is missing. Please ensure you are authenticated." });
        }
        
        const title = prompt.split("\n")[0];
        
        const project = await prisma.project.create({
            data: {
                user_id: userId,
                title,
                prompts: {
                    create: [
                        {
                            content: prompt,
                        },
                    ],
                },
            },
        }); // Include the initial prompt in the response
        await prisma.prompt.create({
            data: {
                project_id: project.id,
                content: prompt,
            },
        });
        res.status(201).json({projectId:project.id});
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project" });
    }
};

export const getProjects = async (req: any, res: any) => {
    try {
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: User ID is missing. Please ensure you are authenticated." });
        }
        
        const projects = await prisma.project.findMany({
            where: {
                user_id: userId,
            },
        });
        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get projects" });
    }
};

export const getProject = async (req: Request, res: Response) => {
    try {
        const project = await prisma.project.findUnique({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get project" });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { title } = req.body;
        const project = await prisma.project.update({
            where: {
                id: req.params.id,
            },
            data: {
                title,
            },
        });
        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update project" });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const project = await prisma.project.delete({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete project" });
    }
};