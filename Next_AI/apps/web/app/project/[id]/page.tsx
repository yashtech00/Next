import ProjectRequest from "@/components/ProjectRequest";
import axios from "axios";
import { K8S_ORCHESTRATOR_URL, BACKEND_URL } from "config";

interface Params {
	params: Promise<{ id: string }>
}

export default async function ProjectPage({params}: Params) {
    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    
    if (!projectId) {
        return <div>Project ID is required</div>;
    }
    try {
        console.log("projectId from params:", projectId);
        
        // First verify project exists in backend
        try {
            const backendProject = await axios.get(`${K8S_ORCHESTRATOR_URL}/api/v1/projects/${projectId}`, {
                timeout: 5000,
            });
            console.log("Project verified in backend:", backendProject.data?.id);
        } catch (backendError: any) {
            if (backendError.response?.status === 404) {
                return (
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
                        <p className="text-gray-600">The project with ID {projectId} does not exist.</p>
                    </div>
                );
            }
            console.warn("Backend check failed, continuing to orchestrator:", backendError.message);
        }
        
        // Then call k8 orchestrator
        const k8link = `${K8S_ORCHESTRATOR_URL}/projects/${projectId}`;
        console.log("k8link", k8link);
        const response = await axios.get(k8link, {
            timeout: 30000, // Increased timeout for pod creation
        })
        const { sessionUrl, previewUrl, workerUrl } = response.data;
        console.log("sessionUrl", sessionUrl);
        console.log("previewUrl", previewUrl);
        console.log("workerUrl", workerUrl);
        return (
            <ProjectRequest
            projectId={projectId}  
            sessionUrl={sessionUrl} 
            previewUrl={previewUrl} 
            workerUrl={workerUrl} 
            />
        )
    } catch (error: any) {
        console.error("Error fetching project:", error);
        console.error("Error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        if (error.response?.status === 404) {
            const errorMessage = error.response?.data?.error || "Project not found in orchestrator";
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
                    <p className="text-gray-600">{errorMessage}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Project ID: {projectId}
                    </p>
                </div>
            );
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            return (
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">Connection Error</h2>
                    <p className="text-gray-600">
                        Unable to connect to the orchestrator service. 
                        Please make sure the k8 orchestrator is running on port 3000.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Error: {error.message || error.code}
                    </p>
                </div>
            );
        }
        throw error;
    }
}