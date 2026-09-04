import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { Calendar, Users, BarChart3, Clock, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useHostStats } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

export default function HostDashboard() {
  const { communityId } = useCommunity();
  const { data: hostStats } = useHostStats(communityId || "");
  const totalCreated = hostStats?.totalCreated || 0;
  const totalParticipants = hostStats?.totalParticipants || 0;
  const upcoming = hostStats?.upcoming || [];

  const stats = [
    { label: "Activities Created", value: totalCreated, icon: Calendar },
    { label: "Total Participants", value: totalParticipants, icon: Users },
    { label: "Upcoming", value: upcoming.length, icon: Clock },
    { label: "Avg Rating", value: "—", icon: BarChart3 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground">Host Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your activities and clubs</p>
          </div>
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild>
            <Link to="/dashboard/activities/create"><Plus className="w-4 h-4 mr-1.5" /> New Activity</Link>
          </Button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border/40 shadow-sm rounded-xl">
                <CardContent className="p-4"><Icon className="w-5 h-5 text-[hsl(155,45%,32%)] mb-2" /><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-[11px] text-muted-foreground">{s.label}</p></CardContent>
              </Card>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mb-8">
          <h2 className="font-semibold text-foreground mb-3">Upcoming Activities</h2>
          <div className="space-y-3">
            {upcoming.length === 0 && <p className="text-muted-foreground text-sm">No upcoming activities. Create one to get started!</p>}
            {upcoming.map((a: any) => (
              <Link key={a._id} to={`/dashboard/activities/${a._id}`}>
                <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div><p className="font-semibold text-sm text-foreground">{a.title}</p><p className="text-xs text-muted-foreground">{a.date ? new Date(a.date).toLocaleDateString() : ""}</p></div>
                    <span className="text-xs font-semibold text-[hsl(155,45%,32%)]">{a.current_participants || 0}/{a.max_participants || "?"} joined</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
