// frontend/src/components/ChatBot.jsx
import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const ChatBot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text:
        "Hi! I’m your BookBank assistant. You can ask me things like:\n" +
        "• How many books are borrowed?\n" +
        "• Recommend books for my course\n" +
        "• What new books were added recently?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Don't show chatbot if user not logged in
  if (!user) return null;

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = trimmed;
    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chatbot/message", { message: userMsg });
      const botReply = data.reply || "I couldn't answer that right now.";
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            "Sorry, something went wrong while contacting the assistant. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-2 flex items-center gap-2 rounded-full bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-primary-500/40 hover:bg-primary-400"
      >
        {open ? "Close chat" : "Chat with assistant"}
      </button>

      {open && (
        <div className="card-glass flex h-96 w-80 flex-col border border-primary-500/40">
          <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2 text-xs">
            <span className="font-semibold text-slate-50">
              📚 BookBank Assistant
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-green-700">
              Online
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-1 overflow-y-auto p-2 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`my-1 flex ${
                  m.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-2 py-1 ${
                    m.from === "user"
                      ? "bg-primary-500/80 text-white"
                      : "bg-slate-800 text-slate-50"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
            {loading && (
              <div className="mt-1 flex justify-start text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-2 py-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-primary-400" />
                  Thinking...
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-1 border-t border-slate-700 p-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="max-h-16 flex-1 resize-none rounded-lg bg-slate-800/60 px-2 py-1 text-xs text-slate-50 outline-none focus:border focus:border-primary-400"
              placeholder="Ask about books, borrowing, etc..."
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-primary-500 px-2 py-1 text-xs font-semibold text-white hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
