import axios from "axios";

const API = axios.create({
  baseURL: "https://stock-maintanance.onrender.com/api",
});

// 🔥 PRODUCTS
export const productsApi = {
  getAll: () => API.get("/products"),
};

// 🔥 PURCHASES
export const purchasesApi = {
  getAll: () => API.get("/purchase"),
};

// 🔥 SALES
export const salesApi = {
  getAll: () => API.get("/sales"),
};

// 🔥 INVENTORY (used for dashboard summary)
export const dashboardApi = {
  getSummary: () => API.get("/inventory"),
};
/* =========================
   AUTH API
========================= */

export const authApi = {
  login: (data) => API.post("/auth/login", data),
  resetPin: (data) => API.post("/auth/reset-pin", data),
};


export default API;