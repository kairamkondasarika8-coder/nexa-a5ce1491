import { Brain } from "lucide-react";

const TypingIndicator = () => (
  <div className="flex items-start gap-3 animate-fade-up">
    <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 glow animate-pulse-glow">
      <Brain className="w-4 h-4 text-primary-foreground" />
    </div>
    <div className="glass-strong rounded-2xl rounded-tl-md px-5 py-3.5 flex gap-2 items-center">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
      <span className="text-xs text-muted-foreground/70 ml-1">Nexa is typing...</span>
    </div>
  </div>
);

export default TypingIndicator;
