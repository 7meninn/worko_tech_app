import axios from "axios";

// Access the variable from .env
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- AUTH FUNCTIONS ---

export const login = async (email, password, role) => {
  try {
    const endpoint = role === "expert" ? "/expert-auth/login" : "/user/login";
    const response = await api.post(endpoint, { email, password });
    return { ...response.data, role };
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const register = async (formData, role) => {
  try {
    const endpoint = role === "expert" ? "/expert-auth/register" : "/user/register";
    const response = await api.post(endpoint, formData);
    return { ...response.data, role };
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

// --- GOOGLE FUNCTIONS (UPDATED) ---

// Updated to accept both arguments
export const googleInit = async (idToken, profileData) => {
  try {
    // Send both. One might be null, that's fine.
    const response = await api.post("/user/google-init", { idToken, profileData });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const googleComplete = async (googleData, phoneNumber) => {
  try {
    const response = await api.post("/user/google-complete", { googleData, phoneNumber });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network Error");
  }
};

export const logoutUser = async () => {
  try {
    await api.post("/user/logout");
  } catch (error) {
    console.error("Logout error", error);
  }
};

// --- DATA FETCHING ---

export const getWalletDetails = async () => {
  const response = await api.get("/wallet");
  return response.data;
};

export const getWalletHistory = async () => {
  const response = await api.get("/wallet/history");
  return response.data.data;
};

export const getExpertJobs = async (expertId) => {
  const response = await api.get(`/booking?expertId=${expertId}`);
  return response.data;
};

export const requestWithdrawal = async (amount, upiId) => {
  const response = await api.post("/wallet/withdraw", { amount, upiId });
  return response.data;
};

export const acceptJob = async (jobId) => {
  const response = await api.put(`/booking/${jobId}/accept`);
  return response.data;
};

export const getAllExperts = async () => {
  const response = await api.get("/expert");
  return response.data.data;
};

export default api;