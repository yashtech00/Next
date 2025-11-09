import ProjectRequest from "@/components/ProjectRequest";
import axios from "axios";
import { K8S_ORCHESTRATOR_URL } from "config";



interface Params {
	params: Promise<{ projectId: string }>
}

export default async function ProjectPage({params}: Params) {
    const projectId = (await params).projectId;
    const response = await axios.get(`${K8S_ORCHESTRATOR_URL}/projects/${projectId}`);
    const { sessionUrl, previewUrl, workerUrl } = response.data;
    return (
        <ProjectRequest
        projectId={projectId} 
		sessionUrl={sessionUrl} 
		previewUrl={previewUrl} 
		workerUrl={workerUrl} 
        />
    )
}