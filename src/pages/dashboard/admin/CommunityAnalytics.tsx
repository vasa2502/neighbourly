import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { BarChart3, Users, Calendar, MessageCircle, TrendingUp } from "lucide-react";
import { useCommunity } from "@/contexts/CommunityContext";
import { useCommunityMembers } from "@/hooks/useCommunityData";
import { useActivities, useClubs, usePosts } from "@/hooks/useActivityClubPostData";

export default function CommunityAnalytics() {
  const { communityId } = useCommunity();
  const { data: members = [] } = useCommunityMembers(communityId || "");
  const { data: activities = [] } = useActivities(communityId || "");
  const { data: clubs = [] } = useClubs(communityId || "");
  const { data: posts = [] } = usePosts(communityId || "");

  const verifiedCount = (members as any[]).filter((m: any) => m.verified).length;
  const activeActivities = (activities as any[]).filter((a: any) => a.status === "active").length;
  const activeClubs = (clubs as any[]).filter((c: any) => c.status === "active").length;
  const activePosts = (posts as any[]).filter((p: any) => p.status === "active").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Community Analytics
        </h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Users className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{(members as any[]).length}</p><p className="text-[10px] text-muted-foreground">Total Members</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><BarChart3 className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{verifiedCount}</p><p className="text-[10px] text-muted-foreground">Verified</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Calendar className="w-5 h-5 text-[hsl(210,55%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{activeActivities}</p><p className="text-[10px] text-muted-foreground">Active Activities</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><MessageCircle className="w-5 h-5 text-[hsl(340,45%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{activePosts}</p><p className="text-[10px] text-muted-foreground">Active Posts</p></CardContent></Card>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="font-semibold text-foreground mb-3 text-sm">Engagement Overview</h2>
        <Card className="border-border/40 shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Verification Rate</span><span className="font-medium text-foreground">{(members as any[]).length > 0 ? Math.round((verifiedCount / (members as any[]).length) * 100) : 0}%</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Clubs</span><span className="font-medium text-foreground">{activeClubs}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Activities</span><span className="font-medium text-foreground">{activeActivities}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Posts</span><span className="font-medium text-foreground">{activePosts}</span></div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
