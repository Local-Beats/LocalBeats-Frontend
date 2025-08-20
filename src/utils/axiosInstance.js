import axios from "axios";

const isProd = process.env.NODE_ENV === "production";

// In dev, hit the backend directly
// In prod, use same-origin (rewrites handle it)
const baseURL =
    process.env.API_URL || (isProd ? "" : "http://127.0.0.1:8080");

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
});

export default axiosInstance;