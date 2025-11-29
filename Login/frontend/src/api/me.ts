import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export async function getCurrentUser() {
  const res = await axios.get("/api/auth/me", { withCredentials: true });
  return res.data;
}
