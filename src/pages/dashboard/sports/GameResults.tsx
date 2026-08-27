import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Trophy, Star, ArrowLeft, Loader2 } from "lucide-react";
import { useActivityDetail, useActivityParticipants } from "@/hooks/useActivityClubPostData";

export default function GameResults() {
  const { id } = useParams();
  const { data: activity, isLoading: activityLoading } = useActivityDetail(id || "");
  const { data: participants = [], isLoading: participantsLoading } = useActivityParticipants(id || "");

  const display = activity || {
    title: "Football",
    date: new Date(Date.now() - 86400000).toISOString(),
    location: "Community Ground",
  };

  const dateStr = display.date ? new Date(display.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Sat, Aug 30";
  const timeStr = display.date ? new Date(display.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "5:30 PM";

  const playerNames = participants.length > 0
    ? participants.slice(0, 6).map((p: any) => p.user_profiles?.name || "Player")
    : ["Rajesh K.", "Vikram S.", "Priya M.", "Arjun P.", "Ananya R.", "Devika K."];

  const isLoading = activityLoading || participantsLoading;

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/sports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2 flex items-center gap-3"><Trophy className="w-6 h-6 text-[hsl(45,65%,42%)]" /> Game Result</h1>
        <p className="text-sm text-muted-foreground mb-6">{display.title} — {dateStr} · {timeStr}</p>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <Reveal delay={0.1}>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center flex-1"><p className="text-xs text-muted-foreground mb-1">Team A</p><p className="text-3xl font-bold text-foreground">4</p><p className="text-[10px] text-[hsl(155,50%,38%)] font-bold">WINNER</p></div>
                  <div className="text-muted-foreground text-lg">vs</div>
                  <div className="text-center flex-1"><p className="text-xs text-muted-foreground mb-1">Team B</p><p className="text-3xl font-bold text-foreground">2</p></div>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.15}>
            <h2 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-[hsl(45,65%,42%)]" /> Players</h2>
            <div className="space-y-2">
              {playerNames.map(p => (
                <div key={p} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center"><span className="text-[10px] font-bold text-[hsl(155,45%,32%)]">{p.split(" ").map((n: string) => n[0]).join("")}</span></div>
                  <span className="text-sm font-medium text-foreground">{p}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
