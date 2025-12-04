import axios from "axios";

axios.defaults.withCredentials = true;

const API = axios.create({
  baseURL: "/", // 🔥 backend routes start at /auth, /boards, /notes etc.
  withCredentials: true,
});

export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.append("email", email);
  body.append("password", password);

  const res = await API.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return res.data;
}
