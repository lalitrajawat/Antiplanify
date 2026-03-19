const Groq = require("groq-sdk");

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const handleChat = async(req, res) => {
        try {
            const { message, projectContext } = req.body;

            if (!message) {
                return res.status(400).json({ error: "Message is required" });
            }

            // Create a system prompt that includes project context
            const systemPrompt = `You are Planify Assistant, an AI helper for a project management app called Planify.
You help users with project management tasks, planning, task organization, and productivity.

${projectContext ? `Current project context: ${JSON.stringify(projectContext)}` : ''}

Be helpful, friendly, and focused on project management. Keep responses concise but informative.`;

        const chatCompletion = await client.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1024,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response right now.";

        res.json({ reply });
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { handleChat };