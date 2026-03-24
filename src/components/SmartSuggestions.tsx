import { Sparkles } from "lucide-react";

interface SmartSuggestionsProps {
  lastMessage: string;
  onSuggestion: (text: string) => void;
}

const detectSuggestions = (text: string): { label: string; prompt: string }[] => {
  const lower = text.toLowerCase();
  const suggestions: { label: string; prompt: string }[] = [];

  if (/error|exception|traceback|failed|bug|crash/i.test(lower)) {
    suggestions.push({ label: "🔧 Fix this error", prompt: "Please fix the error mentioned above and explain the solution." });
  }
  if (/```|function|const |let |var |class |import |def |return/i.test(lower)) {
    suggestions.push({ label: "💻 Improve this code", prompt: "Please improve and optimize the code above." });
    suggestions.push({ label: "📝 Explain this code", prompt: "Please explain the code above step by step." });
  }
  if (/design|ui|layout|component|page|screen/i.test(lower)) {
    suggestions.push({ label: "🎨 Generate UI code", prompt: "Generate modern React/Tailwind UI code for the design described above." });
  }
  if (/note|summary|point|key|main/i.test(lower)) {
    suggestions.push({ label: "📋 Convert to PPT", prompt: "Convert the above notes into a structured presentation format." });
  }
  if (/idea|brainstorm|suggest|creative/i.test(lower)) {
    suggestions.push({ label: "🧠 Expand ideas", prompt: "Expand on these ideas with more detail and actionable steps." });
  }

  if (suggestions.length === 0) {
    suggestions.push(
      { label: "📄 Summarize", prompt: "Summarize the above response into key points." },
      { label: "🔄 Elaborate", prompt: "Please elaborate further on the above response." },
    );
  }

  return suggestions.slice(0, 3);
};

const SmartSuggestions = ({ lastMessage, onSuggestion }: SmartSuggestionsProps) => {
  if (!lastMessage) return null;

  const suggestions = detectSuggestions(lastMessage);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
      {suggestions.map((s) => (
        <button
          key={s.label}
          onClick={() => onSuggestion(s.prompt)}
          className="px-3 py-1.5 rounded-lg glass text-[11px] text-foreground hover:glass-strong transition-all border border-transparent hover:border-primary/20"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

export default SmartSuggestions;
