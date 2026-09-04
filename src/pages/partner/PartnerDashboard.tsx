import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { Building2, Tag, MessageCircle, Eye, Loader2, TrendingUp, Users, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePartnerStats } from "@/hooks/useActivityClubPostData";


export default function PartnerDashboard() {
  const { data: stats, isLoading } = usePartnerStats();
  const display: any = stats || { totalSlots: 0, activeSlots: 0, totalCampaigns: 0, activeCampaigns: 0, totalImpressions: 0, totalClicks: 0, totalRevenue: 0, communityCount: 0, totalLeads: 0, totalBudget: 0, campaigns: [] };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground">Partner Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full" asChild><Link to="/dashboard/marketplace">Ad Marketplace</Link></Button>
            <Button size="sm" className="bg-[hsl(38,65%,42%)] text-white hover:bg-[hsl(38,65%,36%)] rounded-full" asChild><Link to="/dashboard/campaigns">Campaigns <ArrowRight className="w-3 h-3 ml-1" /></Link></Button>
          </div>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Stats Cards */}
          <Reveal delay={0.05}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Building2 className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{display.communityCount}</p><p className="text-[10px] text-muted-foreground">Communities</p></CardContent></Card>
              <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Eye className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{display.totalImpressions.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Impressions</p></CardContent></Card>
              <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Tag className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{display.totalCampaigns}</p><p className="text-[10px] text-muted-foreground">Campaigns</p></CardContent></Card>
              <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><MessageCircle className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{display.totalLeads}</p><p className="text-[10px] text-muted-foreground">Leads</p></CardContent></Card>
            </div>
          </Reveal>

          {/* Performance Overview */}
          <Reveal delay={0.1}>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-8">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[hsl(155,45%,32%)]" /> Performance Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div><p className="text-[10px] text-muted-foreground mb-1">Total Clicks</p><p className="text-lg font-bold text-foreground">{display.totalClicks.toLocaleString()}</p></div>
                  <div><p className="text-[10px] text-muted-foreground mb-1">Avg CTR</p><p className="text-lg font-bold text-foreground">{display.totalImpressions > 0 ? ((display.totalClicks / display.totalImpressions) * 100).toFixed(1) : 0}%</p></div>
                  <div><p className="text-[10px] text-muted-foreground mb-1">Active Campaigns</p><p className="text-lg font-bold text-foreground">{display.activeCampaigns}</p></div>
                  <div><p className="text-[10px] text-muted-foreground mb-1">Total Spend</p><p className="text-lg font-bold text-foreground">${display.totalBudget.toLocaleString()}</p></div>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* Active Campaigns */}
          <Reveal delay={0.15}>
            <h2 className="font-semibold text-foreground mb-3">Your Campaigns</h2>
            <div className="space-y-3">
              {display.campaigns.map((c: any) => {
                const statusColor = c.status === "active" ? "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]" : c.status === "scheduled" ? "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]" : "bg-muted text-muted-foreground";
                return (
                  <Card key={c._id} className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                        <BarChart3 className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.community_name || c.communities?.name || "Community"} · ${c.budget}/mo · {c.impressions?.toLocaleString() || 0} impressions · {c.clicks?.toLocaleString() || 0} clicks</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor}`}>{c.status}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
