import axios from "axios"

const api = axios.create({
    baseURL: "/backend/api",
    withCredentials: true,
});

export default api;