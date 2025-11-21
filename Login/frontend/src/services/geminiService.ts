// We use standard fetch, so no need to import external SDKs
const API_KEY = process.env.ZHIPU_API_KEY || "";
const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

export const generateMermaidFromText = async (
  inputText: string,
): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "glm-4-flash", // Using the fast/cost-effective model
        messages: [
          {
            role: "system",
            content:
              "You are an expert at creating Mermaid.js flowcharts. Return ONLY the mermaid syntax code. Do not include markdown formatting (```mermaid), explanations, or extra text.",
          },
          {
            role: "user",
            content: `Convert this description into a flowchart: "${inputText}"`,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ZhipuAI Error:", errorData);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    let mermaidCode = data.choices?.[0]?.message?.content || "";

    // Cleanup formatting if the AI adds it
    mermaidCode = mermaidCode
      .replace(/```mermaid/g, "")
      .replace(/```/g, "")
      .trim();

    return mermaidCode;
  } catch (error) {
    console.error("Error generating flowchart:", error);
    throw new Error("Failed to generate flowchart from AI.");
  }
};
