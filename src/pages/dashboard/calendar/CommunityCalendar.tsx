import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useActivities } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

export default function CommunityCalendar() {
  const { communityId } = useCommunity();
  const { data: activities = [] } = useActivities(communityId || "");

  // Group by date
  const grouped: Record<string, any[]> = {};
  (activities as any[]).forEach((a: any) => {
    const date = a.date || "TBD";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(a);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Community Calendar
        </h1>
      </Reveal>

      {Object.keys(grouped).length === 0 ? (
        <Reveal delay={0.05}>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No upcoming activities.</p>
          </div>
        </Reveal>
      ) : (
        Object.entries(grouped).map(([date, items], i) => (
          <Reveal key={date} delay={i * 0.05}>
            <div className="mb-6">
              <h2 className="font-semibold text-foreground mb-3 text-sm">{date}</h2>
              <div className="space-y-2">
                {items.map((a: any) => (
                  <Card key={a._id} className="border-border/40 shadow-sm rounded-xl">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{a.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.time || "TBD"}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.location || "TBD"}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[hsl(155,50%,38%)] bg-[hsl(155,45%,92%)] px-2 py-0.5 rounded-full">{a.category}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </Reveal>
        ))
      )}
    </div>
  );
}
