import { Plus, MessageSquare, PanelLeftClose, PanelLeft, Pin, Download, Moon, Sun, Share2, Trash2, Settings, LogIn, User, Search, X } from "lucide-react";
import { useState } from "react";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  pinned?: boolean;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
  onSettingsOpen: () => void;
  onLoginOpen: () => void;
  userName?: string;
}

const ChatSidebar = ({ sessions, activeId, onSelect, onNew, isOpen, onToggle, onPin, onDelete, onDownload, onShare, onSettingsOpen, onLoginOpen, userName }: ChatSidebarProps) => {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinned = filtered.filter((s) => s.pinned);
  const unpinned = filtered.filter((s) => !s.pinned);

  return (
    <>
      {isOpen &&
      <div className="fixed inset-0 bg-background/60 z-30 md:hidden" onClick={onToggle} />
      }

      {!isOpen &&
      <button
        onClick={onToggle}
        className="hidden md:flex fixed top-4 left-4 z-20 p-2 rounded-xl glass hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
        
          <PanelLeft className="w-5 h-5" />
        </button>
      }

      <aside
        className={`fixed md:relative z-40 h-full flex flex-col glass-strong border-r border-border/30 transition-all duration-300 ${
        isOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full md:translate-x-0"} overflow-hidden`
        }>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="font-display font-semibold text-sm gradient-text">💬 Chats</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
              title={isDark ? "Light mode" : "Dark mode"}>
              
              {isDark ? <Sun className="w-4 h-4 text-secondary" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
              
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New chat */}
        <div className="p-3 shrink-0">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90 glow">
            
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary/60 text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3 space-y-1">
          {pinned.length > 0 &&
          <>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 pt-2 pb-1">📌 Pinned</p>
              {pinned.map((s) =>
            <SessionItem
              key={s.id}
              session={s}
              active={s.id === activeId}
              onSelect={onSelect}
              onPin={onPin}
              onDelete={onDelete}
              onDownload={onDownload}
              onShare={onShare} />

            )}
            </>
          }

          {unpinned.length > 0 &&
          <>
              {pinned.length > 0 &&
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3 pt-3 pb-1">🕘 Recent</p>
            }
              {unpinned.map((s) =>
            <SessionItem
              key={s.id}
              session={s}
              active={s.id === activeId}
              onSelect={onSelect}
              onPin={onPin}
              onDelete={onDelete}
              onDownload={onDownload}
              onShare={onShare} />

            )}
            </>
          }
        </div>

        {/* Bottom: Settings & Profile */}
        <div className="p-3 border-t border-border shrink-0 space-y-2">
          <button
            onClick={onSettingsOpen}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-colors">
            
            <Settings className="w-4 h-4" />
            Settings
          </button>

          {userName ?
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30">
              <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">{userName[0].toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-foreground truncate">{userName}</span>
            </div> :

          <button
            onClick={onLoginOpen}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-all glow">
            
              <LogIn className="w-4 h-4" />
              Login / Sign Up
            </button>
          }
        </div>
      </aside>
    </>);

};

function SessionItem({
  session: s,
  active,
  onSelect,
  onPin,
  onDelete,
  onDownload,
  onShare








}: {session: ChatSession;active: boolean;onSelect: (id: string) => void;onPin: (id: string) => void;onDelete: (id: string) => void;onDownload: (id: string) => void;onShare: (id: string) => void;}) {
  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
      active ?
      "bg-secondary text-foreground border border-primary/20" :
      "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"}`
      }
      onClick={() => onSelect(s.id)}>
      
      <MessageSquare className="w-4 h-4 shrink-0" />
      <span className="truncate flex-1">{s.title}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {e.stopPropagation();onPin(s.id);}}
          className={`p-1 rounded hover:bg-primary/20 ${s.pinned ? "text-primary" : ""}`}
          title={s.pinned ? "Unpin" : "Pin"}>
          
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {e.stopPropagation();onShare(s.id);}}
          className="p-1 rounded hover:bg-primary/20"
          title="Share">
          
          <Share2 className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {e.stopPropagation();onDownload(s.id);}}
          className="p-1 rounded hover:bg-primary/20"
          title="Download">
          
          <Download className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {e.stopPropagation();onDelete(s.id);}}
          className="p-1 rounded hover:bg-destructive/20 text-destructive"
          title="Delete">
          
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>);

}

export default ChatSidebar;