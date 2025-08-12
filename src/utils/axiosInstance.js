import axios from "axios";
//import { API_URL } from "../shared";

const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8080" || process.env.API_URL,
    withCredentials: true,
})

export default axiosInstance;