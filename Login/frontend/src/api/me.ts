import axios from "axios";

axios.defaults.withCredentials = true;

export async function getCurrentUser() {
  const res = await axios.get("/auth/me", {
    withCredentials: true,
  });
  return res.data;
}
