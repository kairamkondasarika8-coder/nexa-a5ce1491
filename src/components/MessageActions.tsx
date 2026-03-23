import { Copy, Download, ThumbsUp, ThumbsDown, Volume2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface MessageActionsProps {
  content: string;
  messageId: string;
  onSpeak: (text: string) => void;
}

const MessageActions = ({ content, messageId, onSpeak }: MessageActionsProps) => {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexa-answer-${messageId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type === feedback ? null : type);
    toast({
      title: type === "up" ? "👍 Thanks for your feedback!" : "👎 We'll try to improve!",
      description: type === "up" ? "Glad this was helpful." : "Your feedback helps Nexa get better.",
    });
  };

  return (
    <div className="flex items-center gap-1 mt-1.5">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
        title="Copy"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      <button
        onClick={handleDownloadTxt}
        className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
        title="Download as text"
      >
        <Download className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => onSpeak(content)}
        className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
        title="Listen"
      >
        <Volume2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-border mx-1" />

      <button
        onClick={() => handleFeedback("up")}
        className={`p-1.5 rounded-lg transition-colors ${
          feedback === "up"
            ? "bg-green-500/20 text-green-500"
            : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
        }`}
        title="Helpful"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => handleFeedback("down")}
        className={`p-1.5 rounded-lg transition-colors ${
          feedback === "down"
            ? "bg-destructive/20 text-destructive"
            : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
        }`}
        title="Not helpful"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default MessageActions;
