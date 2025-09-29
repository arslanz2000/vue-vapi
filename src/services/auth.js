import api from "../api";

export async function register(name, email, password, password_confirmation) {
  const res = await api.post("/register", {
    name,
    email,
    password,
    password_confirmation,
  });
  localStorage.setItem("token", res.data.token);
  return res.data.user;
}

export async function login(email, password) {
  const res = await api.post("/login", { email, password });
  localStorage.setItem("token", res.data.token);
  return res.data.user;
}

export async function logout() {
  await api.post("/logout");
  localStorage.removeItem("token");
}
