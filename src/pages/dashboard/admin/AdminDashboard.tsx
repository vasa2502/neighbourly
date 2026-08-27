import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Users, Shield, Calendar, MessageCircle, BarChart3, Megaphone, AlertTriangle, ArrowRight, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";

export default function AdminDashboard() {
  const { communityId } = useCommunity();

  const { data: members, isLoading } = useQuery({
    queryKey: ["admin-members", communityId],
    queryFn: async () => {
      if (!communityId) return { total: 0, verified: 0, pending: 0 };
      const { data: all } = await supabase.from("community_memberships" as any).select("id, verification_status").eq("community_id", communityId);
      const total = all?.length || 0;
      const verified = all?.filter((m: any) => m.verification_status === "approved").length || 0;
      const pending = all?.filter((m: any) => m.verification_status === "pending").length || 0;
      return { total, verified, pending };
    },
    enabled: !!communityId,
  });

  const { data: counts } = useQuery({
    queryKey: ["admin-counts", communityId],
    queryFn: async () => {
      if (!communityId) return { activities: 0, clubs: 0, posts: 0 };
      const [a, c, p] = await Promise.all([
        supabase.from("activities" as any).select("id", { count: "exact", head: true }).eq("community_id", communityId),
        supabase.from("clubs" as any).select("id", { count: "exact", head: true }).eq("community_id", communityId),
        supabase.from("posts" as any).select("id", { count: "exact", head: true }).eq("community_id", communityId),
      ]);
      return { activities: a.count || 0, clubs: c.count || 0, posts: p.count || 0 };
    },
    enabled: !!communityId,
  });

  const stats = [
    { label: "Total Residents", value: members?.total?.toString() || "0", icon: Users, color: "text-[hsl(155,45%,32%)]" },
    { label: "Verified", value: members?.verified?.toString() || "0", icon: Shield, color: "text-[hsl(155,50%,38%)]" },
    { label: "Pending Verification", value: members?.pending?.toString() || "0", icon: Clock, color: "text-[hsl(38,65%,42%)]" },
    { label: "Activities", value: counts?.activities?.toString() || "0", icon: Calendar, color: "text-[hsl(340,45%,45%)]" },
    { label: "Clubs", value: counts?.clubs?.toString() || "0", icon: Users, color: "text-[hsl(280,50%,42%)]" },
    { label: "Posts", value: counts?.posts?.toString() || "0", icon: MessageCircle, color: "text-[hsl(170,50%,38%)]" },
  ];

  const quickActions = [
    { icon: Shield, label: "Verify Residents", to: "/dashboard/admin/verification", count: members?.pending || 0 },
    { icon: Megaphone, label: "Publish Announcement", to: "/dashboard/community/announcements" },
    { icon: AlertTriangle, label: "Review Reports", to: "/dashboard/admin/moderation" },
    { icon: Users, label: "Manage Residents", to: "/dashboard/admin/residents" },
    { icon: BarChart3, label: "Community Analytics", to: "/dashboard/admin/analytics" },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Admin Dashboard</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border/40 shadow-sm rounded-xl">
                <CardContent className="p-4"><Icon className={`w-5 h-5 ${s.color} mb-2`} /><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-[11px] text-muted-foreground">{s.label}</p></CardContent>
              </Card>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="space-y-2 mb-8">
          {quickActions.map(a => {
            const Icon = a.icon;
            return (
              <Link key={a.label} to={a.to} className="flex items-center gap-3 p-4 bg-card border border-border/40 rounded-xl hover:shadow-md transition-all">
                <Icon className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                <span className="text-sm font-medium text-foreground flex-1">{a.label}</span>
                {a.count ? <span className="text-xs font-semibold text-[hsl(155,45%,32%)] bg-[hsl(155,45%,92%)] px-2 py-0.5 rounded-full">{a.count}</span> : null}
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
