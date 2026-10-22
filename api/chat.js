
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "null");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Server configuration incomplete" });
  }

  try {
    const { message } = req.body || {};

    if (typeof message !== "string" || !message.trim() || message.length > 4000) {
      return res.status(400).json({ error: "Please send a valid message." });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: "You are FinPaw, a friendly and helpful AI assistant.",
        input: message.trim(),
        max_output_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: "The AI service request failed." });
    }

    return res.status(200).json({
      reply: data.output_text || "Sorry, I couldn't generate a reply."
    });
  } catch {
    return res.status(500).json({ error: "Something went wrong." });
  }
}
