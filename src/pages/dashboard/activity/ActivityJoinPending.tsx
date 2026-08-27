import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Clock, ArrowLeft, X, Loader2 } from "lucide-react";
import { useActivityDetail } from "@/hooks/useActivityClubPostData";

export default function ActivityJoinPending() {
  const { id } = useParams();
  const { data: activity, isLoading } = useActivityDetail(id || "");

  const display = activity || {
    title: "Evening Football",
    date: new Date(Date.now() + 172800000).toISOString(),
    status: "pending",
  };

  const dateStr = display.date ? new Date(display.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Fri, Aug 29";
  const timeStr = display.date ? new Date(display.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "5:30 PM";

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-12">
      <Reveal>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(38,50%,92%)] flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-[hsl(38,65%,42%)]" />
          </div>
          <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Request submitted</h1>
          <p className="text-muted-foreground text-sm">Your request to join {display.title} is pending host approval.</p>
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
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{dateStr} · {timeStr}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="font-medium text-[hsl(38,65%,42%)]">Pending approval</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Queue position</span><span className="font-medium text-foreground">#3</span></div>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-3">
              <Button variant="outline" className="w-full rounded-full text-destructive border-destructive/20 hover:bg-destructive/5" asChild>
                <Link to="/dashboard/activities"><X className="w-4 h-4 mr-2" /> Cancel Request</Link>
              </Button>
              <Button variant="ghost" className="w-full rounded-full text-muted-foreground" asChild>
                <Link to="/dashboard/home"><ArrowLeft className="w-4 h-4 mr-2" /> Return Home</Link>
              </Button>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
