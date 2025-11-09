import { AuthType } from "@/types/AuthType";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:9090/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance.interceptors.request.use((config) => {
  // You can add authorization headers or other custom headers here
  // For example, if you have a token stored in localStorage:
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const Register = async (formData: AuthType) => {
  try {
    const response = await axiosInstance.post("/auth/register", formData);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const Login = async (formData: AuthType) => {
  try {
    const response = await axiosInstance.post("/auth/login", formData);
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};
export const Logout = async () => {
  try {
    const response = await axiosInstance.post(
      "/auth/logout",
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

export const createProject = async (promptData: string) => {
  try {
    const response = await axiosInstance.post(
      "/projects/create-project",
      { prompt: promptData },
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // or sessionStorage
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const fetchProjects = async () => {
  try {
    const response = await axiosInstance.get("/projects/get-projects", {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // or sessionStorage
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching prompts:", error);
    throw error;
  }
};

export const fetchProjectById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/get-project/${id}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // or sessionStorage
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching prompt by ID:", error);
    throw error;
  }
};

export const deleteProject = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/delete-project/${id}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // or sessionStorage
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting prompt:", error);
    throw error;
  }
};
