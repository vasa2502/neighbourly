import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Trophy, Star, ArrowLeft, Loader2 } from "lucide-react";
import { useActivityDetail, useActivityParticipants } from "@/hooks/useActivityClubPostData";

export default function GameResults() {
  const { id } = useParams();
  const { data: activity, isLoading: activityLoading } = useActivityDetail(id || "");
  const { data: participants = [], isLoading: participantsLoading } = useActivityParticipants(id || "");

  const isLoading = activityLoading || participantsLoading;

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
        <Reveal>
          <Link to="/dashboard/sports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2 flex items-center gap-3"><Trophy className="w-6 h-6 text-[hsl(45,65%,42%)]" /> Game Result</h1>
        </Reveal>
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
        <Reveal>
          <Link to="/dashboard/sports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2 flex items-center gap-3"><Trophy className="w-6 h-6 text-[hsl(45,65%,42%)]" /> Game Result</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No game result found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">This activity may have been removed or doesn't exist.</p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    );
  }

  const a = activity as any;
  const dateStr = a.date ? new Date(a.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";
  const timeStr = a.time || "";

  const playerNames = (participants as any[])
    .slice(0, 10)
    .map((p: any) => p.user_profiles?.name || "Player");

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/sports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2 flex items-center gap-3"><Trophy className="w-6 h-6 text-[hsl(45,65%,42%)]" /> Game Result</h1>
        <p className="text-sm text-muted-foreground mb-6">{a.title} — {dateStr}{timeStr ? ` · ${timeStr}` : ""}</p>
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-xs text-muted-foreground mb-1">Activity</p>
              <p className="text-lg font-bold text-foreground">{a.title}</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{a.location}</span>
              {a.maxPlayers && <span>· {a.maxPlayers} players</span>}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {playerNames.length > 0 && (
        <Reveal delay={0.15}>
          <h2 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-[hsl(45,65%,42%)]" /> Players</h2>
          <div className="space-y-2">
            {playerNames.map((p: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center"><span className="text-[10px] font-bold text-[hsl(155,45%,32%)]">{p.split(" ").map((n: string) => n[0]).join("")}</span></div>
                <span className="text-sm font-medium text-foreground">{p}</span>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
