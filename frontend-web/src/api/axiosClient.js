import axios from "axios";

const axiosClient = axios.create({
  baseURL: (localStorage.getItem("backendUrl") || "http://127.0.0.1:5000") + "/api",
  
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, 
});

// Các phần interceptors giữ nguyên...
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;