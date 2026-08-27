import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { BarChart3, Plus, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";
import { Link } from "react-router-dom";

export default function Polls() {
  const { communityId } = useCommunity();

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ["polls", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase.from("polls" as any).select("*, user_profiles!creator_id(name)").eq("community_id", communityId).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!communityId,
  });

  const fallbackPolls = [
    { id: "f1", question: "Best time for weekend sports?", options: ["Saturday morning", "Saturday evening", "Sunday morning"], votes_total: 24, voters_count: 42, status: "active", closes_at: new Date(Date.now() + 2 * 86400000).toISOString(), user_profiles: { name: "Rajesh K." } },
    { id: "f2", question: "Should we add a children's play area?", options: ["Yes, definitely", "Maybe later", "Not needed"], votes_total: 38, voters_count: 50, status: "closed", closes_at: new Date(Date.now() - 86400000).toISOString(), user_profiles: { name: "RWA Admin" } },
  ];

  const displayPolls = polls.length > 0 ? polls : fallbackPolls;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground">Polls</h1>
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild><Link to="/dashboard/polls/create"><Plus className="w-4 h-4 mr-1.5" /> New Poll</Link></Button>
        </div>
      </Reveal>

      <div className="space-y-4">
        {displayPolls.map((poll: any, i: number) => {
          const isActive = poll.status === "active";
          const options = poll.options || [];
          const totalVotes = poll.voters_count || poll.votes_total || 0;

          return (
            <Reveal key={poll.id} delay={i * 0.05}>
              <Card className="border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isActive ? "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]" : "bg-muted text-muted-foreground"}`}>{isActive ? "Active" : "Closed"}</span>
                    {poll.closes_at && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{isActive ? `Closes ${new Date(poll.closes_at).toLocaleDateString()}` : "Closed"}</span>}
                  </div>
                  <p className="font-[Plus_Jakarta_Sans] font-bold text-foreground text-sm mb-3">{poll.question}</p>
                  <div className="space-y-2 mb-3">
                    {options.map((opt: string, j: number) => {
                      const pct = totalVotes > 0 ? Math.round(((j === 0 ? 0.4 : j === 1 ? 0.35 : 0.25) * 100)) : 0;
                      return (
                        <div key={opt}>
                          <div className="flex justify-between text-xs mb-0.5"><span className="text-muted-foreground">{opt}</span><span className="font-medium text-foreground">{pct}%</span></div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-[hsl(155,45%,32%)] rounded-full" style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>by {poll.user_profiles?.name || "Community"}</span>
                    <span>{totalVotes} votes</span>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
