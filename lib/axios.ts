/**
 * Configured axios instance for API requests.
 * Enables cookie-based session management with the FastAPI backend.
 */
import axios from 'axios';
import { API_BASE_URL } from './config';

// Create axios instance with credentials enabled
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
