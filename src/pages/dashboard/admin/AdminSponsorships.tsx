import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/motion/Reveal";
import { SponsorCard } from "@/components/sponsor/SponsorCard";
import {
  useAdminSponsorships,
  useApproveSponsorship,
  useRejectSponsorship,
  usePauseSponsorship,
  useResumeSponsorship,
  useEndSponsorship,
  useExtendSponsorship,
  useSponsorPlacements,
  useSeedPlacements,
  useCreatePlacement,
  useUpdatePlacement,
  useDeletePlacement,
  useWaitlistCount,
} from "@/hooks/useConvexData";
import { useAuth } from "@/contexts/AuthContext";
import {
  Megaphone,
  DollarSign,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Square,
  Plus,
  Eye,
  Clock,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending_review: "bg-amber-100 text-amber-700",
  pending_payment: "bg-orange-100 text-orange-700",
  paid: "bg-blue-100 text-blue-700",
  paused: "bg-zinc-100 text-zinc-600",
  expired: "bg-red-100 text-red-600",
  cancelled: "bg-zinc-100 text-muted-foreground",
  rejected: "bg-red-100 text-red-600",
  approved: "bg-emerald-100 text-emerald-700",
};

export default function AdminSponsorships() {
  const { user } = useAuth();
  const { data, isLoading } = useAdminSponsorships();
  const { data: placements = [] } = useSponsorPlacements();
  const approveMutation = useApproveSponsorship();
  const rejectMutation = useRejectSponsorship();
  const pauseMutation = usePauseSponsorship();
  const resumeMutation = useResumeSponsorship();
  const seedPlacements = useSeedPlacements();
  const createPlacement = useCreatePlacement();
  const updatePlacement = useUpdatePlacement();
  const deletePlacement = useDeletePlacement();
  const waitlistCount = useWaitlistCount();
  const endSponsorship = useEndSponsorship();
  const extendSponsorship = useExtendSponsorship();

  // Placement form state
  const [showCreatePlacement, setShowCreatePlacement] = useState(false);
  const [newPlacement, setNewPlacement] = useState({ slug: "", name: "", description: "", position: "left_rail", price: 29900, durationDays: 30, maxSlots: 5 });
  const [editingPlacement, setEditingPlacement] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  const handleCreatePlacement = async () => {
    if (!newPlacement.slug.trim() || !newPlacement.name.trim()) { toast.error("Slug and name are required"); return; }
    if (newPlacement.price <= 0) { toast.error("Price must be positive"); return; }
    try {
      await createPlacement.mutateAsync(newPlacement);
      toast.success("Placement created!");
      setShowCreatePlacement(false);
      setNewPlacement({ slug: "", name: "", description: "", position: "left_rail", price: 29900, durationDays: 30, maxSlots: 5 });
    } catch (err: any) {
      toast.error(err.message || "Failed to create placement");
    }
  };

  const handleUpdatePlacement = async (placementId: string) => {
    try {
      await updatePlacement.mutateAsync({ placementId, ...editValues });
      toast.success("Placement updated!");
      setEditingPlacement(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update placement");
    }
  };

  const handleDeletePlacement = async (placementId: string) => {
    if (!confirm("Delete this placement? Only possible if no active sponsorships exist.")) return;
    try {
      await deletePlacement.mutateAsync({ placementId });
      toast.success("Placement deleted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete placement");
    }
  };

  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [previewSponsorship, setPreviewSponsorship] = useState<any>(null);

  const getPlacementName = (placementId: string) => {
    const p = placements.find((pl: any) => pl._id === placementId);
    return p?.name || "Placement";
  };

  const handleApprove = (sponsorshipId: string) => {
    if (!user) return;
    approveMutation.mutate(
      { sponsorshipId, userId: user.id },
      { onSuccess: () => toast.success("Sponsorship approved!"), onError: () => toast.error("Failed to approve") }
    );
  };

  const handleReject = (sponsorshipId: string) => {
    if (!user || !rejectReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    rejectMutation.mutate(
      { sponsorshipId, userId: user.id, reason: rejectReason },
      { onSuccess: () => { toast.success("Sponsorship rejected"); setRejectingId(null); setRejectReason(""); }, onError: () => toast.error("Failed to reject") }
    );
  };

  const handlePause = (sponsorshipId: string) => {
    if (!user) return;
    pauseMutation.mutate(
      { sponsorshipId, userId: user.id },
      { onSuccess: () => toast.success("Sponsorship paused"), onError: () => toast.error("Failed to pause") }
    );
  };

  const handleResume = (sponsorshipId: string) => {
    if (!user) return;
    resumeMutation.mutate(
      { sponsorshipId, userId: user.id },
      { onSuccess: () => toast.success("Sponsorship resumed"), onError: () => toast.error("Failed to resume") }
    );
  };

  const [extendDays, setExtendDays] = useState(30);
  const [extendingId, setExtendingId] = useState<string | null>(null);

  const handleEnd = (sponsorshipId: string) => {
    if (!user) return;
    if (!confirm("End this sponsorship immediately?")) return;
    endSponsorship.mutate(
      { sponsorshipId, userId: user.id },
      { onSuccess: () => toast.success("Sponsorship ended"), onError: (err: any) => toast.error(err.message || "Failed to end") }
    );
  };

  const handleExtend = (sponsorshipId: string) => {
    if (!user) return;
    extendSponsorship.mutate(
      { sponsorshipId, userId: user.id, additionalDays: extendDays },
      { onSuccess: () => { toast.success(`Extended by ${extendDays} days`); setExtendingId(null); }, onError: (err: any) => toast.error(err.message || "Failed to extend") }
    );
  };

  const handleSeedPlacements = () => {
    seedPlacements.mutate(
      {},
      { onSuccess: () => toast.success("Default placements created!"), onError: () => toast.error("Failed to seed placements") }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Sponsorship Management
          </h1>
          <Button variant="outline" size="sm" className="rounded-full" onClick={handleSeedPlacements} disabled={placements.length >= 2}>
            Seed Placements
          </Button>
        </div>
      </Reveal>

      {/* Stats */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <DollarSign className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" />
              <p className="text-xl font-bold text-foreground">${stats?.totalRevenue || 0}</p>
              <p className="text-[10px] text-muted-foreground">Revenue (Month)</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <Megaphone className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-xl font-bold text-foreground">{stats?.activeCount || 0}</p>
              <p className="text-[10px] text-muted-foreground">Active Sponsors</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <Clock className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-xl font-bold text-foreground">{stats?.pendingCount || 0}</p>
              <p className="text-[10px] text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xl font-bold text-foreground">{stats?.renewalsThisMonth || 0}</p>
              <p className="text-[10px] text-muted-foreground">Renewals (Month)</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <AlertTriangle className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-xl font-bold text-foreground">{stats?.expiredCount || 0}</p>
              <p className="text-[10px] text-muted-foreground">Expired</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <Users className="w-5 h-5 text-muted-foreground mb-2" />
              <p className="text-xl font-bold text-foreground">
                {(stats?.activeCount || 0) + (stats?.pendingCount || 0) + (stats?.expiredCount || 0) + (stats?.rejectedCount || 0) + (stats?.cancelledCount || 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>
      </Reveal>

      {/* Placements overview */}
      <Reveal delay={0.08}>
        <div className="mb-8">
          <h2 className="font-bold text-foreground text-sm mb-3">Available Placements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {placements.map((p: any) => (
              <Card key={p._id} className="border-border/40 rounded-xl">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">${(p.price / 100).toFixed(0)} / {p.durationDays} days · {p.maxSlots} slots</p>
                  </div>
                  <Badge className={p.active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}>
                    {p.active ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Placement Management */}
      <Reveal delay={0.09}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground text-sm">Manage Placements</h2>
            <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setShowCreatePlacement(!showCreatePlacement)}>
              {showCreatePlacement ? "Cancel" : "+ New Placement"}
            </Button>
          </div>

          {/* Waitlist info */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/40 mb-4">
            <p className="text-xs text-muted-foreground">Waitlist signups: <span className="font-bold text-foreground">{waitlistCount}</span></p>
          </div>

          {/* Create placement form */}
          {showCreatePlacement && (
            <Card className="border-border/40 rounded-xl mb-4">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm">New Placement</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Slug</label>
                    <Input value={newPlacement.slug} onChange={(e) => setNewPlacement({ ...newPlacement, slug: e.target.value })} placeholder="app_left_rail" className="rounded-xl text-xs h-8 mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Name</label>
                    <Input value={newPlacement.name} onChange={(e) => setNewPlacement({ ...newPlacement, name: e.target.value })} placeholder="Left Rail" className="rounded-xl text-xs h-8 mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Description</label>
                  <Input value={newPlacement.description} onChange={(e) => setNewPlacement({ ...newPlacement, description: e.target.value })} placeholder="Premium left sidebar" className="rounded-xl text-xs h-8 mt-1" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Price (cents)</label>
                    <Input type="number" value={newPlacement.price} onChange={(e) => setNewPlacement({ ...newPlacement, price: parseInt(e.target.value) || 0 })} className="rounded-xl text-xs h-8 mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Days</label>
                    <Input type="number" value={newPlacement.durationDays} onChange={(e) => setNewPlacement({ ...newPlacement, durationDays: parseInt(e.target.value) || 30 })} className="rounded-xl text-xs h-8 mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Max Slots</label>
                    <Input type="number" value={newPlacement.maxSlots} onChange={(e) => setNewPlacement({ ...newPlacement, maxSlots: parseInt(e.target.value) || 5 })} className="rounded-xl text-xs h-8 mt-1" />
                  </div>
                </div>
                <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white rounded-full text-xs" onClick={handleCreatePlacement} disabled={createPlacement.isPending}>
                  Create Placement
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Placement list with edit/delete */}
          <div className="space-y-2">
            {placements.map((p: any) => (
              <Card key={p._id} className="border-border/40 rounded-xl">
                <CardContent className="p-3">
                  {editingPlacement === p._id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={editValues.name ?? p.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} className="rounded-xl text-xs h-8" />
                        <Input type="number" value={editValues.price ?? p.price} onChange={(e) => setEditValues({ ...editValues, price: parseInt(e.target.value) || 0 })} className="rounded-xl text-xs h-8" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" value={editValues.durationDays ?? p.durationDays} onChange={(e) => setEditValues({ ...editValues, durationDays: parseInt(e.target.value) || 30 })} className="rounded-xl text-xs h-8" />
                        <Input type="number" value={editValues.maxSlots ?? p.maxSlots} onChange={(e) => setEditValues({ ...editValues, maxSlots: parseInt(e.target.value) || 5 })} className="rounded-xl text-xs h-8" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-full text-xs" onClick={() => handleUpdatePlacement(p._id)}>Save</Button>
                        <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => { setEditingPlacement(null); setEditValues({}); }}>Cancel</Button>
                        <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => updatePlacement.mutate({ placementId: p._id, active: !p.active }, { onSuccess: () => toast.success(p.active ? "Deactivated" : "Activated") })}>
                          {p.active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{p.name} <span className="text-muted-foreground font-normal">({p.slug})</span></p>
                        <p className="text-[10px] text-muted-foreground">${(p.price / 100).toFixed(0)} / {p.durationDays}d · {p.maxSlots} slots · {p.active ? "Active" : "Inactive"}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="rounded-full text-xs h-7" onClick={() => { setEditingPlacement(p._id); setEditValues({}); }}>Edit</Button>
                        <Button size="sm" variant="ghost" className="rounded-full text-xs h-7 text-destructive" onClick={() => handleDeletePlacement(p._id)}>Delete</Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Pending Review */}
      {data?.pending && data.pending.length > 0 && (
        <Reveal delay={0.1}>
          <h2 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Pending Approval ({data.pending.length})
          </h2>
          <div className="space-y-3 mb-8">
            {data.pending.map((s: any) => (
              <Card key={s._id} className="border-amber-200 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {s.logoUrl && (
                        <img src={s.logoUrl} alt={s.companyName} className="w-10 h-10 rounded-lg object-cover border border-border/30" />
                      )}
                      <div>
                        <p className="font-bold text-foreground text-sm">{s.companyName}</p>
                        <p className="text-xs text-muted-foreground">{getPlacementName(s.placementId)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">${(s.price / 100).toFixed(0)} / 30 days</p>
                        {s.headline && <p className="text-xs text-foreground mt-1">{s.headline}</p>}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                        {s.websiteUrl && (
                          <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[hsl(155,45%,32%)] hover:underline mt-1 inline-flex items-center gap-1">
                            {s.websiteUrl} <Eye className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${STATUS_COLORS[s.status] || ""}`}>{s.status.replace("_", " ")}</Badge>
                  </div>

                  {/* Preview */}
                  <div className="mt-4 max-w-xs">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Ad Preview</p>
                    <SponsorCard sponsorship={s} variant="compact" />
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs"
                      onClick={() => handleApprove(s._id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                    </Button>

                    {rejectingId === s._id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Rejection reason..."
                          className="rounded-xl text-xs h-8"
                        />
                        <Button size="sm" variant="destructive" className="rounded-full text-xs" onClick={() => handleReject(s._id)}>
                          Confirm
                        </Button>
                        <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => { setRejectingId(null); setRejectReason(""); }}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs text-destructive border-destructive/30"
                        onClick={() => setRejectingId(s._id)}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Reveal>
      )}

      {/* Active Sponsorships */}
      {data?.active && data.active.length > 0 && (
        <Reveal delay={0.15}>
          <h2 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Active ({data.active.length})
          </h2>
          <div className="space-y-3 mb-8">
            {data.active.map((s: any) => (
              <Card key={s._id} className="border-border/40 rounded-xl">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {s.logoUrl && (
                      <img src={s.logoUrl} alt={s.companyName} className="w-8 h-8 rounded-lg object-cover border border-border/30" />
                    )}                      <div>
                        <p className="font-semibold text-foreground text-sm">{s.companyName}</p>
                        <p className="text-xs text-muted-foreground">{getPlacementName(s.placementId)}{s.category ? ` · ${s.category}` : ""}</p>
                        {s.startsAt && s.endsAt && (
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(s.startsAt).toLocaleDateString()} → {new Date(s.endsAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700">Active</Badge>
                    <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => handlePause(s._id)} disabled={pauseMutation.isPending}>
                      <Pause className="w-3 h-3 mr-1" /> Pause
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setExtendingId(extendingId === s._id ? null : s._id)}>
                      <Plus className="w-3 h-3 mr-1" /> Extend
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive border-destructive/30" onClick={() => handleEnd(s._id)} disabled={endSponsorship.isPending}>
                      <Square className="w-3 h-3 mr-1" /> End
                    </Button>
                  </div>
                  {/* Extend form */}
                  {extendingId === s._id && (
                    <div className="flex items-center gap-2 mt-2 ml-auto w-full max-w-xs">
                      <Input type="number" value={extendDays} onChange={(e) => setExtendDays(parseInt(e.target.value) || 30)} className="rounded-xl text-xs h-8 w-20" min={1} max={365} />
                      <span className="text-[10px] text-muted-foreground">days</span>
                      <Button size="sm" className="rounded-full text-xs" onClick={() => handleExtend(s._id)} disabled={extendSponsorship.isPending}>Confirm</Button>
                      <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => setExtendingId(null)}>Cancel</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </Reveal>
      )}

      {/* Paused */}
      {data?.sponsorships?.filter((s: any) => s.status === "paused").length > 0 && (
        <Reveal delay={0.18}>
          <h2 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
            <Pause className="w-4 h-4 text-zinc-500" /> Paused
          </h2>
          <div className="space-y-3 mb-8">
            {data.sponsorships.filter((s: any) => s.status === "paused").map((s: any) => (
              <Card key={s._id} className="border-border/40 rounded-xl">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{s.companyName}</p>
                      <p className="text-xs text-muted-foreground">{getPlacementName(s.placementId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="text-[10px] bg-zinc-100 text-zinc-600">Paused</Badge>
                    <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => handleResume(s._id)}>
                      <Play className="w-3 h-3 mr-1" /> Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Reveal>
      )}

      {/* Rejected */}
      {data?.rejected && data.rejected.length > 0 && (
        <Reveal delay={0.2}>
          <h2 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" /> Rejected ({data.rejected.length})
          </h2>
          <div className="space-y-3 mb-8">
            {data.rejected.map((s: any) => (
              <Card key={s._id} className="border-border/40 rounded-xl opacity-70">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{s.companyName}</p>
                    <p className="text-xs text-muted-foreground">{s.rejectionReason || "No reason provided"}</p>
                  </div>
                  <Badge className="text-[10px] bg-red-100 text-red-600">Rejected</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </Reveal>
      )}

      {/* Empty state */}
      {(!data?.sponsorships || data.sponsorships.length === 0) && (
        <Reveal delay={0.1}>
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-12 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-bold text-foreground text-lg mb-2">No sponsorships yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Sponsorships will appear here once businesses start purchasing placements.
              </p>
            </CardContent>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
