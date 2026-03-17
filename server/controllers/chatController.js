const Groq = require("groq-sdk");

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const handleChat = async (req, res) => {
    try {
        const { message, projectContext } = req.body;

        if (!message || !message.trim()) {
            return res.json({ reply: "Bol na kuch 😄" });
        }

        let systemPrompt = "You are Planify AI assistant. Friendly, fun and helpful. Reply in short, casual Hinglish with emojis, and help with productivity, tasks, and projects.";
        
        if (projectContext) {
            systemPrompt += `\n\nCurrent Project Context:
            Title: ${projectContext.title}
            Description: ${projectContext.description}
            Tasks: ${JSON.stringify(projectContext.tasks)}`;
        }

        const response = await client.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                { role: "user", content: message },
            ],
        });

        const aiReply = response.choices?.[0]?.message?.content || "Kuch samajh nahi aaya 😅";

        return res.json({ reply: aiReply });
    } catch (error) {
        console.error("Chat error:", error);
        return res.json({ reply: "Error aa gaya 😭 Chat bot thoda sad ho gaya." });
    }
};

module.exports = { handleChat };
