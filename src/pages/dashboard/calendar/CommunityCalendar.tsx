import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";

const filters = ["All", "Activities", "Clubs", "Official", "Polls"];
const typeColors: Record<string, string> = {
  Activity: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]",
  Club: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]",
  Official: "bg-[hsl(210,40%,92%)] text-[hsl(210,55%,42%)]",
  Poll: "bg-[hsl(280,40%,92%)] text-[hsl(280,50%,42%)]",
};

export default function CommunityCalendar() {
  const [filter, setFilter] = useState("All");
  const [monthOffset, setMonthOffset] = useState(0);
  const { communityId } = useCommunity();

  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthLabel = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["calendar-activities", communityId, monthOffset],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase.from("activities" as any).select("id, title, date, time, category").eq("community_id", communityId).eq("status", "active").order("date", { ascending: true });
      if (error) throw error;
      return (data || []).map((a: any) => ({ ...a, type: "Activity" }));
    },
    enabled: !!communityId,
  });

  const fallbackEvents = [
    { id: "f1", date: "Aug 27", title: "Morning Badminton", type: "Activity", time: "7:00 AM" },
    { id: "f2", date: "Aug 28", title: "Yoga Session", type: "Activity", time: "8:00 AM" },
    { id: "f3", date: "Aug 29", title: "RWA Meeting", type: "Official", time: "6:00 PM" },
    { id: "f4", date: "Aug 30", title: "Weekend Trek", type: "Activity", time: "6:00 AM" },
    { id: "f5", date: "Aug 31", title: "Book Club Meetup", type: "Club", time: "5:00 PM" },
  ];

  const events = activities.length > 0
    ? activities.map((a: any) => ({
        id: a.id,
        date: a.date ? new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD",
        title: a.title,
        type: a.type || "Activity",
        time: a.time || "TBD",
      }))
    : fallbackEvents;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-[hsl(155,45%,32%)]" /> Community Calendar
        </h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMonthOffset(p => p - 1)} className="p-2 rounded-full hover:bg-muted"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="font-semibold text-foreground">{monthLabel}</h2>
          <button onClick={() => setMonthOffset(p => p + 1)} className="p-2 rounded-full hover:bg-muted"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
          {filters.map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filter === f ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground"}`}>{f}</button>
          ))}
        </div>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {events.filter((e: any) => filter === "All" || e.type === filter).map((event: any, i: number) => (
            <Reveal key={event.id} delay={i * 0.04}>
              <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 text-center shrink-0">
                    <p className="text-xs text-muted-foreground">{event.date.split(" ")[0]}</p>
                    <p className="text-2xl font-bold text-foreground">{event.date.split(" ")[1]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColors[event.type] || ""}`}>{event.type}</span>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
