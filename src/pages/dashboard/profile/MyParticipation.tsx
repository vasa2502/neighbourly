import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Calendar, Trophy, Users, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useActivities, useClubs } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

type Tab = "upcoming" | "past" | "clubs";
const tabs: { key: Tab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "clubs", label: "My Clubs" },
];

export default function MyParticipation() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const { communityId } = useCommunity();
  const { data: activities = [], isLoading } = useActivities(communityId || "");
  const { data: clubs = [] } = useClubs(communityId || "");

  const allActivities = (activities as any[]) || [];
  const upcoming = allActivities
    .filter((a: any) => a.status !== "completed")
    .slice(0, 10)
    .map((a: any) => ({
      title: a.title,
      date: `${a.date}${a.time ? ` · ${a.time}` : ""}`,
      status: "Joined",
    }));

  const past = allActivities
    .filter((a: any) => a.status === "completed")
    .slice(0, 10)
    .map((a: any) => ({
      title: a.title,
      date: `${a.date}${a.time ? ` · ${a.time}` : ""}`,
      attended: true,
    }));

  const myClubs = (clubs as any[]).map((c: any) => ({
    name: c.name,
    members: c.member_count || 0,
  }));

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
        <Reveal>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[hsl(155,45%,32%)]" /> My Participation
          </h1>
        </Reveal>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[hsl(155,45%,32%)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-[hsl(155,45%,32%)]" /> My Participation
        </h1>
      </Reveal>

      {/* Tabs */}
      <Reveal delay={0.05}>
        <div className="flex gap-1 bg-muted p-1 rounded-xl mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Upcoming Activities */}
      {tab === "upcoming" && (
        <div className="space-y-3">
          {upcoming.length === 0 ? (
            <Reveal delay={0.1}>
              <Card className="border-border/40 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No upcoming activities.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Join an activity to see it here.</p>
                </CardContent>
              </Card>
            </Reveal>
          ) : (
            upcoming.map((activity: any, i: number) => (
              <Reveal key={i} delay={0.1 + i * 0.03}>
                <Card className="border-border/40 rounded-2xl">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(155,45%,92%)] flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[hsl(155,45%,32%)] bg-[hsl(155,45%,92%)] px-2.5 py-1 rounded-full">
                      {activity.status}
                    </span>
                  </CardContent>
                </Card>
              </Reveal>
            ))
          )}
        </div>
      )}

      {/* Past Activities */}
      {tab === "past" && (
        <div className="space-y-3">
          {past.length === 0 ? (
            <Reveal delay={0.1}>
              <Card className="border-border/40 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No past activities yet.</p>
                </CardContent>
              </Card>
            </Reveal>
          ) : (
            past.map((activity: any, i: number) => (
              <Reveal key={i} delay={0.1 + i * 0.03}>
                <Card className="border-border/40 rounded-2xl">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                    {activity.attended ? (
                      <CheckCircle2 className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                    ) : (
                      <span className="text-xs text-muted-foreground">Missed</span>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            ))
          )}
        </div>
      )}

      {/* My Clubs */}
      {tab === "clubs" && (
        <div className="space-y-3">
          {myClubs.length === 0 ? (
            <Reveal delay={0.1}>
              <Card className="border-border/40 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">You haven't joined any clubs yet.</p>
                </CardContent>
              </Card>
            </Reveal>
          ) : (
            myClubs.map((club: any, i: number) => (
              <Reveal key={i} delay={0.1 + i * 0.03}>
                <Card className="border-border/40 rounded-2xl">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(38,50%,92%)] flex items-center justify-center">
                        <Users className="w-5 h-5 text-[hsl(38,65%,42%)]" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{club.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{club.members} members</span>
                  </CardContent>
                </Card>
              </Reveal>
            ))
          )}
        </div>
      )}
    </div>
  );
}
