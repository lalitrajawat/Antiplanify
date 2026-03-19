import { useState, useRef, useEffect } from "react";
import "./ChatbotWidget.css";
import { useAuth } from "../hooks/useAuth";
import api from '../utils/api';
import { Send, X, MessageCircle, Bot, User, Loader2 } from 'lucide-react';

export default function ChatbotWidget({ projectContext }) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: "bot", text: `Hey ${user?.name || ''}, I'm Planify Assistant 👋 How can I help with your projects today?` },
    ]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isSending]);

    const sendMessage = async () => {
        if (!input.trim() || isSending) return;

        const userMsg = { from: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsSending(true);

        try {
            const { data } = await api.post("/chat", { 
                message: userMsg.text,
                projectContext: projectContext 
            });

            const botMsg = {
                from: "bot",
                text: data.reply || "I'm having trouble thinking right now. Please try again!",
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            console.error("Chat error:", err);
            setMessages((prev) => [
                ...prev,
                { from: "bot", text: "Something went wrong. My neural circuits are a bit fuzzy 😭" },
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
        <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="header-info">
                            <div className="bot-avatar">
                                <Bot size={20} />
                            </div>
                            <div className="bot-status">
                                <h3>Planify AI</h3>
                                <span className="status-indicator">Online</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`msg-wrapper ${m.from === "user" ? "user-wrapper" : "bot-wrapper"}`}
                            >
                                <div className="msg-avatar">
                                    {m.from === "user" ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`msg-bubble ${m.from === "user" ? "user-bubble" : "bot-bubble"}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isSending && (
                            <div className="msg-wrapper bot-wrapper">
                                <div className="msg-avatar">
                                    <Bot size={14} />
                                </div>
                                <div className="msg-bubble bot-bubble typing">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Type a message..."
                            rows="1"
                        />
                        <button 
                            className={`send-btn ${input.trim() ? 'active' : ''}`} 
                            onClick={sendMessage} 
                            disabled={!input.trim() || isSending}
                        >
                            {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            )}

            <button className={`chatbot-toggle ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
}
