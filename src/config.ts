// After deploying the backend on Render, paste its URL here (no trailing slash).
const PROD_API = 'https://scs-backend-di2f.onrender.com'
export const API_URL = import.meta.env.DEV ? 'http://localhost:5000' : PROD_API
