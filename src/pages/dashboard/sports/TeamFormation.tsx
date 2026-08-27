import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { Shuffle, ArrowLeft, Loader2 } from "lucide-react";
import { useActivityParticipants } from "@/hooks/useActivityClubPostData";

export default function TeamFormation() {
  const { id } = useParams();
  const { data: rawParticipants = [], isLoading } = useActivityParticipants(id || "");

  const fallbackPlayers = ["Rajesh K.", "Vikram S.", "Priya M.", "Ananya R.", "Arjun P.", "Devika K.", "Sarah L.", "Rohan G.", "Karan S.", "Deepa N.", "Meera P.", "Sanjay R."];

  const playerNames = useMemo(() => {
    if (rawParticipants.length > 0) {
      return rawParticipants.map((p: any) => p.user_profiles?.name || p.name || "Player");
    }
    return fallbackPlayers;
  }, [rawParticipants]);

  const half = Math.ceil(playerNames.length / 2);
  const [teamA, setTeamA] = useState(playerNames.slice(0, half));
  const [teamB, setTeamB] = useState(playerNames.slice(half));

  const randomize = () => {
    const shuffled = [...playerNames].sort(() => Math.random() - 0.5);
    setTeamA(shuffled.slice(0, half));
    setTeamB(shuffled.slice(half));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to={id ? `/dashboard/activities/${id}` : "/dashboard/sports"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Team Formation</h1>
        <p className="text-sm text-muted-foreground mb-6">Split {playerNames.length} players into two balanced teams</p>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <Reveal delay={0.05}>
            <Button variant="outline" className="rounded-full mb-6" onClick={randomize}><Shuffle className="w-4 h-4 mr-2" /> Randomize Teams</Button>
          </Reveal>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { name: "Team A", players: teamA, color: "border-[hsl(155,45%,32%)]/30 bg-[hsl(155,45%,98%)]" },
              { name: "Team B", players: teamB, color: "border-[hsl(210,40%,92%)] bg-[hsl(210,40%,95%)]" },
            ].map(team => (
              <Reveal key={team.name} delay={0.1}>
                <Card className={`border-2 shadow-sm rounded-2xl ${team.color}`}>
                  <CardContent className="p-5">
                    <h3 className="font-[Plus_Jakarta_Sans] font-bold text-foreground mb-3">{team.name} ({team.players.length})</h3>
                    <div className="space-y-2">
                      {team.players.map(p => (
                        <div key={p} className="flex items-center gap-2 p-2 bg-white/60 rounded-lg">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><span className="text-[9px] font-bold">{p.split(" ").map((n: string) => n[0]).join("")}</span></div>
                          <span className="text-xs font-medium text-foreground">{p}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <Button className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full">Save Teams</Button>
          </Reveal>
        </>
      )}
    </div>
  );
}
