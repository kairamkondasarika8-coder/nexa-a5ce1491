import { useState } from "react";
import { Copy, Download, FileText, Code, Lightbulb, X, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface OutputPanelProps {
  content: string;
  isVisible: boolean;
  onClose: () => void;
}

type TabId = "explanation" | "code" | "prompt" | "download";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "explanation", label: "Explanation", icon: Lightbulb },
  { id: "code", label: "Code", icon: Code },
  { id: "prompt", label: "Prompt", icon: FileText },
  { id: "download", label: "Download", icon: Download },
];

const OutputPanel = ({ content, isVisible, onClose }: OutputPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("explanation");
  const [copied, setCopied] = useState(false);

  if (!isVisible || !content) return null;

  const extractCode = (text: string): string => {
    const codeBlocks = text.match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      return codeBlocks.map((b) => b.replace(/```\w*\n?/g, "").replace(/```$/g, "")).join("\n\n");
    }
    return "No code blocks detected in the response.";
  };

  const generatePrompt = (text: string): string => {
    const firstLine = text.split("\n").find((l) => l.trim().length > 10) || text.slice(0, 200);
    return `Based on the following context, continue or expand:\n\n"${firstLine.trim()}"`;
  };

  const handleCopy = () => {
    const textMap: Record<TabId, string> = {
      explanation: content,
      code: extractCode(content),
      prompt: generatePrompt(content),
      download: content,
    };
    navigator.clipboard.writeText(textMap[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "txt" | "md" | "html") => {
    const types: Record<string, string> = {
      txt: "text/plain",
      md: "text/markdown",
      html: "text/html",
    };
    const data = format === "html"
      ? `<html><body><pre>${content}</pre></body></html>`
      : content;
    const blob = new Blob([data], { type: types[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexa-output.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full flex flex-col glass-strong rounded-2xl overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="font-display font-bold text-sm gradient-text">Output</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-3 pt-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                active
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {activeTab === "explanation" && (
          <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground/90">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
        {activeTab === "code" && (
          <pre className="text-xs bg-secondary/30 p-4 rounded-xl border border-border/30 overflow-x-auto whitespace-pre-wrap text-foreground/80 font-mono">
            {extractCode(content)}
          </pre>
        )}
        {activeTab === "prompt" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Generated prompt from the response:</p>
            <div className="bg-secondary/30 p-4 rounded-xl border border-border/30 text-sm text-foreground/80">
              {generatePrompt(content)}
            </div>
          </div>
        )}
        {activeTab === "download" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4">Export this output in your preferred format:</p>
            {(["txt", "md", "html"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleDownload(fmt)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass hover:glass-strong transition-all group"
              >
                <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Download as .{fmt}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {fmt === "txt" ? "Plain text" : fmt === "md" ? "Markdown" : "HTML document"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
