import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Menu, Sun, Moon } from "lucide-react";
import { useState } from "react";

interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className={cn(
      "flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50",
      className
    )}>
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="w-5 h-5" />
      </Button>

      {/* Logo (mobile) */}
      <div className="flex items-center space-x-2 md:hidden">
        <div className="w-6 h-6 bg-gradient-primary rounded-md flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">P</span>
        </div>
        <span className="font-bold bg-gradient-primary bg-clip-text text-transparent">
          Plutoid
        </span>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-lg mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search Plutoid..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="w-5 h-5" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
}