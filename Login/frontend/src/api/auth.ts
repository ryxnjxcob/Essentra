import axios from "axios";

const API = axios.create({
  baseURL: "/api", // let proxy handle it
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
