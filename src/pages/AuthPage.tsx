import { useState } from "react";
import { Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, Brain, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthPageProps {
  onLogin: (name: string) => void;
}

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      onLogin(name || email.split("@")[0] || "User");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center glow-strong animate-float">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl -z-10 animate-pulse-glow" />
          </div>
          <h1 className="font-display font-bold text-3xl gradient-text flex items-center gap-2">
            Nexa AI <Sparkles className="w-5 h-5 text-accent-foreground" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your intelligent AI companion</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 border border-border/30 shadow-2xl">
          <h2 className="font-display font-bold text-xl text-foreground text-center mb-6">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="relative animate-fade-up">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-secondary/20 border-border/50 focus:border-primary/50 h-12 rounded-xl"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary/20 border-border/50 focus:border-primary/50 h-12 rounded-xl"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 bg-secondary/20 border-border/50 focus:border-primary/50 h-12 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {!isSignup && (
              <div className="text-right">
                <button type="button" className="text-xs text-primary/80 hover:text-primary transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 glow font-semibold text-sm transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>{isSignup ? "Creating Account..." : "Signing In..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>{isSignup ? "Sign Up" : "Login"}</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary font-medium hover:underline transition-colors"
              >
                {isSignup ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/50 text-center mt-6">
          Nexa AI © 2026 • Free to use
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
