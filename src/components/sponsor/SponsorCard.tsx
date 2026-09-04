import { useEffect, useRef } from "react";
import { ExternalLink, Tag } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface SponsorCardProps {
  sponsorship: {
    _id: string;
    companyName: string;
    headline?: string;
    description: string;
    ctaText: string;
    ctaUrl: string;
    logoUrl?: string;
    discountCode?: string;
    promoMessage?: string;
  };
  variant?: "rail" | "inline" | "compact";
  page?: string;
}

export function SponsorCard({ sponsorship, variant = "rail", page }: SponsorCardProps) {
  const trackEvent = useMutation(api.sponsorships.trackEvent);
  const ref = useRef<HTMLDivElement>(null);
  const hasTrackedImpression = useRef(false);

  // Track impression via IntersectionObserver when visible
  useEffect(() => {
    if (!ref.current || hasTrackedImpression.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedImpression.current) {
            hasTrackedImpression.current = true;
            trackEvent({
              sponsorshipId: sponsorship._id,
              eventType: "impression",
              page: page || window.location.pathname,
              referrer: document.referrer || undefined,
              userAgent: navigator.userAgent,
            }).catch(() => {});
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [sponsorship._id, page, trackEvent]);

  const handleClick = () => {
    trackEvent({
      sponsorshipId: sponsorship._id,
      eventType: "click",
      page: page || window.location.pathname,
    }).catch(() => {});
    // Open the sponsor's website in a new tab
    window.open(sponsorship.ctaUrl, "_blank", "noopener,noreferrer");
  };

  if (variant === "compact") {
    return (
      <div ref={ref} className="bg-white dark:bg-zinc-900 border border-[hsl(155,30%,85%)] dark:border-[hsl(155,20%,20%)] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-2.5">
          {sponsorship.logoUrl && (
            <img
              src={sponsorship.logoUrl}
              alt={sponsorship.companyName}
              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-[hsl(155,30%,85%)]"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-foreground truncate">{sponsorship.companyName}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
              {sponsorship.headline || sponsorship.description}
            </p>
          </div>
        </div>
        <button
          onClick={handleClick}
          className="mt-2 w-full text-[10px] font-semibold text-[hsl(155,50%,32%)] hover:text-[hsl(155,50%,26%)] transition-colors flex items-center justify-center gap-1"
        >
          {sponsorship.ctaText} <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }

  // "rail" or "inline" variant — bright, integrated design
  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="bg-white dark:bg-zinc-900 border border-[hsl(155,30%,85%)] dark:border-[hsl(155,20%,20%)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-[hsl(155,45%,32%)]/10 transition-all duration-300 group cursor-pointer"
    >
      {/* Top accent — bright green gradient */}
      {variant === "rail" && (
        <div className="h-1 bg-gradient-to-r from-[hsl(155,50%,50%)] to-[hsl(155,65%,42%)]" />
      )}

      <div className="p-2.5">
        {/* Logo + name */}
        <div className="flex items-start gap-2 mb-1.5">
          {sponsorship.logoUrl && (
            <img
              src={sponsorship.logoUrl}
              alt={sponsorship.companyName}
              className="w-7 h-7 rounded-lg object-cover shrink-0 border border-[hsl(155,30%,85%)]"
            />
          )}
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-foreground leading-tight">{sponsorship.companyName}</p>
            {sponsorship.headline && (
              <p className="text-[9px] font-medium text-muted-foreground mt-0.5 line-clamp-1">
                {sponsorship.headline}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[10px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">
          {sponsorship.description}
        </p>

        {/* Discount code */}
        {sponsorship.discountCode && (
          <div className="flex items-center gap-1.5 mb-2 bg-[hsl(155,25%,94%)] dark:bg-[hsl(155,20%,14%)] rounded-lg px-2 py-1">
            <Tag className="w-2.5 h-2.5 text-[hsl(155,50%,32%)]" />
            <span className="text-[9px] font-bold text-[hsl(155,50%,32%)]">
              Code: {sponsorship.discountCode}
            </span>
          </div>
        )}

        {/* Promo message */}
        {sponsorship.promoMessage && (
          <p className="text-[9px] text-muted-foreground italic mb-2 line-clamp-2">{sponsorship.promoMessage}</p>
        )}

        {/* CTA button */}
        <div className="w-full h-7 rounded-lg bg-[hsl(155,50%,32%)] group-hover:bg-[hsl(155,50%,26%)] text-white text-[10px] font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow-md">
          {sponsorship.ctaText} <ExternalLink className="w-2.5 h-2.5" />
        </div>
      </div>
    </div>
  );
}
