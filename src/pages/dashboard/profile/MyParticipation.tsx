import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Calendar, Trophy, Users, CheckCircle2, Clock } from "lucide-react";
import { useActivities } from "@/hooks/useActivityClubPostData";
import { useClubs } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

type Tab = "upcoming" | "past" | "clubs";
const tabs: { key: Tab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "clubs", label: "My Clubs" },
];

const fallbackUpcoming = [
  { title: "Morning Badminton", date: "Wed, Aug 27 · 7:00 AM", status: "Joined" },
  { title: "Weekend Trek", date: "Sat, Aug 30 · 6:00 AM", status: "Joined" },
];

const fallbackPast = [
  { title: "Evening Football", date: "Fri, Aug 22 · 5:30 PM", attended: true },
  { title: "Book Club Meetup", date: "Sun, Aug 17 · 5:00 PM", attended: true },
  { title: "Morning Badminton", date: "Wed, Aug 13 · 7:00 AM", attended: false },
];

export default function MyParticipation() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const { communityId } = useCommunity();
  const { data: activities } = useActivities(communityId || "");
  const { data: clubs } = useClubs(communityId || "");

  const upcoming = activities?.length ? activities.slice(0, 10).map((a: any) => ({
    title: a.title, date: `${a.date} · ${a.time || ""}`, status: "Joined"
  })) : fallbackUpcoming;

  const past = fallbackPast;
  const myClubs = clubs?.length ? clubs.map((c: any) => ({ name: c.name, members: c.member_count })) : [
    { name: "Green Valley Fitness", members: 42 },
    { name: "Book Club", members: 24 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">My Participation</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-xl">
          {tabs.map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}>{t.label}</button>
          ))}
        </div>
      </Reveal>

      {tab === "upcoming" && (
        <div className="space-y-3">
          {upcoming.map((a: any, i: number) => (
            <Reveal key={a.title} delay={i * 0.05}>
              <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4 flex items-center gap-3"><Calendar className="w-5 h-5 text-[hsl(155,45%,32%)] shrink-0" /><div className="flex-1"><p className="text-sm font-semibold text-foreground">{a.title}</p><p className="text-xs text-muted-foreground">{a.date}</p></div><span className="text-[10px] font-bold bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)] px-2 py-0.5 rounded-full">{a.status}</span></CardContent></Card>
            </Reveal>
          ))}
        </div>
      )}

      {tab === "past" && (
        <div className="space-y-3">
          {past.map((a: any, i: number) => (
            <Reveal key={a.title} delay={i * 0.05}>
              <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4 flex items-center gap-3"><Calendar className="w-5 h-5 text-muted-foreground shrink-0" /><div className="flex-1"><p className="text-sm font-medium text-foreground">{a.title}</p><p className="text-xs text-muted-foreground">{a.date}</p></div>{a.attended ? <CheckCircle2 className="w-4 h-4 text-[hsl(155,50%,38%)]" /> : <Clock className="w-4 h-4 text-muted-foreground" />}</CardContent></Card>
            </Reveal>
          ))}
        </div>
      )}

      {tab === "clubs" && (
        <div className="space-y-3">
          {myClubs.map((c: any, i: number) => (
            <Reveal key={c.name} delay={i * 0.05}>
              <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4 flex items-center gap-3"><Users className="w-5 h-5 text-[hsl(155,45%,32%)] shrink-0" /><div className="flex-1"><p className="text-sm font-semibold text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.members} members</p></div></CardContent></Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
