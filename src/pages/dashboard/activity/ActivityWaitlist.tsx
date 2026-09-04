import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { ListOrdered, ArrowRight, Loader2 } from "lucide-react";
import { useActivityDetail } from "@/hooks/useActivityClubPostData";

export default function ActivityWaitlist() {
  const { id } = useParams();
  const { data: activity, isLoading } = useActivityDetail(id || "");

  const display = activity || {
    title: "Morning Badminton",
    current_participants: 16,
    max_participants: 16,
    location: "Community Court A",
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-12">
      <Reveal>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(210,40%,92%)] flex items-center justify-center mx-auto mb-4">
            <ListOrdered className="w-8 h-8 text-[hsl(210,55%,42%)]" />
          </div>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">You&apos;re on the waitlist</h1>
          <p className="text-muted-foreground text-sm">This activity is at capacity. We&apos;ll notify you if a spot opens up.</p>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <Reveal delay={0.1}>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Activity</span><span className="font-medium text-foreground">{display.title}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Your position</span><span className="font-medium text-foreground">#4</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Participants</span><span className="font-medium text-foreground">{display.current_participants} / {display.max_participants} (full)</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Location</span><span className="font-medium text-foreground">{display.location || "TBD"}</span></div>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-full text-destructive border-destructive/20 hover:bg-destructive/5">
                Leave Waitlist
              </Button>
              <Button variant="ghost" className="w-full rounded-full text-muted-foreground" asChild>
                <Link to={id ? `/dashboard/activities/${id}` : "/dashboard/home"}>
                  <ArrowRight className="w-4 h-4 mr-2" /> Back to Activity
                </Link>
              </Button>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
