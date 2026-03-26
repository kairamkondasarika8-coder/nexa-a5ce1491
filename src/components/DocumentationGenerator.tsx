import { useState, useRef } from "react";
import {
  FileText, Download, Copy, Check, RefreshCw, ChevronDown,
  ChevronUp, Loader2, X, Sparkles, Globe, ToggleLeft, ToggleRight,
  Image as ImageIcon, Edit3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface DocumentationGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROJECT_TYPES = ["Software", "Research", "Case Study", "Assignment"] as const;
const OUTPUT_FORMATS = ["PDF", "Word", "Text"] as const;
const LANGUAGES = ["English", "Hindi", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic"] as const;

const SECTIONS = [
  "Title Page",
  "Abstract / Introduction",
  "Problem Statement",
  "Objectives",
  "Methodology",
  "System Architecture / Design",
  "Implementation Details",
  "Advantages & Disadvantages",
  "Applications",
  "Future Scope",
  "Conclusion",
];

const SECTION_COLORS = [
  "from-blue-500/20 to-cyan-500/20",
  "from-purple-500/20 to-pink-500/20",
  "from-red-500/20 to-orange-500/20",
  "from-green-500/20 to-emerald-500/20",
  "from-yellow-500/20 to-amber-500/20",
  "from-indigo-500/20 to-violet-500/20",
  "from-teal-500/20 to-cyan-500/20",
  "from-pink-500/20 to-rose-500/20",
  "from-sky-500/20 to-blue-500/20",
  "from-lime-500/20 to-green-500/20",
  "from-fuchsia-500/20 to-purple-500/20",
];

const DocumentationGenerator = ({ isOpen, onClose }: DocumentationGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [projectType, setProjectType] = useState<typeof PROJECT_TYPES[number]>("Software");
  const [outputFormat, setOutputFormat] = useState<typeof OUTPUT_FORMATS[number]>("PDF");
  const [language, setLanguage] = useState<typeof LANGUAGES[number]>("English");
  const [detailedMode, setDetailedMode] = useState(true);
  const [autoDiagrams, setAutoDiagrams] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<Record<number, string>>({});
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const hasContent = Object.keys(generatedSections).length > 0;

  const buildPrompt = (sectionName: string, sectionOnly = false) => {
    const base = `You are a professional documentation writer. Write ${detailedMode ? "a detailed and comprehensive" : "a concise and clear"} section for a ${projectType} documentation about "${topic}" in ${language}.${autoDiagrams ? " Include ASCII diagram suggestions where applicable." : ""}`;
    if (sectionOnly) {
      return `${base}\n\nWrite ONLY the "${sectionName}" section. Use markdown formatting with headings, bullet points, and clear paragraphs.`;
    }
    return base;
  };

  const generateSection = async (idx: number): Promise<string> => {
    const sectionName = SECTIONS[idx];
    const prompt = buildPrompt(sectionName, true);

    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: `Write the "${sectionName}" section for: ${topic}` },
          ],
        }),
      }
    );

    if (!resp.ok || !resp.body) throw new Error(`Failed for ${sectionName}`);

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let ni: number;
      while ((ni = buf.indexOf("\n")) !== -1) {
        let line = buf.slice(0, ni);
        buf = buf.slice(ni + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") break;
        try {
          const p = JSON.parse(json);
          const c = p.choices?.[0]?.delta?.content;
          if (c) result += c;
        } catch { /* partial */ }
      }
    }

    return result;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Enter a topic", description: "Please provide a documentation topic.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGeneratedSections({});

    for (let i = 0; i < SECTIONS.length; i++) {
      try {
        const content = await generateSection(i);
        setGeneratedSections((prev) => ({ ...prev, [i]: content }));
      } catch (e) {
        setGeneratedSections((prev) => ({ ...prev, [i]: `*Error generating this section. Click "Regenerate" to retry.*` }));
      }
    }

    setIsGenerating(false);
    toast({ title: "Documentation generated!", description: `${SECTIONS.length} sections created.` });
  };

  const handleRegenerate = async (idx: number) => {
    setRegeneratingIdx(idx);
    try {
      const content = await generateSection(idx);
      setGeneratedSections((prev) => ({ ...prev, [idx]: content }));
      toast({ title: "Section regenerated" });
    } catch {
      toast({ title: "Failed to regenerate", variant: "destructive" });
    }
    setRegeneratingIdx(null);
  };

  const getFullContent = () => SECTIONS.map((s, i) => `# ${s}\n\n${generatedSections[i] || ""}`).join("\n\n---\n\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const handleDownload = (format: "pdf" | "docx" | "txt") => {
    const full = getFullContent();
    const mimeMap = { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", txt: "text/plain" };
    // For simplicity, download as text/markdown with the chosen extension
    const blob = new Blob([full], { type: format === "txt" ? "text/plain" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.slice(0, 30).replace(/\s+/g, "_")}_documentation.${format === "docx" ? "md" : format === "pdf" ? "md" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Downloaded as ${format.toUpperCase()}` });
  };

  const startEdit = (idx: number) => {
    setEditingSection(idx);
    setEditBuffer(generatedSections[idx] || "");
  };

  const saveEdit = (idx: number) => {
    setGeneratedSections((prev) => ({ ...prev, [idx]: editBuffer }));
    setEditingSection(null);
    toast({ title: "Section updated" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl glass-strong border border-border/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">Documentation Generator</h2>
              <p className="text-xs text-muted-foreground">AI-powered structured documents</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Input Section */}
          <div className="space-y-4">
            {/* Topic */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Enter your topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AI-Powered Healthcare System"
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
              />
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Project Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as typeof PROJECT_TYPES[number])}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Output Format */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as typeof OUTPUT_FORMATS[number])}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {OUTPUT_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as typeof LANGUAGES[number])}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <button
                  onClick={() => setDetailedMode(!detailedMode)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg hover:bg-secondary/60 transition-colors text-xs"
                >
                  {detailedMode ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-foreground">{detailedMode ? "Detailed" : "Simple"} Mode</span>
                </button>
                <button
                  onClick={() => setAutoDiagrams(!autoDiagrams)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg hover:bg-secondary/60 transition-colors text-xs"
                >
                  {autoDiagrams ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-foreground">Auto Diagrams</span>
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating sections...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Documentation
                </>
              )}
            </button>
          </div>

          {/* Generated Content */}
          {(hasContent || isGenerating) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-foreground">Generated Sections</h3>
                {hasContent && (
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:glass-strong text-xs text-muted-foreground hover:text-foreground transition-all">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy All"}
                    </button>
                    <button onClick={() => handleDownload("pdf")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:glass-strong text-xs text-muted-foreground hover:text-foreground transition-all">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                    <button onClick={() => handleDownload("docx")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:glass-strong text-xs text-muted-foreground hover:text-foreground transition-all">
                      <Download className="w-3.5 h-3.5" /> Word
                    </button>
                  </div>
                )}
              </div>

              {SECTIONS.map((section, idx) => {
                const content = generatedSections[idx];
                const isExpanded = expandedSection === idx;
                const isEditing = editingSection === idx;
                const isLoading = isGenerating && content === undefined;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border border-border/30 overflow-hidden transition-all bg-gradient-to-br ${SECTION_COLORS[idx]}`}
                  >
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">{section}</span>
                        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                        {content && !isLoading && <Check className="w-3.5 h-3.5 text-green-400" />}
                      </div>
                      {content && (isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />)}
                    </button>

                    {isExpanded && content && (
                      <div className="px-4 pb-4 space-y-3">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editBuffer}
                              onChange={(e) => setEditBuffer(e.target.value)}
                              className="w-full h-48 px-3 py-2 rounded-lg bg-background/60 border border-border/50 text-foreground text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveEdit(idx)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Save</button>
                              <button onClick={() => setEditingSection(null)} className="px-3 py-1.5 rounded-lg glass text-xs text-muted-foreground">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-sm prose-invert max-w-none text-foreground/90">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        )}

                        {!isEditing && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleRegenerate(idx)}
                              disabled={regeneratingIdx === idx}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:glass-strong text-xs text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3 h-3 ${regeneratingIdx === idx ? "animate-spin" : ""}`} />
                              Regenerate
                            </button>
                            <button
                              onClick={() => startEdit(idx)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:glass-strong text-xs text-muted-foreground hover:text-foreground transition-all"
                            >
                              <Edit3 className="w-3 h-3" />
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentationGenerator;
