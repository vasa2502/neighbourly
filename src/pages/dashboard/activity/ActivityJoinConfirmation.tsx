import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, CheckCircle2, Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useActivityDetail } from "@/hooks/useActivityClubPostData";

export default function ActivityJoinConfirmation() {
  const { id } = useParams();
  const { data: activity, isLoading } = useActivityDetail(id || "");

  const display = activity || {
    title: "Morning Badminton",
    date: new Date(Date.now() + 86400000).toISOString(),
    location: "Community Court A",
    current_participants: 13,
    max_participants: 16,
  };

  const remaining = (display.max_participants || 16) - (display.current_participants || 13);
  const dateStr = display.date ? new Date(display.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Tomorrow";
  const timeStr = display.date ? new Date(display.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "7:00 AM";

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-12">
      <Reveal>
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <div className="w-20 h-20 rounded-full bg-[hsl(155,45%,32%)] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[hsl(155,45%,32%)]/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">You&apos;re in!</h1>
          <p className="text-muted-foreground text-sm">You&apos;ve successfully joined {display.title}.</p>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <Reveal delay={0.1}>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-[hsl(155,45%,32%)]" /><div><p className="text-sm font-semibold text-foreground">{dateStr} · {timeStr}</p><p className="text-xs text-muted-foreground">1 hour 30 minutes</p></div></div>
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[hsl(155,45%,32%)]" /><div><p className="text-sm font-semibold text-foreground">{display.location || "TBD"}</p></div></div>
                <div className="flex items-center gap-3"><Users className="w-5 h-5 text-[hsl(155,45%,32%)]" /><div><p className="text-sm font-semibold text-foreground">{display.current_participants || 13} participants</p><p className="text-xs text-muted-foreground">{remaining} spots remaining</p></div></div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="space-y-3">
              <Button className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild>
                <Link to={id ? `/dashboard/activities/${id}/chat` : "/dashboard/home"}>Open Activity Chat <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button variant="outline" className="w-full rounded-full" asChild><Link to="/dashboard/home">Return Home</Link></Button>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
