import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { usePollResults, useVotePoll } from "@/hooks/useActivityClubPostData";
import { usePolls } from "@/hooks/useMessagingData";
import { useCommunity } from "@/contexts/CommunityContext";
import { useAuth } from "@/contexts/AuthContext";

function PollBar({ question, options, pollId }: { question: string; options: string[]; pollId: string }) {
  const { data: results } = usePollResults(pollId);
  const votePoll = useVotePoll();
  const total = results?.total || 0;
  const counts = results?.counts || {};

  const handleVote = async (optionIndex: number) => {
    try {
      await votePoll.mutateAsync({ pollId, optionIndex });
    } catch {
      // Already voted or error
    }
  };

  const sortedOptions = options.map((opt, idx) => ({
    label: opt,
    votes: counts[idx] || 0,
    pct: total > 0 ? Math.round(((counts[idx] || 0) / total) * 100) : 0,
  })).sort((a, b) => b.votes - a.votes);

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl mb-4">
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-foreground mb-4">{question}</p>
        <div className="space-y-3">
          {sortedOptions.map((r, i) => (
            <div key={r.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  {i === 0 && r.votes > 0 && <CheckCircle2 className="w-4 h-4 text-[hsl(155,50%,38%)]" />}
                  {r.label}
                </span>
                <span className="font-semibold text-foreground">{r.pct}% ({r.votes})</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${i === 0 ? "bg-[hsl(155,45%,32%)]" : "bg-[hsl(155,45%,32%)]/40"}`} style={{ width: `${r.pct}%` }} />
              </div>
              {total === 0 && (
                <button onClick={() => handleVote(options.indexOf(r.label))} className="text-xs text-[hsl(155,45%,32%)] hover:underline mt-1">Vote</button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">{total} total votes</p>
      </CardContent>
    </Card>
  );
}

export default function PollResults() {
  const { communityId } = useCommunity();
  const { data: polls = [] } = usePolls(communityId || "");

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6 flex items-center gap-3"><BarChart3 className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Poll Results</h1>
      </Reveal>

      {polls.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No polls yet.</p>}

      {polls.map((poll: any) => (
        <Reveal key={poll.id} delay={0.05}>
          <PollBar question={poll.question} options={poll.options || []} pollId={poll.id} />
        </Reveal>
      ))}
    </div>
  );
}
