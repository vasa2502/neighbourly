import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/Reveal";
import { SponsorCard } from "@/components/sponsor/SponsorCard";
import {
  useMySponsorships,
  useSponsorAnalytics,
  useCancelAutoRenew,
  useCancelSponsorship,
  useSponsorPlacements,
} from "@/hooks/useConvexData";
import {
  Megaphone,
  Eye,
  MousePointerClick,
  BarChart3,
  ArrowRight,
  RefreshCw,
  XCircle,
  Calendar,
  DollarSign,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending_review: "bg-amber-100 text-amber-700",
  pending_payment: "bg-orange-100 text-orange-700",
  paid: "bg-blue-100 text-blue-700",
  paused: "bg-zinc-100 text-zinc-600",
  expired: "bg-red-100 text-red-600",
  cancelled: "bg-zinc-100 text-zinc-500",
  rejected: "bg-red-100 text-red-600",
};

export default function SponsorDashboard() {
  const { data: sponsorships = [], isLoading } = useMySponsorships();
  const { data: placements = [] } = useSponsorPlacements();
  const cancelAutoRenew = useCancelAutoRenew();
  const cancelSponsorship = useCancelSponsorship();
  const navigate = useNavigate();

  const activeSponsorships = sponsorships.filter((s: any) => s.status === "active" || s.status === "approved");
  const pastSponsorships = sponsorships.filter((s: any) => ["expired", "cancelled", "rejected"].includes(s.status));
  const pendingSponsorships = sponsorships.filter((s: any) => ["pending_payment", "pending_review", "paid"].includes(s.status));

  const getPlacementName = (placementId: string) => {
    const p = placements.find((pl: any) => pl._id === placementId);
    return p?.name || "Placement";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-[hsl(155,45%,32%)]" /> My Sponsorships
          </h1>
          <Link to="/dashboard/sponsor/checkout">
            <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white rounded-full font-semibold">
              <Megaphone className="w-4 h-4 mr-1" /> New Sponsorship
            </Button>
          </Link>
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <Megaphone className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" />
              <p className="text-xl font-bold text-foreground">{activeSponsorships.length}</p>
              <p className="text-[10px] text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <Eye className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" />
              <p className="text-xl font-bold text-foreground">{sponsorships.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Sponsorships</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <DollarSign className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" />
              <p className="text-xl font-bold text-foreground">{sponsorships.length * 299}</p>
              <p className="text-[10px] text-muted-foreground">Total Spent ($)</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <RefreshCw className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" />
              <p className="text-xl font-bold text-foreground">
                {activeSponsorships.filter((s: any) => s.autoRenew).length}
              </p>
              <p className="text-[10px] text-muted-foreground">Auto-Renewing</p>
            </CardContent>
          </Card>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sponsorships.length === 0 ? (
        <Reveal delay={0.1}>
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-12 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-bold text-foreground text-lg mb-2">No sponsorships yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Start reaching your audience with premium sponsorship placements.
              </p>
              <Link to="/dashboard/sponsor/checkout">
                <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full font-semibold">
                  Create Your First Sponsorship <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <div className="space-y-8">
          {/* Pending */}
          {pendingSponsorships.length > 0 && (
            <Reveal delay={0.1}>
              <h2 className="font-bold text-foreground text-sm mb-3">Pending</h2>
              <div className="space-y-3">
                {pendingSponsorships.map((s: any) => (
                  <SponsorshipCard
                    key={s._id}
                    sponsorship={s}
                    placementName={getPlacementName(s.placementId)}
                    onCancel={() => {}}
                    showActions={false}
                  />
                ))}
              </div>
            </Reveal>
          )}

          {/* Active */}
          {activeSponsorships.length > 0 && (
            <Reveal delay={0.15}>
              <h2 className="font-bold text-foreground text-sm mb-3">Active</h2>
              <div className="space-y-3">
                {activeSponsorships.map((s: any) => (
                  <SponsorshipCard
                    key={s._id}
                    sponsorship={s}
                    placementName={getPlacementName(s.placementId)}
                    onCancelAutoRenew={() => {
                      cancelAutoRenew.mutate({ sponsorshipId: s._id, userId: s.userId }, {
                        onSuccess: () => toast.success("Auto-renewal cancelled"),
                        onError: () => toast.error("Failed to cancel"),
                      });
                    }}
                    onCancel={() => {
                      cancelSponsorship.mutate({ sponsorshipId: s._id, userId: s.userId }, {
                        onSuccess: () => toast.success("Sponsorship cancelled"),
                        onError: () => toast.error("Failed to cancel"),
                      });
                    }}
                    showActions
                  />
                ))}
              </div>
            </Reveal>
          )}

          {/* Analytics for active */}
          {activeSponsorships.length > 0 && (
            <Reveal delay={0.2}>
              <h2 className="font-bold text-foreground text-sm mb-3">Analytics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeSponsorships.map((s: any) => (
                  <AnalyticsCard key={s._id} sponsorshipId={s._id} companyName={s.companyName} />
                ))}
              </div>
            </Reveal>
          )}

          {/* Past */}
          {pastSponsorships.length > 0 && (
            <Reveal delay={0.25}>
              <h2 className="font-bold text-foreground text-sm mb-3">Past Sponsorships</h2>
              <div className="space-y-3">
                {pastSponsorships.map((s: any) => (
                  <SponsorshipCard
                    key={s._id}
                    sponsorship={s}
                    placementName={getPlacementName(s.placementId)}
                    showActions={false}
                  />
                ))}
              </div>
            </Reveal>
          )}
        </div>
      )}
    </div>
  );
}

function SponsorshipCard({
  sponsorship,
  placementName,
  onCancelAutoRenew,
  onCancel,
  showActions,
}: {
  sponsorship: any;
  placementName: string;
  onCancelAutoRenew?: () => void;
  onCancel?: () => void;
  showActions: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusClass = STATUS_COLORS[sponsorship.status] || "bg-zinc-100 text-zinc-600";

  return (
    <Card className="border-border/40 rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {sponsorship.logoUrl && (
              <img src={sponsorship.logoUrl} alt={sponsorship.companyName} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border/30" />
            )}
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm">{sponsorship.companyName}</p>
              <p className="text-xs text-muted-foreground">{placementName}</p>
              {sponsorship.startsAt && sponsorship.endsAt && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(sponsorship.startsAt).toLocaleDateString()} → {new Date(sponsorship.endsAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`text-[10px] ${statusClass}`}>{sponsorship.status.replace("_", " ")}</Badge>
            {showActions && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)}>
                <Megaphone className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {expanded && showActions && (
          <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Auto-renewal:</span>
              <span className={sponsorship.autoRenew ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                {sponsorship.autoRenew ? "Active" : "Cancelled"}
              </span>
            </div>
            {sponsorship.autoRenew && onCancelAutoRenew && (
              <Button variant="outline" size="sm" className="rounded-full text-xs w-full" onClick={onCancelAutoRenew}>
                <XCircle className="w-3 h-3 mr-1" /> Cancel Auto-Renewal
              </Button>
            )}
            {onCancel && sponsorship.status === "active" && (
              <Button variant="outline" size="sm" className="rounded-full text-xs w-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={onCancel}>
                <XCircle className="w-3 h-3 mr-1" /> Cancel Sponsorship
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalyticsCard({ sponsorshipId, companyName }: { sponsorshipId: string; companyName: string }) {
  const { data: analytics } = useSponsorAnalytics(sponsorshipId);

  return (
    <Card className="border-border/40 rounded-xl">
      <CardContent className="p-4">
        <p className="text-xs font-semibold text-foreground mb-3">{companyName}</p>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-lg font-bold text-foreground">{analytics?.impressions?.toLocaleString() || "0"}</p>
            <p className="text-[10px] text-muted-foreground">Impressions</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{analytics?.clicks?.toLocaleString() || "0"}</p>
            <p className="text-[10px] text-muted-foreground">Clicks</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{analytics?.ctr || "0"}%</p>
            <p className="text-[10px] text-muted-foreground">CTR</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
