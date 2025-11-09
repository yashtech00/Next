import { generatePrompt } from "@/lib/AxiosInstanxe"
import { Project } from "@/project/[id]/project";
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"


export default function ProjectRequest ({
    workerUrl,
    sessionUrl,
    projectId,
    previewUrl,
}:{
    projectId: string,
    sessionUrl: string,
    previewUrl: string,
    workerUrl: string
}){

    const searchParams  = useSearchParams();
    const prompt = searchParams.get('initPrompt');

    useEffect(()=>{
        (async ()=>{
            if (prompt) {
                const res = await generatePrompt(projectId, prompt)
            }
        })()
    },[projectId, prompt, workerUrl])



    return(
            <Project 
                projectId={projectId} 
		sessionUrl={sessionUrl} 
		previewUrl={previewUrl} 
		workerUrl={workerUrl} 
            
            />
    )
}