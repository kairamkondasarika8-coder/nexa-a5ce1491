import { X } from "lucide-react";

interface AIToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (prompt: string) => void;
  onOpenPPTMaker?: () => void;
}

const tools = [
  { label: "PPT Maker", emoji: "📊", prompt: "__PPT_MAKER__", highlight: true },
  { label: "Resume Builder", emoji: "📝", prompt: "Help me create a professional resume. Ask me about my experience, skills, and education, then generate a well-formatted resume." },
  { label: "Notes Generator", emoji: "📚", prompt: "Generate detailed study notes for me. Ask me the topic and whether I need short notes, 5-mark answers, or 10-mark answers with proper headings." },
  { label: "Code Generator", emoji: "💻", prompt: "I need code for a project. Ask me what programming language (Python, Java, C, HTML, etc.) and what functionality I need, then generate clean code." },
  { label: "Assignment Writer", emoji: "📄", prompt: "Help me write a well-structured assignment answer. Ask me the question and mark allocation (2, 5, 10, or 15 marks) and generate an exam-ready answer." },
  { label: "Translator", emoji: "🌍", prompt: "I'll translate between languages for you. Type any text and tell me the source and target language (e.g., Telugu → English, English → Hindi)." },
  { label: "Image Generator", emoji: "🎨", prompt: "Describe the image you want to generate. I'll create a detailed AI image prompt and help you visualize it." },
  { label: "Website Idea Generator", emoji: "🌐", prompt: "Tell me your field or interest and I'll generate website project ideas with features, technologies, and implementation plan." },
  { label: "Study Planner", emoji: "📅", prompt: "Help me create a daily study plan. Tell me your subjects, available hours, and exam dates, and I'll create a structured schedule." },
  { label: "Project Idea Generator", emoji: "💡", prompt: "Tell me your field (AI, Web Development, ML, IoT, etc.) and I'll generate innovative project ideas with explanations and tech stacks." },
];

const AIToolsPanel = ({ isOpen, onClose, onSelectTool, onOpenPPTMaker }: AIToolsPanelProps) => {
  if (!isOpen) return null;

  const handleClick = (tool: typeof tools[0]) => {
    if (tool.prompt === "__PPT_MAKER__" && onOpenPPTMaker) {
      onOpenPPTMaker();
      onClose();
    } else {
      onSelectTool(tool.prompt);
      onClose();
    }
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 glass rounded-2xl p-4 animate-fade-up z-20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-sm gradient-text">⚡ AI Tools</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary/80 text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.label}
            onClick={() => handleClick(tool)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center group border ${
              tool.highlight
                ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 glow"
                : "border-transparent hover:bg-secondary/60 hover:border-primary/20"
            }`}
          >
            <span className="text-2xl">{tool.emoji}</span>
            <span className="text-[10px] font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
              {tool.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIToolsPanel;
