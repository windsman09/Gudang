import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export async function login(username, password) {
  const formData = new URLSearchParams();

  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await axios.post(
      `${API_URL}/auth/token`,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Login error:", error);

    throw new Error(
      error.response?.data?.detail ||
        error.message ||
        "Gagal menghubungi server"
    );
  }
}
