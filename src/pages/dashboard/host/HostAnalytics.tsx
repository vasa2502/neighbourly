import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { BarChart3, Calendar } from "lucide-react";
import { useHostStats } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

export default function HostAnalytics() {
  const { communityId } = useCommunity();
  const { data: hostStats } = useHostStats(communityId || "");
  const activities = hostStats?.activities || [];
  const totalCreated = hostStats?.totalCreated || 0;
  const totalParticipants = hostStats?.totalParticipants || 0;
  const avgParticipants = totalCreated > 0 ? Math.round(totalParticipants / totalCreated) : 0;

  const stats = [
    { label: "Activities Created", value: totalCreated, change: "All time" },
    { label: "Total Participants", value: totalParticipants, change: "Across all activities" },
    { label: "Avg Participants", value: avgParticipants, change: "Per activity" },
    { label: "Upcoming", value: hostStats?.upcoming?.length || 0, change: "Scheduled" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6 flex items-center gap-3"><BarChart3 className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Host Analytics</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {stats.map(s => (
            <Card key={s.label} className="border-border/40 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-[hsl(155,50%,38%)] mt-0.5">{s.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="font-semibold text-foreground mb-3">Activity Performance</h2>
        <div className="space-y-3">
          {activities.length === 0 && <p className="text-muted-foreground text-sm">No activities to show analytics for.</p>}
          {activities.map((a: any) => (
            <Card key={a.id} className="border-border/40 shadow-sm rounded-xl">
              <CardContent className="p-4 flex items-center gap-4">
                <Calendar className="w-5 h-5 text-[hsl(155,45%,32%)] shrink-0" />
                <div className="flex-1"><p className="text-sm font-semibold text-foreground">{a.title}</p><p className="text-xs text-muted-foreground">{a.current_participants || 0} participants · {a.date ? new Date(a.date).toLocaleDateString() : ""}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
