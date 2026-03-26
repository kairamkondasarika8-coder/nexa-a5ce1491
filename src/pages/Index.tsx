import { useState, useRef, useEffect, useCallback } from "react";
import { Brain, PanelLeft, Sparkles, User, Settings, LogOut, PanelRightOpen, PanelRightClose } from "lucide-react";
import ChatSidebar, { type ChatSession } from "@/components/ChatSidebar";
import ChatMessage, { type Message, type Attachment } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import SettingsPanel from "@/components/SettingsPanel";
import MessageActions from "@/components/MessageActions";
import PPTMaker from "@/components/PPTMaker";
import DocumentationGenerator from "@/components/DocumentationGenerator";
import OutputPanel from "@/components/OutputPanel";
import SmartToolsBar from "@/components/SmartToolsBar";
import SmartSuggestions from "@/components/SmartSuggestions";
import AuthPage from "@/pages/AuthPage";
import { streamChat } from "@/lib/streamChat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const createId = () => Math.random().toString(36).slice(2, 10);

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: "default", title: "New Chat", createdAt: new Date() },
  ]);
  const [activeSessionId, setActiveSessionId] = useState("default");
  const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pptMakerOpen, setPptMakerOpen] = useState(false);
  const [docGenOpen, setDocGenOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [userName, setUserName] = useState<string | undefined>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = messagesBySession[activeSessionId] || [];
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(scrollToBottom, [messages, isTyping, scrollToBottom]);

  // Auto-open output panel when assistant responds
  useEffect(() => {
    if (lastAssistantMsg && messages.length > 0) {
      setOutputOpen(true);
    }
  }, [lastAssistantMsg?.id]);

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserName(undefined);
    setIsLoggedIn(false);
  };

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
          mode: "general",
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
    [activeSessionId, messagesBySession]
  );

  const handleNewChat = () => {
    const id = createId();
    setSessions((prev) => [{ id, title: "New Chat", createdAt: new Date() }, ...prev]);
    setActiveSessionId(id);
    setOutputOpen(false);
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

  const handleToolAction = (prompt: string) => {
    setPendingPrompt(prompt);
  };

  const handleSuggestion = (prompt: string) => {
    handleSend(prompt, []);
  };

  if (!isLoggedIn) {
    return <AuthPage onLogin={handleLogin} />;
  }

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
        onLoginOpen={() => {}}
        userName={userName}
      />

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <PPTMaker isOpen={pptMakerOpen} onClose={() => setPptMakerOpen(false)} />

      {/* Main content area */}
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
                <p className="text-[10px] text-muted-foreground/70">Smart AI Assistant • All Tools Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle output panel */}
            <button
              onClick={() => setOutputOpen(!outputOpen)}
              className="p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors hidden md:flex"
              title={outputOpen ? "Close output panel" : "Open output panel"}
            >
              {outputOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>

            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:glass-strong transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center glow">
                    <span className="text-primary-foreground text-xs font-bold">
                      {userName?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground hidden sm:inline">{userName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass-strong border-border/50">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="gap-2 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Smart Tools Bar */}
        <div className="px-4 md:px-6 py-2 border-b border-border/30">
          <SmartToolsBar onToolAction={handleToolAction} onOpenPPTMaker={() => setPptMakerOpen(true)} />
        </div>

        {/* Workspace: Chat + Output */}
        <div className="flex-1 flex min-h-0">
          {/* Chat Panel */}
          <div className={`flex flex-col min-w-0 ${outputOpen ? "flex-1 md:w-1/2" : "flex-1"}`}>
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
                    <h2 className="font-display font-bold text-3xl gradient-text mb-2">Hello, {userName}! ✨</h2>
                    <p className="text-sm text-muted-foreground/80 max-w-md">
                      I'm Nexa — your smart AI assistant. All tools are active. Just type, paste, or upload anything!
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 justify-center max-w-lg">
                    {[
                      "💬 Talk to me like a human",
                      "📄 Summarize a PDF",
                      "💻 Debug my code",
                      "🧠 Brainstorm ideas",
                      "🎨 Generate UI code",
                      "🔧 Fix an error",
                    ].map((q) => (
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

              {/* Smart Suggestions */}
              {!isTyping && lastAssistantMsg && (
                <div className="ml-11">
                  <SmartSuggestions
                    lastMessage={lastAssistantMsg.content}
                    onSuggestion={handleSuggestion}
                  />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 md:px-6 pb-4 pt-2 shrink-0">
              <ChatInput
                onSend={handleSend}
                disabled={isTyping}
                onOpenPPTMaker={() => setPptMakerOpen(true)}
                pendingPrompt={pendingPrompt}
                onPendingPromptUsed={() => setPendingPrompt("")}
              />
              <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
                Nexa AI © 2026 • All tools auto-active
              </p>
            </div>
          </div>

          {/* Output Panel */}
          {outputOpen && lastAssistantMsg && (
            <div className="hidden md:flex w-[400px] lg:w-[480px] border-l border-border/30 p-3 shrink-0">
              <OutputPanel
                content={lastAssistantMsg.content}
                isVisible={outputOpen}
                onClose={() => setOutputOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
