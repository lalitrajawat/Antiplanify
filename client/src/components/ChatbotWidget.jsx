import { useState } from "react";
import "./ChatbotWidget.css";
import { useAuth } from "../hooks/useAuth";

export default function ChatbotWidget({ projectContext }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: "bot", text: `Hey ${user?.name || ''}, I'm Planify Assistant 👋 How can I help with your projects today?` },
    ]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || isSending) return;

        const userMsg = { from: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsSending(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}` // Ensure token is sent
                },
                body: JSON.stringify({ 
                    message: userMsg.text,
                    projectContext: projectContext // 👈 Pass context here
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Backend error:", res.status, text);
                throw new Error("Response not OK");
            }

            const data = await res.json();

            const botMsg = {
                from: "bot",
                text: data.reply || "I'm having trouble thinking right now. Please try again!",
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            console.error("Fetch error:", err);
            setMessages((prev) => [
                ...prev,
                { from: "bot", text: "Something went wrong 😭" },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <span>Planify Assistant 🤖</span>
                        <button onClick={() => setIsOpen(false)}>✖</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`msg ${m.from === "user" ? "user" : "bot"}`}
                            >
                                {m.text}
                            </div>
                        ))}
                    </div>

                    <div className="chatbot-input">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Ask me anything about Planify..."
                        />
                        <button onClick={sendMessage} disabled={isSending}>
                            {isSending ? "..." : "Send"}
                        </button>
                    </div>
                </div>
            )}

            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
                💬
            </button>
        </div>
    );
}
