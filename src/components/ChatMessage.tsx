import { FileText, File, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface Attachment {
  type: "image" | "video" | "file";
  name: string;
  url: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  timestamp: Date;
}

const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""} ${
        isUser ? "animate-slide-in-right" : "animate-slide-in-left"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
          isUser
            ? "bg-primary/20 border border-primary/30"
            : "bg-gradient-primary glow animate-pulse-glow"
        }`}
      >
        {isUser ? (
          <span className="text-primary text-xs font-bold">U</span>
        ) : (
          <Brain className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] space-y-2`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-sm transition-all ${
            isUser
              ? "bg-user-bubble/80 rounded-tr-md border border-primary/10 text-foreground"
              : "glass-strong rounded-tl-md text-foreground"
          }`}
        >
          <div className="prose prose-sm prose-invert max-w-none [&_h1]:text-xl [&_h1]:font-display [&_h1]:font-extrabold [&_h1]:text-primary [&_h1]:drop-shadow-[0_0_8px_hsl(199_89%_60%/0.4)] [&_h2]:text-lg [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-primary/90 [&_h2]:drop-shadow-[0_0_6px_hsl(199_89%_60%/0.3)] [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-primary/80 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-primary/70 [&_h5]:text-sm [&_h5]:font-bold [&_h5]:text-primary/60 [&_h6]:text-xs [&_h6]:font-bold [&_h6]:text-primary/50 [&_strong]:text-foreground [&_strong]:font-bold [&_code]:bg-secondary/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-primary/80">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

        {/* Attachments */}
        {message.attachments?.map((att, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-border/50 glass">
            {att.type === "image" && (
              <img src={att.url} alt={att.name} className="max-w-full max-h-60 object-cover rounded-xl" />
            )}
            {att.type === "video" && (
              <video src={att.url} controls className="max-w-full max-h-60 rounded-xl" />
            )}
            {att.type === "file" && (
              <div className="flex items-center gap-3 p-3 glass">
                {att.name.endsWith(".pdf") ? (
                  <FileText className="w-5 h-5 text-primary" />
                ) : (
                  <File className="w-5 h-5 text-primary" />
                )}
                <span className="text-sm text-foreground truncate">{att.name}</span>
              </div>
            )}
          </div>
        ))}

        <span className="text-[10px] text-muted-foreground/70">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
