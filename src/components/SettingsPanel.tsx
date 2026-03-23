import { useState } from "react";
import { X, Volume2, VolumeX, Globe, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [language, setLanguage] = useState("english");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm animate-fade-up">
      <div className="glass rounded-2xl w-full max-w-md mx-4 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-lg gradient-text">⚙️ Settings</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Voice */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
              <Label>Voice Input</Label>
            </div>
            <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-accent-foreground" />
              <Label>Auto-speak AI replies</Label>
            </div>
            <Switch checked={autoSpeak} onCheckedChange={setAutoSpeak} />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-primary" />
              <Label>Language</Label>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none"
            >
              <option value="english">English</option>
              <option value="telugu">Telugu</option>
              <option value="hindi">Hindi</option>
              <option value="spanish">Spanish</option>
            </select>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-accent-foreground" />
              <Label>Theme</Label>
            </div>
            <div className="flex gap-2">
              {["#7c3aed", "#3b82f6", "#10b981", "#f59e0b"].map((c) => (
                <button
                  key={c}
                  className="w-6 h-6 rounded-full border-2 border-border hover:scale-110 transition-transform"
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center">Nexa v1.0 • Free to use ✨</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
