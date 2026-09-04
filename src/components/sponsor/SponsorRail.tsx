import { useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SponsorCard } from "./SponsorCard";
import { OpenSlotCard } from "./OpenSlotCard";

interface SponsorRailProps {
  side: "left" | "right";
}

export function SponsorRail({ side }: SponsorRailProps) {
  const slug = side === "left" ? "app_left_rail" : "app_right_rail";
  const sponsorships = useQuery(api.sponsorships.getActiveByPlacement, { placementSlug: slug });
  const placements = useQuery(api.sponsorships.getPlacements, {});
  const expireStale = useMutation(api.sponsorships.expireStale);

  // Auto-expire stale sponsorships on mount
  useEffect(() => {
    expireStale().catch(() => {});
  }, [expireStale]);

  // Find the placement to get maxSlots and price
  const placement = useMemo(() => {
    if (!placements) return null;
    return placements.find((p: any) => p.slug === slug) || null;
  }, [placements, slug]);

  const maxSlots = (placement as any)?.maxSlots || 5;
  const price = ((placement as any)?.price || 29900) / 100;

  // Calculate open slots
  const activeSponsors = sponsorships || [];
  const openSlotCount = Math.max(0, maxSlots - activeSponsors.length);

  // Build slot items: real sponsors + open slots
  const slotItems = useMemo(() => {
    const items: Array<{ type: "sponsor"; data: any } | { type: "open"; index: number }> = [];

    // Add real sponsors first
    for (const s of activeSponsors) {
      items.push({ type: "sponsor", data: s });
    }

    // Fill remaining with open slots
    for (let i = 0; i < openSlotCount; i++) {
      items.push({ type: "open", index: i });
    }

    return items;
  }, [activeSponsors, openSlotCount]);

  return (
    <aside
      className="flex flex-col w-full h-full overflow-hidden bg-gradient-to-b from-[hsl(155,20%,97%)] to-[hsl(155,15%,95%)] dark:from-[hsl(155,18%,8%)] dark:to-[hsl(155,15%,6%)]"
      aria-label={`${side === "left" ? "Left" : "Right"} sponsored content`}
    >
      <div className="flex flex-col gap-2 p-2.5 h-full overflow-y-auto overflow-x-hidden scrollbar-none">
        {/* Slots */}
        <div className="flex flex-col gap-2">
          {slotItems.map((item, i) => {
            if (item.type === "sponsor") {
              return (
                <SponsorCard
                  key={item.data._id}
                  sponsorship={item.data}
                  variant="rail"
                  page={`rail_${side}`}
                />
              );
            }
            return (
              <OpenSlotCard
                key={`open-${item.index}`}
                side={side}
                price={price}
                placementSlug={slug}
                slotIndex={item.index}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}
