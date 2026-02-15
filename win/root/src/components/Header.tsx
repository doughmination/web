import { Search, Menu, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";

interface HeaderProps {
  onMenuClick?: () => void;
}

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-1.5 bg-muted rounded-full p-1">
      <Sun className={`w-4 h-4 transition-colors ${!isDark ? 'text-amber-500' : 'text-muted-foreground'}`} />
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative w-10 h-5 bg-border rounded-full transition-colors"
        aria-label="Toggle theme"
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-foreground rounded-full transition-all duration-200 ${isDark ? 'left-5' : 'left-0.5'
            }`}
        />
      </button>
      <Moon className={`w-4 h-4 transition-colors ${isDark ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  );
};

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/favicon.png"
              alt="Doughmination System"
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-bold text-lg hidden sm:inline">Doughmination System</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
