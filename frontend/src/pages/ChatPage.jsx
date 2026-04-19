// src/pages/ChatPage.jsx
import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: user
        ? `Hi ${user.name.split(" ")[0]} 👋\nI can help you with your BookBank account, borrowed books, and recommendations.`
        : "Hi 👋 I’m the BookBank Assistant.\nYou can ask about how this portal works, registration, borrowing rules, and general BookBank doubts."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // mark chat as seen (for sidebar badge)
  useEffect(() => {
    localStorage.setItem("chatSeen", "1");
  }, []);

  // auto-scroll to bottom whenever messages or loading changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const endpoint = user ? "/chatbot/message" : "/chatbot/public";
      const { data } = await api.post(endpoint, { message: trimmed });
      const reply = data.reply || "I'm not sure about that.";
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "❌ I had trouble reaching the assistant. Please try again."
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
    <section className="mt-4 flex flex-col items-center">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold text-slate-50">
          BookBank Assistant
        </h2>
        <p className="text-sm text-slate-400">
          Ask doubts about the portal, borrowing rules, book status and
          recommendations.
        </p>
        {!user && (
          <p className="mt-1 text-[11px] text-slate-400">
            You’re chatting as a guest.{" "}
            <span className="text-cyan-600 font-medium">
              Login for personalized answers based on your account.
            </span>
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-slate-800 shadow-xl border border-slate-700 w-full max-w-3xl flex h-[26rem] flex-col">
        {/* messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs bg-slate-900/40 rounded-t-2xl">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${
                m.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 shadow-sm ${
                  m.from === "user"
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-800 text-slate-50 border border-slate-700"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start text-[11px] text-slate-400">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-3 py-1 shadow-sm border border-slate-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div className="border-t border-slate-700 bg-slate-800 p-3 rounded-b-2xl">
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
              className="flex-1 resize-none rounded-xl border border-slate-600 bg-slate-900/50 px-3 py-2 text-xs text-slate-50 outline-none focus:border-cyan-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatPage;
