
import { prisma } from "db/client";


export const getPromptByProjectId = async (req: any, res: any) => {
    try {
        const { projectId } = req.params;
        const prompts = await prisma.prompt.findMany({
            where: { project_id: projectId },
        });
        res.status(200).json(prompts);
    } catch (error) {
        console.error("Error fetching prompts:", error);
        res.status(500).json({ error: "Failed to fetch prompts" });
    }                   
};



