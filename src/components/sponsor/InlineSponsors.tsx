import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SponsorCard } from "./SponsorCard";
import { AdSlot } from "./AdSlot";

interface InlineSponsorsProps {
  /** Maximum number of inline sponsors to show (default 2) */
  max?: number;
  /** Page context for tracking */
  page?: string;
  /** Show ad markers even when no sponsors exist */
  showMarkers?: boolean;
}

/**
 * Shows sponsor cards inline in the content flow.
 * Used on mobile where desktop rails are hidden.
 * Shows ad placement markers when no sponsors exist.
 */
export function InlineSponsors({ max = 2, page, showMarkers = false }: InlineSponsorsProps) {
  // Get sponsorships from both rails
  const leftSponsors = useQuery(api.sponsorships.getActiveByPlacement, { placementSlug: "app_left_rail" });
  const rightSponsors = useQuery(api.sponsorships.getActiveByPlacement, { placementSlug: "app_right_rail" });

  // Combine and deduplicate
  const allSponsors = [
    ...(leftSponsors || []),
    ...(rightSponsors || []),
  ];
  const unique = allSponsors.filter(
    (s: any, i: number, arr: any[]) => arr.findIndex((x: any) => x._id === s._id) === i
  );
  const toShow = unique.slice(0, max);

  // If we have real sponsors, show them
  if (toShow.length > 0) {
    return (
      <div className="xl:hidden space-y-3 my-4">
        {toShow.map((s: any) => (
          <SponsorCard
            key={s._id}
            sponsorship={s}
            variant="inline"
            page={page || "inline"}
          />
        ))}
      </div>
    );
  }

  // If no sponsors but markers requested, show ad placement markers
  if (showMarkers) {
    return (
      <div className="xl:hidden my-4">
        <AdSlot placement="inline_mobile" variant="banner" label="Sponsored" />
      </div>
    );
  }

  return null;
}
