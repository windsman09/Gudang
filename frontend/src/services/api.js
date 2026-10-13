import axios from "axios";

const api = axios.create({
  baseURL: `http://${window.location.hostname}:8000`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const login = async (username, password) => {
  const formData = new URLSearchParams();

  formData.append("username", username);
  formData.append("password", password);

  const response = await api.post("/auth/token", formData, {
    headers:{
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export default api;
