import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Users, Calendar, MessageCircle, BarChart3, Shield, Loader2 } from "lucide-react";
import { useCommunity } from "@/contexts/CommunityContext";
import { useCommunityMembers } from "@/hooks/useCommunityData";
import { useActivities, useClubs, usePosts } from "@/hooks/useActivityClubPostData";

export default function AdminDashboard() {
  const { communityId } = useCommunity();
  const { data: members = [], isLoading: membersLoading } = useCommunityMembers(communityId || "");
  const { data: activities = [] } = useActivities(communityId || "");
  const { data: clubs = [] } = useClubs(communityId || "");
  const { data: posts = [] } = usePosts(communityId || "");

  const verifiedMembers = (members as any[]).filter((m: any) => m.verified).length;
  const pendingMembers = (members as any[]).filter((m: any) => m.role === "resident" && !m.verified).length;

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Admin Dashboard
        </h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Users className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{(members as any[]).length}</p><p className="text-[10px] text-muted-foreground">Total Members</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Calendar className="w-5 h-5 text-[hsl(38,65%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{(activities as any[]).length}</p><p className="text-[10px] text-muted-foreground">Activities</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><MessageCircle className="w-5 h-5 text-[hsl(210,55%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{(posts as any[]).length}</p><p className="text-[10px] text-muted-foreground">Posts</p></CardContent></Card>
          <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><BarChart3 className="w-5 h-5 text-[hsl(340,45%,42%)] mb-2" /><p className="text-xl font-bold text-foreground">{verifiedMembers}</p><p className="text-[10px] text-muted-foreground">Verified</p></CardContent></Card>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="font-semibold text-foreground mb-3 text-sm">Quick Stats</h2>
        <Card className="border-border/40 shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Verified Members</span><span className="font-medium text-foreground">{verifiedMembers}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pending Verification</span><span className="font-medium text-foreground">{pendingMembers}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Clubs</span><span className="font-medium text-foreground">{(clubs as any[]).length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Activities</span><span className="font-medium text-foreground">{(activities as any[]).filter((a: any) => a.status === "active").length}</span></div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
