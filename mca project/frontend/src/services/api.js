import axios from "axios";

const API_BASE_URL = "/api";


// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    // Only redirect to login on 401 for protected routes, NOT for the login request itself
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// Restaurant APIs
export const restaurantAPI = {
  register: (data) => api.post("/donations/restaurant", data),
  get: () => api.get("/donations/restaurant"),
  update: (data) => api.put("/donations/restaurant", data),
};

// Donation APIs
export const donationAPI = {
  create: (data) => api.post("/donations", data),
  getAll: () => api.get("/donations"),
  getMyDonations: () => api.get("/donations/my-donations"),
  getRequests: () => api.get("/donations/requests"), // Get requests for donor's donations
  update: (id, data) => api.put(`/donations/${id}`, data),
  delete: (id) => api.delete(`/donations/${id}`),
};

// Request APIs
export const requestAPI = {
  create: (data) => api.post("/requests", data),
  getMyRequests: () => api.get("/requests/my-requests"),
  updateStatus: (id, status) => api.put(`/requests/${id}/status`, { status }),
};

// Admin APIs
export const adminAPI = {
  // User management
  getUsers: () => api.get("/admin/users"),
  approveUser: (id) => api.put(`/admin/users/${id}/approve`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Restaurant management
  getRestaurants: () => api.get("/admin/restaurants"),
  updateRestaurant: (id, data) => api.put(`/admin/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/admin/restaurants/${id}`),
  getRestaurantStats: (id) => api.get(`/admin/restaurants/${id}/stats`),

  // Statistics
  getStats: () => api.get("/admin/stats"),
};

// Upload API
export const uploadAPI = {
  uploadImage: (formData) =>
    api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default api;
