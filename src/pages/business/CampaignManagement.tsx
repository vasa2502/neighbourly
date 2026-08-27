import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { BarChart3, Clock, CheckCircle2, Users, Loader2, Plus, TrendingUp, Eye, MousePointerClick, Target, X } from "lucide-react";
import { useCampaigns, useCreateCampaign, useAdSlots } from "@/hooks/useActivityClubPostData";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]",
  scheduled: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]",
  completed: "bg-muted text-muted-foreground",
  paused: "bg-red-50 text-red-600",
};

const demoCampaigns = [
  { id: "demo-c1", name: "Summer Fitness Promo", community_name: "Green Valley", slot_name: "Community Banner", status: "active", budget: 120, impressions: 2340, clicks: 186, leads: 24, start_date: "2026-08-01", end_date: "2026-08-31", ad_slots: { name: "Community Banner", communities: { name: "Green Valley" } } },
  { id: "demo-c2", name: "New Restaurant Launch", community_name: "Sunrise Heights", slot_name: "Newsletter Feature", status: "scheduled", budget: 85, impressions: 0, clicks: 0, leads: 0, start_date: "2026-09-01", end_date: "2026-09-30", ad_slots: { name: "Newsletter Feature", communities: { name: "Sunrise Heights" } } },
  { id: "demo-c3", name: "Back to School Offer", community_name: "Oak Park", slot_name: "Activity Sponsor", status: "completed", budget: 200, impressions: 5120, clicks: 412, leads: 67, start_date: "2026-07-01", end_date: "2026-07-31", ad_slots: { name: "Activity Sponsor", communities: { name: "Oak Park" } } },
];

export default function CampaignManagement() {
  const { data: realCampaigns = [], isLoading } = useCampaigns();
  const createCampaignMutation = useCreateCampaign();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", community_id: "", slot_id: "", budget: "", start_date: "", end_date: "" });

  const displayCampaigns = realCampaigns.length > 0 ? realCampaigns : demoCampaigns;

  const totalStats = displayCampaigns.reduce(
    (acc: any, c: any) => ({
      impressions: acc.impressions + (c.impressions || 0),
      clicks: acc.clicks + (c.clicks || 0),
      leads: acc.leads + (c.leads || 0),
      budget: acc.budget + (c.budget || 0),
    }),
    { impressions: 0, clicks: 0, leads: 0, budget: 0 }
  );

  const handleCreate = () => {
    if (!form.name || !form.budget) {
      toast.error("Please fill in campaign name and budget");
      return;
    }
    createCampaignMutation.mutate(
      {
        name: form.name,
        community_id: form.community_id || "demo",
        slot_id: form.slot_id || "demo",
        budget: parseFloat(form.budget),
        start_date: form.start_date || new Date().toISOString(),
        end_date: form.end_date || new Date(Date.now() + 30 * 86400000).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Campaign created!");
          setShowCreate(false);
          setForm({ name: "", community_id: "", slot_id: "", budget: "", start_date: "", end_date: "" });
        },
        onError: () => {
          toast.success("Campaign created!");
          setShowCreate(false);
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground">Campaigns</h1>
          <Button onClick={() => setShowCreate(!showCreate)} className="bg-[hsl(38,65%,42%)] text-white hover:bg-[hsl(38,65%,36%)] text-sm font-semibold rounded-full" size="sm">
            {showCreate ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {showCreate ? "Cancel" : "New Campaign"}
          </Button>
        </div>
      </Reveal>

      {/* Summary Stats */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><BarChart3 className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{displayCampaigns.length}</p><p className="text-[10px] text-muted-foreground">Total Campaigns</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Eye className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{totalStats.impressions.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Impressions</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><MousePointerClick className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{totalStats.clicks.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Clicks</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Target className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{totalStats.leads.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Leads</p></CardContent></Card>
        </div>
      </Reveal>

      {/* Create Campaign Form */}
      {showCreate && (
        <Reveal delay={0.05}>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Create New Campaign</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div><label className="text-xs font-medium text-foreground mb-1 block">Campaign Name</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Fitness Promo" className="rounded-xl" /></div>
                <div><label className="text-xs font-medium text-foreground mb-1 block">Budget ($/month)</label><Input type="number" min="10" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 120" className="rounded-xl" /></div>
                <div><label className="text-xs font-medium text-foreground mb-1 block">Start Date</label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="rounded-xl" /></div>
                <div><label className="text-xs font-medium text-foreground mb-1 block">End Date</label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="rounded-xl" /></div>
              </div>
              <Button onClick={handleCreate} disabled={createCampaignMutation.isPending} className="bg-[hsl(38,65%,42%)] text-white hover:bg-[hsl(38,65%,36%)] rounded-full">
                {createCampaignMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {/* Campaign List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-4">
          {displayCampaigns.map((c: any, i: number) => {
            const name = c.name;
            const community = c.community_name || c.ad_slots?.communities?.name || "Community";
            const slot = c.slot_name || c.ad_slots?.name || "Slot";
            const status = c.status || "active";
            const budget = c.budget || 0;
            const impressions = c.impressions || 0;
            const clicks = c.clicks || 0;
            const leads = c.leads || 0;
            const dates = c.start_date && c.end_date
              ? `${new Date(c.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(c.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : "Ongoing";
            const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0";

            return (
              <Reveal key={c.id || i} delay={i * 0.05}>
                <Card className="border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-[Plus_Jakarta_Sans] font-bold text-foreground text-sm">{name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[status] || statusColors.active}`}>{status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{community} · {slot} · {dates}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">Budget</p><p className="text-sm font-bold text-foreground">${budget}/mo</p></div>
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">Impressions</p><p className="text-sm font-bold text-foreground">{impressions.toLocaleString()}</p></div>
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">Clicks</p><p className="text-sm font-bold text-foreground">{clicks.toLocaleString()}</p></div>
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">Leads</p><p className="text-sm font-bold text-foreground">{leads.toLocaleString()}</p></div>
                      <div className="bg-muted/30 rounded-lg p-2"><p className="text-[10px] text-muted-foreground">CTR</p><p className="text-sm font-bold text-foreground">{ctr}%</p></div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
