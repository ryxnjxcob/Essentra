import axios from "axios";

export async function summarizeText(text: string): Promise<string> {
  const res = await axios.post(
    "/summarize",
    { text },
    { withCredentials: true },
  );
  return res.data.summary;
}
