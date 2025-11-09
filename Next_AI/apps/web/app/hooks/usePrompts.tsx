import { WORKER_URL } from "config";
import { useEffect, useState } from "react"


export const usePrompts = (projectId: string) => {
    const [prompts, setPrompts] = useState<any[]>([]);
    


    useEffect(() => {
        const fetchPrompts = async () => {
            try {
                const response = await fetch(`${WORKER_URL}/prompts/${projectId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch prompts");
                }
                const data = await response.json();
                setPrompts(data);
            } catch (error) {
                console.error("Error fetching prompts:", error);
            }
        };

        fetchPrompts();
    }, []);

    return (
        {prompts}
    )
}