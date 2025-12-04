import axios from "axios";

export async function translateText(text: string, target: "kn" | "ml") {
  const res = await axios.post(
    "/translate",
    { text, target },
    { withCredentials: true },
  );
  return res.data.translated;
}
