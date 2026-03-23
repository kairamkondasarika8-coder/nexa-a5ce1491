import { useState } from "react";
import { X, Presentation, Download, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Slide {
  title: string;
  content: string[];
  type: "title" | "content" | "summary";
}

interface PPTMakerProps {
  isOpen: boolean;
  onClose: () => void;
}

const styles = [
  { id: "professional", label: "Professional", emoji: "💼", color: "from-blue-500 to-cyan-500" },
  { id: "educational", label: "Educational", emoji: "🎓", color: "from-green-500 to-emerald-500" },
  { id: "creative", label: "Creative", emoji: "🎨", color: "from-purple-500 to-pink-500" },
];

const slideColors = [
  "from-primary/20 to-accent/20",
  "from-blue-900/30 to-indigo-900/30",
  "from-emerald-900/30 to-teal-900/30",
  "from-purple-900/30 to-pink-900/30",
  "from-amber-900/30 to-orange-900/30",
  "from-cyan-900/30 to-blue-900/30",
  "from-rose-900/30 to-red-900/30",
  "from-violet-900/30 to-indigo-900/30",
];

const PPTMaker = ({ isOpen, onClose }: PPTMakerProps) => {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [style, setStyle] = useState("professional");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const generateSlides = async () => {
    if (!topic.trim()) {
      toast({ title: "Enter a topic", description: "Please enter a presentation topic", variant: "destructive" });
      return;
    }

    setLoading(true);
    setSlides([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ppt", {
        body: { topic, slideCount, style },
      });

      if (error) throw error;
      if (data?.slides) {
        setSlides(data.slides);
        setActiveSlide(0);
        toast({ title: "✨ Presentation Generated!", description: `${data.slides.length} slides created` });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to generate presentation", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadAsHTML = () => {
    if (slides.length === 0) return;

    const styleThemes: Record<string, { bg: string; accent: string; text: string }> = {
      professional: { bg: "#1a1a2e", accent: "#4361ee", text: "#e0e0e0" },
      educational: { bg: "#0d2818", accent: "#2d6a4f", text: "#d8f3dc" },
      creative: { bg: "#240046", accent: "#9d4edd", text: "#e0aaff" },
    };
    const theme = styleThemes[style] || styleThemes.professional;

    const slideHTML = slides
      .map(
        (s, i) => `
      <div class="slide" style="page-break-after: always; padding: 60px; min-height: 100vh; background: ${theme.bg}; display: flex; flex-direction: column; justify-content: center;">
        <div style="background: ${theme.accent}22; border-left: 4px solid ${theme.accent}; padding: 20px 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: ${theme.accent}; font-size: ${s.type === "title" ? "36px" : "28px"}; margin: 0;">${s.title}</h2>
          <span style="color: ${theme.text}88; font-size: 12px;">Slide ${i + 1} of ${slides.length}</span>
        </div>
        <ul style="list-style: none; padding: 0;">
          ${s.content.map((c) => `<li style="color: ${theme.text}; font-size: 18px; padding: 12px 0; border-bottom: 1px solid ${theme.accent}22;">• ${c}</li>`).join("")}
        </ul>
      </div>`
      )
      .join("\n");

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${topic}</title>
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',sans-serif;}@media print{.slide{page-break-after:always;}}</style>
</head><body>${slideHTML}</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/\s+/g, "-")}-presentation.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Open the HTML file in a browser and print as PDF" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up">
      <div className="w-full max-w-5xl max-h-[90vh] mx-4 glass-strong rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow">
              <Presentation className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg gradient-text">PPT Maker</h2>
              <p className="text-[10px] text-muted-foreground">AI-powered presentation generator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Artificial Intelligence in Healthcare"
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Number of Slides</label>
              <select
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {[3, 5, 7, 10, 12, 15].map((n) => (
                  <option key={n} value={n} className="bg-background">
                    {n} slides
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Style</label>
              <div className="flex gap-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-medium transition-all border ${
                      style === s.id
                        ? "border-primary bg-primary/10 text-primary glow"
                        : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generateSlides}
            disabled={loading || !topic.trim()}
            className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-40 glow-send"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate Presentation
              </>
            )}
          </button>

          {/* Slides preview */}
          {slides.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm gradient-text">
                  📊 {slides.length} Slides Generated
                </h3>
                <button
                  onClick={downloadAsHTML}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-accent text-primary-foreground text-xs font-medium hover:opacity-90 transition-all"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`shrink-0 w-28 h-20 rounded-lg p-2 text-left transition-all border bg-gradient-to-br ${
                      slideColors[i % slideColors.length]
                    } ${
                      activeSlide === i
                        ? "border-primary ring-2 ring-primary/30 glow"
                        : "border-border/30 hover:border-primary/30"
                    }`}
                  >
                    <p className="text-[8px] font-bold text-foreground truncate">{s.title}</p>
                    <p className="text-[7px] text-muted-foreground mt-0.5 line-clamp-2">
                      {s.content[0]}
                    </p>
                    <span className="text-[7px] text-muted-foreground/60 mt-auto block">
                      {i + 1}/{slides.length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active slide preview */}
              {slides[activeSlide] && (
                <div
                  className={`rounded-2xl p-6 border border-border/30 bg-gradient-to-br ${
                    slideColors[activeSlide % slideColors.length]
                  } min-h-[250px]`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      Slide {activeSlide + 1}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground capitalize">
                      {slides[activeSlide].type}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-4 mt-2">
                    {slides[activeSlide].title}
                  </h3>
                  <ul className="space-y-2">
                    {slides[activeSlide].content.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PPTMaker;
