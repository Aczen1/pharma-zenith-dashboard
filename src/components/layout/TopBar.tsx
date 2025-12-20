import { useState, useEffect } from "react";
import { Search, Bell, Mic, MicOff, Languages, ChevronDown, MapPin } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation as useAppLocation } from "@/contexts/LocationContext";
import { Language } from "@/lib/translations";

interface TopBarProps {
  title: string;
}

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
];

const voiceLanguageCodes: Record<Language, string> = {
  en: "en-US",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
};

export const TopBar = ({ title }: TopBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { language, setLanguage, t } = useLanguage();
  const { location } = useAppLocation();

  const selectedLanguage = languages.find(l => l.code === language) || languages[0];
  const voiceLanguageCode = voiceLanguageCodes[language];

  const { isListening, transcript, isSupported, toggleListening } = useVoiceRecording(voiceLanguageCode);

  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between glass-topbar px-4 md:px-6">
      {/* Left - Title & Location */}
      <div className="flex items-center gap-3 shrink-0">
        <h1 className="text-lg md:text-xl font-semibold text-foreground">{title}</h1>
        <Badge variant="secondary" className="hidden sm:flex gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border-primary/20">
          <MapPin className="h-3 w-3" />
          <span className="text-xs font-medium">{t('locationBadge')}</span>
        </Badge>
      </div>

      {/* Center - Search Bar */}
      <div className="hidden md:flex flex-1 justify-center max-w-xl mx-4">
        <div className="relative flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 glass-card border-border/50 focus:border-primary/50"
            />
          </div>

          {isSupported && (
            <Button
              size="icon"
              variant={isListening ? "default" : "outline"}
              onClick={toggleListening}
              className={cn(
                "shrink-0 h-9 w-9",
                isListening && "bg-destructive hover:bg-destructive/90 animate-pulse"
              )}
              title={isListening ? "Stop recording" : "Start voice search"}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Search className="h-4 w-4" />
        </Button>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 px-2 md:gap-2 md:px-3">
              <Languages className="h-4 w-4" />
              <span className="hidden lg:inline text-sm">{selectedLanguage.nativeName}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "cursor-pointer",
                  language === lang.code && "bg-accent"
                )}
              >
                <span className="font-medium">{lang.nativeName}</span>
                <span className="ml-2 text-xs text-muted-foreground">({lang.name})</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-background/50 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            3
          </span>
        </button>

        {/* User Profile */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </header>
  );
};
