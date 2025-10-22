import { Github, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import stardustLogo from "@/assets/stardust-logo.jpg";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shadow-glow-primary">
            <img src={stardustLogo} alt="Stardust Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
              STARDUST
            </h1>
            <p className="text-xs text-muted-foreground">Perpetual Vibe Trader</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">
              Balance: <span className="text-success font-semibold">$1,006.06</span>
            </span>
            <span className="text-muted-foreground">
              Open: <span className="text-foreground font-semibold">1</span>
            </span>
            <span className="text-muted-foreground">
              Closed: <span className="text-foreground font-semibold">376</span>
            </span>
            <span className="text-muted-foreground">
              PnL: <span className="text-success font-semibold">+$42.12</span>
            </span>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://x.com/d4isy_ai" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-5 h-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon">
            <Github className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
