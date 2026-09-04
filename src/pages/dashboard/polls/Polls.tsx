import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { BarChart3, Plus, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { usePolls, useClosePoll } from "@/hooks/useMessagingData";
import { useCommunity } from "@/contexts/CommunityContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Polls() {
  const { communityId } = useCommunity();
  const { data: polls = [] } = usePolls(communityId || "");
  const closePoll = useClosePoll();
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Polls
            </h1>
            <p className="text-muted-foreground mt-1">Community polls and voting.</p>
          </div>
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild>
            <Link to="/dashboard/polls/create">
              <Plus className="w-4 h-4 mr-1.5" /> Create
            </Link>
          </Button>
        </div>
      </Reveal>

      {(polls as any[]).length === 0 ? (
        <Reveal delay={0.05}>
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No polls yet. Create one to get started!</p>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-3">
          {(polls as any[]).map((poll: any, i: number) => (
            <Reveal key={poll._id || i} delay={i * 0.05}>
              <Link to={`/dashboard/polls/${poll._id}/results`}>
                <Card className="border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          {poll.status === "active" ? "Active" : "Closed"}
                        </span>
                        {poll.status === "active" && poll.creatorId === user?.id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              closePoll.mutate({ pollId: poll._id });
                            }}
                            className="text-[10px] text-destructive hover:underline font-medium"
                          >
                            Close
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {poll.options?.length || 0} options
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{poll.question}</h3>
                    <p className="text-xs text-muted-foreground">
                      by {poll.user_profiles?.name || "Resident"} · {new Date(poll.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
