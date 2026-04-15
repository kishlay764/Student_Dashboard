const envUrl = process.env.REACT_APP_API_URL;
const API_BASE_URL = envUrl && envUrl !== "https://your-backend-name.onrender.com"
    ? envUrl
    : "http://localhost:5000";

export default API_BASE_URL;
