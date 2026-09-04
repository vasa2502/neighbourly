import { Link } from "react-router-dom";
import { Megaphone } from "lucide-react";

interface AdSlotProps {
  placement?: string;
  className?: string;
  variant?: "inline" | "banner" | "card";
  label?: string;
}

export function AdSlot({ placement, className = "", variant = "banner", label }: AdSlotProps) {
  if (variant === "inline") {
    return (
      <Link
        to="/sponsor"
        className={`block text-center py-2 ${className}`}
      >
        <p className="text-[10px] font-medium text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          {label || "Sponsored"} · Advertise here →
        </p>
      </Link>
    );
  }

  if (variant === "card") {
    return (
      <Link
        to={placement ? `/sponsor?placement=${encodeURIComponent(placement)}` : "/sponsor"}
        className={`block ${className}`}
      >
        <div className="bg-gradient-to-br from-[hsl(155,40%,94%)] to-[hsl(155,50%,90%)] dark:from-[hsl(155,25%,14%)] dark:to-[hsl(155,30%,11%)] border border-[hsl(155,35%,80%)] dark:border-[hsl(155,25%,22%)] rounded-xl p-4 text-center hover:border-[hsl(155,50%,50%)] transition-colors">
          <Megaphone className="w-4 h-4 text-[hsl(155,50%,40%)] mx-auto mb-1.5" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(155,50%,35%)]">
            {label || "Ad Space Available"}
          </p>
          <p className="text-[9px] text-muted-foreground mt-1">Sponsor this spot →</p>
        </div>
      </Link>
    );
  }

  // Banner variant (default) — bright, integrated design
  return (
    <Link
      to={placement ? `/sponsor?placement=${encodeURIComponent(placement)}` : "/sponsor"}
      className={`block group ${className}`}
    >
      <div className="bg-gradient-to-r from-[hsl(155,35%,93%)] to-[hsl(155,45%,89%)] dark:from-[hsl(155,20%,13%)] dark:to-[hsl(155,25%,10%)] border border-[hsl(155,30%,82%)] dark:border-[hsl(155,20%,20%)] rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:border-[hsl(155,50%,50%)] dark:hover:border-[hsl(155,45%,35%)] transition-colors">
        <Megaphone className="w-3.5 h-3.5 text-[hsl(155,50%,40%)] shrink-0" />
        <p className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {label || "Sponsored space — advertise here"}
        </p>
      </div>
    </Link>
  );
}
