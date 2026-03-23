import { GraduationCap, Code, Brain, Briefcase, MessageCircle } from "lucide-react";

export type AIMode = "general" | "study" | "coding" | "brainstorm" | "professional";

interface ModeSelectorProps {
  mode: AIMode;
  onChange: (mode: AIMode) => void;
}

const modes: { id: AIMode; label: string; icon: React.ElementType; color: string; emoji: string }[] = [
  { id: "general", label: "General", icon: MessageCircle, color: "text-foreground", emoji: "💬" },
  { id: "study", label: "Study", icon: GraduationCap, color: "text-mode-study", emoji: "🎓" },
  { id: "coding", label: "Code", icon: Code, color: "text-mode-coding", emoji: "💻" },
  { id: "brainstorm", label: "Brainstorm", icon: Brain, color: "text-mode-brainstorm", emoji: "🧠" },
  { id: "professional", label: "Pro", icon: Briefcase, color: "text-mode-professional", emoji: "📊" },
];

const ModeSelector = ({ mode, onChange }: ModeSelectorProps) => {
  return (
    <div className="flex gap-1 p-1 rounded-xl glass">
      {modes.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              active
                ? "bg-gradient-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <span className="text-sm">{m.emoji}</span>
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
