"use client"

import { usePrompts } from "@/hooks/usePrompts";
import { useState } from "react";

export const Project: React.FC<{ projectId: string, sessionUrl: string, previewUrl: string, workerUrl: string }> = ({projectId, sessionUrl, previewUrl, workerUrl }) => {

    const prompt = usePrompts(projectId);
    const [input, setInput] = useState(prompt);

    return (
    <div className="flex flex-col items-center justify-center h-screen">

        <div className="w-full h-full">
            
        </div>
    </div>
    )
}