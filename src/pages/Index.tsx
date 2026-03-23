import { useState, useRef, useEffect, useCallback } from "react";
import { Brain, PanelLeft, Sparkles } from "lucide-react";
import ChatSidebar, { type ChatSession } from "@/components/ChatSidebar";
import ChatMessage, { type Message, type Attachment } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import ModeSelector, { type AIMode } from "@/components/ModeSelector";
import SettingsPanel from "@/components/SettingsPanel";
import LoginDialog from "@/components/LoginDialog";
import MessageActions from "@/components/MessageActions";
import PPTMaker from "@/components/PPTMaker";
import { streamChat } from "@/lib/streamChat";


const createId = () => Math.random().toString(36).slice(2, 10);

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: "default", title: "New Chat", createdAt: new Date() },
  ]);
  const [activeSessionId, setActiveSessionId] = useState("default");
  const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<AIMode>("general");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pptMakerOpen, setPptMakerOpen] = useState(false);
  const [userName, setUserName] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = messagesBySession[activeSessionId] || [];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(scrollToBottom, [messages, isTyping, scrollToBottom]);

  const handleSend = useCallback(
    async (text: string, attachments: Attachment[]) => {
      const userMsg: Message = {
        id: createId(),
        role: "user",
        content: text,
        attachments: attachments.length > 0 ? attachments : undefined,
        timestamp: new Date(),
      };

      setMessagesBySession((prev) => ({
        ...prev,
        [activeSessionId]: [...(prev[activeSessionId] || []), userMsg],
      }));

      if (!messagesBySession[activeSessionId]?.length && text) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId ? { ...s, title: text.slice(0, 40) || "File upload" } : s
          )
        );
      }

      setIsTyping(true);

      const aiMsgId = createId();
      let assistantSoFar = "";

      const allMessages = [...(messagesBySession[activeSessionId] || []), userMsg];
      const chatHistory = allMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      try {
        await streamChat({
          messages: chatHistory,
          mode,
          onDelta: (chunk) => {
            assistantSoFar += chunk;
            setMessagesBySession((prev) => {
              const current = prev[activeSessionId] || [];
              const existing = current.find((m) => m.id === aiMsgId);
              if (existing) {
                return {
                  ...prev,
                  [activeSessionId]: current.map((m) =>
                    m.id === aiMsgId ? { ...m, content: assistantSoFar } : m
                  ),
                };
              }
              return {
                ...prev,
                [activeSessionId]: [
                  ...current,
                  { id: aiMsgId, role: "assistant" as const, content: assistantSoFar, timestamp: new Date() },
                ],
              };
            });
          },
          onDone: () => setIsTyping(false),
        });
      } catch {
        setIsTyping(false);
      }
    },
    [activeSessionId, messagesBySession, mode]
  );

  const handleNewChat = () => {
    const id = createId();
    setSessions((prev) => [{ id, title: "New Chat", createdAt: new Date() }, ...prev]);
    setActiveSessionId(id);
  };

  const handlePin = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  const handleDelete = (id: string) => {
    if (sessions.length <= 1) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining[0]?.id || "default");
    }
  };

  const handleDownload = (id: string) => {
    const msgs = messagesBySession[id] || [];
    const text = msgs.map((m) => `[${m.role.toUpperCase()}] ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexa-chat-${id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (id: string) => {
    const msgs = messagesBySession[id] || [];
    const text = msgs.map((m) => `[${m.role.toUpperCase()}] ${m.content}`).join("\n\n");
    if (navigator.share) {
      navigator.share({ title: "Nexa Chat", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const speakText = (text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    synth.speak(utter);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onNew={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onPin={handlePin}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onShare={handleShare}
        onSettingsOpen={() => setSettingsOpen(true)}
        onLoginOpen={() => setLoginOpen(true)}
        userName={userName}
      />

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <LoginDialog isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLogin={setUserName} />
      <PPTMaker isOpen={pptMakerOpen} onClose={() => setPptMakerOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 border-b border-border/50 shrink-0 glass">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-strong animate-pulse-glow">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg gradient-text leading-tight flex items-center gap-1">
                  Nexa AI <Sparkles className="w-4 h-4 text-accent-foreground inline" />
                </h1>
                <p className="text-[10px] text-muted-foreground/70">AI Assistant • Free to use</p>
              </div>
            </div>
          </div>

          <ModeSelector mode={mode} onChange={setMode} />
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 animate-fade-up">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center glow-strong animate-float">
                  <Brain className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl -z-10 animate-pulse-glow" />
              </div>
              <div>
                <h2 className="font-display font-bold text-3xl gradient-text mb-2">Hello! I'm Nexa ✨</h2>
                <p className="text-sm text-muted-foreground/80 max-w-md">
                  Your free AI assistant. Send messages, upload files & images, use voice, or try the AI tools below!
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 justify-center max-w-lg">
                {["💬 Talk to me like a human", "📄 Summarize a PDF", "💻 Debug my code", "🧠 Brainstorm ideas", "🌐 Translate to Telugu"].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q, [])}
                    className="px-4 py-2.5 rounded-xl glass text-xs text-foreground hover:glass-strong transition-all border border-transparent hover:border-primary/20 hover:glow hover-scale"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}>
              <ChatMessage message={msg} />
              {msg.role === "assistant" && (
                <div className="ml-11">
                  <MessageActions
                    content={msg.content}
                    messageId={msg.id}
                    onSpeak={speakText}
                  />
                </div>
              )}
            </div>
          ))}

          {isTyping && <TypingIndicator />}
        </div>

        {/* Input */}
        <div className="px-4 md:px-6 pb-4 pt-2 shrink-0">
          <ChatInput onSend={handleSend} disabled={isTyping} onOpenPPTMaker={() => setPptMakerOpen(true)} />
          <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
            Nexa AI © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
