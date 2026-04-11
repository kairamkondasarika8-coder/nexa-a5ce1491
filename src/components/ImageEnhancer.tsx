import { useState, useRef, useCallback } from "react";
import { X, Upload, Download, Sparkles, ImageIcon, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface ImageEnhancerProps {
  isOpen: boolean;
  onClose: () => void;
}

const styles = [
  { id: "vibrant", label: "🎨 Vibrant", desc: "Rich colors, bokeh blur, soft glow" },
  { id: "cinematic", label: "🎬 Cinematic", desc: "Premium cinematic tone, depth" },
  { id: "aesthetic", label: "✨ Aesthetic", desc: "Instagram-style, vivid tones" },
  { id: "clean", label: "🔥 Clean", desc: "Sharp text/UI, subtle blur" },
];

const ImageEnhancer = ({ isOpen, onClose }: ImageEnhancerProps) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("vibrant");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB allowed.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setEnhancedImage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  }, [handleFile]);

  const enhance = async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    setEnhancedImage(null);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64: originalImage, style: selectedStyle }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Enhancement failed" }));
        throw new Error(err.error || "Enhancement failed");
      }

      const data = await resp.json();
      setEnhancedImage(data.enhancedImage);
      toast({ title: "✨ Enhanced!", description: data.message || "Your image has been enhanced." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!enhancedImage) return;
    const link = document.createElement("a");
    link.href = enhancedImage;
    link.download = `nexa-enhanced-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-strong border-border/50" onPaste={handlePaste}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl gradient-text">
            <Sparkles className="w-5 h-5 text-accent-foreground" />
            AI Image Enhancer
          </DialogTitle>
        </DialogHeader>

        {/* Style selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStyle(s.id)}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedStyle === s.id
                  ? "border-primary/50 bg-primary/10 glow"
                  : "border-border/30 glass hover:glass-strong"
              }`}
            >
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>

        {/* Upload area or preview */}
        {!originalImage ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
              isDragOver ? "border-primary bg-primary/5 glow" : "border-border/40 hover:border-primary/30"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center glow animate-float">
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Drop an image, paste, or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WebP • Max 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Before / After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <ImageIcon className="w-4 h-4" /> Original
                </div>
                <div className="rounded-xl overflow-hidden border border-border/30 bg-secondary/20">
                  <img src={originalImage} alt="Original" className="w-full h-auto max-h-[300px] object-contain" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-accent-foreground" /> Enhanced
                </div>
                <div className="rounded-xl overflow-hidden border border-border/30 bg-secondary/20 min-h-[200px] flex items-center justify-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3 p-8">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground animate-pulse">Enhancing with AI...</p>
                    </div>
                  ) : enhancedImage ? (
                    <img src={enhancedImage} alt="Enhanced" className="w-full h-auto max-h-[300px] object-contain" />
                  ) : (
                    <p className="text-sm text-muted-foreground/50 p-8">Click "Enhance" to see magic ✨</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={enhance}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-all glow-strong disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isProcessing ? "Enhancing..." : "Enhance"}
                {!isProcessing && <ArrowRight className="w-4 h-4" />}
              </button>

              {enhancedImage && (
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:glass-strong border border-primary/20 font-medium transition-all hover:glow"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}

              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-3 rounded-xl glass hover:glass-strong text-muted-foreground hover:text-foreground transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                New Image
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageEnhancer;
