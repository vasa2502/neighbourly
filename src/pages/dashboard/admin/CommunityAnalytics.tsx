import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Users, Calendar, TrendingUp, BarChart3, Activity, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";

export default function CommunityAnalytics() {
  const { communityId } = useCommunity();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-analytics", communityId],
    queryFn: async () => {
      if (!communityId) return null;
      const [membersRes, activitiesRes, clubsRes, postsRes] = await Promise.all([
        supabase.from("community_memberships" as any).select("id, verification_status, joined_at").eq("community_id", communityId),
        supabase.from("activities" as any).select("id, status").eq("community_id", communityId),
        supabase.from("clubs" as any).select("id, status").eq("community_id", communityId).eq("status", "active"),
        supabase.from("posts" as any).select("id, status").eq("community_id", communityId),
      ]);

      const allMembers = membersRes.data || [];
      const verified = allMembers.filter((m: any) => m.verification_status === "approved").length;
      const pending = allMembers.filter((m: any) => m.verification_status === "pending").length;
      const allActivities = activitiesRes.data || [];
      const activeActivities = allActivities.filter((a: any) => a.status === "active").length;
      const allClubs = clubsRes.data || [];
      const allPosts = postsRes.data || [];

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      const weekActive = allMembers.filter((m: any) => m.joined_at && new Date(m.joined_at) >= weekAgo).length;
      const monthActive = allMembers.filter((m: any) => m.joined_at && new Date(m.joined_at) >= monthAgo).length;

      const total = allMembers.length;
      const participationRate = total > 0 ? Math.round((verified / total) * 100) : 0;

      return [
        { label: "Total Residents", value: total.toString(), icon: Users, color: "text-[hsl(155,45%,32%)]" },
        { label: "Verified Residents", value: verified.toString(), icon: Users, color: "text-[hsl(155,50%,38%)]" },
        { label: "Pending Verification", value: pending.toString(), icon: TrendingUp, color: "text-[hsl(38,65%,42%)]" },
        { label: "Weekly Active", value: weekActive.toString(), icon: TrendingUp, color: "text-[hsl(210,55%,42%)]" },
        { label: "Total Activities", value: allActivities.length.toString(), icon: Calendar, color: "text-[hsl(38,65%,42%)]" },
        { label: "Active Activities", value: activeActivities.toString(), icon: Activity, color: "text-[hsl(170,50%,38%)]" },
        { label: "Active Clubs", value: allClubs.length.toString(), icon: Activity, color: "text-[hsl(170,50%,38%)]" },
        { label: "Community Posts", value: allPosts.length.toString(), icon: BarChart3, color: "text-[hsl(340,45%,45%)]" },
        { label: "Verification Rate", value: `${participationRate}%`, icon: CheckCircle2, color: "text-[hsl(155,50%,38%)]" },
      ];
    },
    enabled: !!communityId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayStats = stats || [
    { label: "Total Residents", value: "0", icon: Users, color: "text-[hsl(155,45%,32%)]" },
    { label: "Verified Residents", value: "0", icon: Users, color: "text-[hsl(155,50%,38%)]" },
    { label: "Total Activities", value: "0", icon: Calendar, color: "text-[hsl(38,65%,42%)]" },
    { label: "Active Clubs", value: "0", icon: Activity, color: "text-[hsl(170,50%,38%)]" },
    { label: "Community Posts", value: "0", icon: BarChart3, color: "text-[hsl(340,45%,45%)]" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Community Analytics
        </h1>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {displayStats.map((s: any) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border/40 shadow-sm rounded-xl">
                <CardContent className="p-4">
                  <Icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
