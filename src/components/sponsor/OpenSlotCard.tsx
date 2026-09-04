import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface OpenSlotCardProps {
  side: "left" | "right";
  price?: number;
  durationDays?: number;
  placementSlug?: string;
  slotIndex?: number;
}

export function OpenSlotCard({
  side,
  price = 299,
  durationDays = 30,
  placementSlug,
  slotIndex = 0,
}: OpenSlotCardProps) {
  const href = placementSlug
    ? `/dashboard/sponsor?placementId=${encodeURIComponent(placementSlug)}&slot=${slotIndex}`
    : "/dashboard/sponsor";

  return (
    <Link
      to={href}
      className="block group"
    >
      <div className="relative bg-gradient-to-br from-[hsl(155,40%,94%)] to-[hsl(155,50%,90%)] dark:from-[hsl(155,25%,13%)] dark:to-[hsl(155,30%,10%)] border-2 border-dashed border-[hsl(155,40%,75%)] dark:border-[hsl(155,30%,25%)] rounded-2xl overflow-hidden hover:border-[hsl(155,55%,55%)] dark:hover:border-[hsl(155,50%,40%)] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[hsl(155,45%,32%)]/15">
        <div className="p-2.5 text-center">
          {/* Icon */}
          <div className="w-7 h-7 rounded-full bg-[hsl(155,45%,32%)]/10 dark:bg-[hsl(155,50%,45%)]/15 flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(155,50%,38%)] dark:text-[hsl(155,55%,58%)]" />
          </div>

          {/* Label */}
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[hsl(155,50%,35%)] dark:text-[hsl(155,55%,58%)] mb-0.5">
            Open Slot
          </p>

          {/* Price */}
          <div className="mb-1.5">
            <span className="text-base font-extrabold text-[hsl(155,50%,32%)] dark:text-[hsl(155,55%,55%)] group-hover:text-[hsl(155,55%,28%)] dark:group-hover:text-[hsl(155,60%,60%)] transition-colors">
              ${price}
            </span>
            <span className="text-[9px] text-muted-foreground ml-0.5">
              /{durationDays}d
            </span>
          </div>

          {/* CTA */}
          <p className="text-[9px] font-semibold text-[hsl(155,45%,38%)] dark:text-[hsl(155,45%,58%)] group-hover:text-[hsl(155,50%,28%)] dark:group-hover:text-[hsl(155,55%,68%)] transition-colors">
            Put your brand here →
          </p>
        </div>
      </div>
    </Link>
  );
}
