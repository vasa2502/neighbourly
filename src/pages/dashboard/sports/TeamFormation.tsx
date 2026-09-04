import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { Shuffle, ArrowLeft, Loader2, Users } from "lucide-react";
import { useActivityParticipants } from "@/hooks/useActivityClubPostData";

export default function TeamFormation() {
  const { id } = useParams();
  const { data: rawParticipants = [], isLoading } = useActivityParticipants(id || "");

  const playerNames = useMemo(() => {
    return rawParticipants.map((p: any) => p.user_profiles?.name || p.name || "Player");
  }, [rawParticipants]);

  const half = Math.ceil(playerNames.length / 2);
  const [teamA, setTeamA] = useState(playerNames.slice(0, half));
  const [teamB, setTeamB] = useState(playerNames.slice(half));

  const shuffleTeams = () => {
    const shuffled = [...playerNames].sort(() => Math.random() - 0.5);
    setTeamA(shuffled.slice(0, half));
    setTeamB(shuffled.slice(half));
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
        <Reveal>
          <Link to="/dashboard/sports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3"><Shuffle className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Team Formation</h1>
        </Reveal>
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  if (playerNames.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
        <Reveal>
          <Link to="/dashboard/sports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3"><Shuffle className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Team Formation</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No players joined yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Join an activity to see players here and form teams.</p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/sports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3"><Shuffle className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Team Formation</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <Button onClick={shuffleTeams} variant="outline" className="w-full rounded-full mb-6 border-[hsl(155,35%,85%)] text-[hsl(155,45%,32%)]">
          <Shuffle className="w-4 h-4 mr-2" /> Shuffle Teams
        </Button>
      </Reveal>

      <div className="grid grid-cols-2 gap-4">
        <Reveal delay={0.1}>
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3 text-center">Team A</h3>
              <div className="space-y-2">
                {teamA.map((name: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-[hsl(155,45%,92%)] rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-[hsl(155,45%,32%)] flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">{name.split(" ").map((n: string) => n[0]).join("")}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">{name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3 text-center">Team B</h3>
              <div className="space-y-2">
                {teamB.map((name: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-[hsl(38,50%,92%)] rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-[hsl(38,65%,42%)] flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">{name.split(" ").map((n: string) => n[0]).join("")}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">{name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
