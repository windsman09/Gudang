const API_URL = "http://127.0.0.1:8000";

export async function login(username, password) {
  const body = new URLSearchParams();

  body.append("username", username);
  body.append("password", password);

  const response = await fetch(
    `${API_URL}/auth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    throw new Error("Username atau password salah");
  }

  return response.json();
}


export async function getItems() {
  const token = localStorage.getItem(
    "access_token"
  );

  const response = await fetch(
    `${API_URL}/items`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Gagal mengambil data barang");
  }

  return response.json();
}
