import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import daisyLogo from "@/assets/daisy-logo-new.png";
import xLogo from "@/assets/x-logo.png";

export const Header = () => {
  const { t } = useTranslation();
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-glow-primary bg-background p-1">
            <img src={daisyLogo} alt="Daisy Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-daisy bg-clip-text text-transparent">
              {t('header.title')}
            </h1>
            <p className="text-xs text-muted-foreground">{t('header.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Button variant="ghost" size="icon" asChild>
            <a href="https://x.com/d4isy_ai" target="_blank" rel="noopener noreferrer">
              <img src={xLogo} alt="X" className="w-4 h-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/d4isy/" target="_blank" rel="noopener noreferrer">
              <Github className="w-5 h-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};
