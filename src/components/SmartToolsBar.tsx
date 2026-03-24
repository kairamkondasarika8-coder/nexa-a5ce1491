import {
  Presentation,
  Code,
  Layout,
  FileText,
  Bug,
  Lightbulb,
  Image,
  Sparkles,
} from "lucide-react";

interface SmartToolsBarProps {
  onToolAction: (prompt: string) => void;
  onOpenPPTMaker: () => void;
}

const tools = [
  { label: "PPT Maker", icon: Presentation, prompt: "__PPT_MAKER__", color: "text-blue-400" },
  { label: "Code Gen", icon: Code, prompt: "Generate clean, production-ready code for: ", color: "text-green-400" },
  { label: "UI Builder", icon: Layout, prompt: "Generate a modern responsive UI component for: ", color: "text-purple-400" },
  { label: "Summarizer", icon: FileText, prompt: "Summarize the following into clean bullet points: ", color: "text-amber-400" },
  { label: "Error Solver", icon: Bug, prompt: "Debug and fix this error: ", color: "text-red-400" },
  { label: "Brainstorm", icon: Lightbulb, prompt: "Give me 10 creative ideas for: ", color: "text-yellow-400" },
  { label: "Image Prompt", icon: Image, prompt: "Generate a detailed image prompt for: ", color: "text-pink-400" },
  { label: "Enhance", icon: Sparkles, prompt: "Improve and enhance the following: ", color: "text-cyan-400" },
];

const SmartToolsBar = ({ onToolAction, onOpenPPTMaker }: SmartToolsBarProps) => {
  const handleClick = (tool: (typeof tools)[0]) => {
    if (tool.prompt === "__PPT_MAKER__") {
      onOpenPPTMaker();
    } else {
      onToolAction(tool.prompt);
    }
  };

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.label}
            onClick={() => handleClick(tool)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass hover:glass-strong text-xs font-medium text-muted-foreground hover:text-foreground transition-all shrink-0 border border-transparent hover:border-primary/20 hover:glow group"
            title={tool.label}
          >
            <Icon className={`w-3.5 h-3.5 ${tool.color} group-hover:scale-110 transition-transform`} />
            <span className="hidden sm:inline">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SmartToolsBar;
