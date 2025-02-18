import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Attach token to each request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  console.log("Sending Token:", token); 
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth APIs
export const signup = (userData) => API.post("/auth/register", userData);
export const login = (userData) => API.post("/auth/login", userData);

// Folder APIs
export const createFolder = (folderData) => API.post("/folders/create-folder", folderData);
export const getFolders = () => API.get("/folders");

// File Upload APIs
export const uploadFile = (formData) => API.post("/files/upload", formData);

export default API;
