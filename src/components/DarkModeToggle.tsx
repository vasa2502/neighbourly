import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export function DarkModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className={`rounded-xl h-9 w-9 ${className || ""}`}
      title={`Theme: ${theme}`}
    >
      {theme === "dark" ? (
        <Moon className="w-[18px] h-[18px]" />
      ) : theme === "system" ? (
        <Monitor className="w-[18px] h-[18px]" />
      ) : (
        <Sun className="w-[18px] h-[18px]" />
      )}
    </Button>
  );
}
