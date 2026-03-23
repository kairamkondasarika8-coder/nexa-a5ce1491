import { useState, useEffect } from "react";

const allSuggestions = [
  "Explain NLP preprocessing steps",
  "Explain machine learning algorithms",
  "Explain software development life cycle",
  "Explain data mining techniques",
  "What is deep learning?",
  "Explain the OSI model",
  "What is tokenization in NLP?",
  "Explain supervised vs unsupervised learning",
  "What is cloud computing?",
  "Explain database normalization",
  "What is artificial intelligence?",
  "Explain object oriented programming",
  "What is web scraping?",
  "Explain the waterfall model",
  "What are design patterns?",
  "Explain REST API",
  "What is blockchain?",
  "Explain compiler design phases",
  "What is cybersecurity?",
  "Explain agile methodology",
];

interface ChatSuggestionsProps {
  query: string;
  onSelect: (text: string) => void;
  visible: boolean;
}

const ChatSuggestions = ({ query, onSelect, visible }: ChatSuggestionsProps) => {
  const [filtered, setFiltered] = useState<string[]>([]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setFiltered([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = allSuggestions
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 5);
    setFiltered(matches);
  }, [query]);

  if (!visible || filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 glass rounded-xl overflow-hidden z-30 animate-fade-up">
      {filtered.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors border-b border-border last:border-0"
        >
          💡 {s}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestions;
