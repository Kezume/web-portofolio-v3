import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "Hi! I'm Jarvis, Roihan's personal AI agent. Ask me anything about his backend expertise, projects, tech stack, or professional availability!"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to reach AI server.");
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "model" as const, content: data.reply }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        { 
          role: "model" as const, 
          content: `⚠️ ${err.message || "I'm having trouble connecting right now. Please ensure the GEMINI_API_KEY is configured in Settings > Secrets."}` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-assistant-root" className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="ai-trigger-btn"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/30 transition-all cursor-pointer relative group border border-blue-400/20"
          >
            <Bot className="h-6 w-6 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="w-80 sm:w-96 h-[500px] rounded-2xl glass shadow-2xl shadow-blue-500/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-sans font-medium text-sm text-zinc-100 flex items-center gap-1.5">
                    Jarvis (AI Agent)
                  </h3>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    Online & trained
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-800"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/10"
                        : "bg-zinc-900 text-zinc-300 rounded-bl-none border border-zinc-800"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.content.split("\n").map((line, lIdx) => (
                        <p key={lIdx} className={lIdx > 0 ? "mt-1.5 break-words" : "break-words"}>{line}</p>
                      ))
                    ) : (
                      <div className="space-y-2 break-words">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}: any) => <p className="leading-relaxed" {...props} />,
                            a: ({node, ...props}: any) => <a className="text-blue-400 hover:underline break-all" {...props} />,
                            ul: ({node, ...props}: any) => <ul className="list-disc pl-4 space-y-1" {...props} />,
                            ol: ({node, ...props}: any) => <ol className="list-decimal pl-4 space-y-1" {...props} />,
                            li: ({node, ...props}: any) => <li className="" {...props} />,
                            strong: ({node, ...props}: any) => <strong className="font-semibold text-white" {...props} />,
                            code: ({node, ...props}: any) => <code className="bg-zinc-800/60 px-1 py-0.5 rounded text-[10px] font-mono text-zinc-300" {...props} />
                          }}
                        >
                          {String(msg.content)}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    <span className="text-[11px] font-mono">Roihan is typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about backend experience, projects..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
