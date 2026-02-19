import axios, { AxiosError } from "axios";
import { logger } from "./logger";


const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 500;

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3025}`)),
    timeout: 300000, // 5 minute timeout for LLM requests
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor with retry logic for network errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const config = error.config;

        // Handle Session Expiry
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem("token");
            if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }

        // Only retry on network errors (no response) or timeout
        if (!config || error.response || (config as any).__retryCount >= MAX_RETRIES) {
            return Promise.reject(error);
        }

        (config as any).__retryCount = ((config as any).__retryCount || 0) + 1;
        const retryCount = (config as any).__retryCount;

        logger.warn(`Retrying request (attempt ${retryCount}/${MAX_RETRIES})...`, { url: config.url });

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * retryCount));

        return api.request(config);
    }
);

export default api;
