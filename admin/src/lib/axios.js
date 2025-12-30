import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // by adding this field browswer will send cookies to server automatically, on every single req
});

export default axiosInstance;