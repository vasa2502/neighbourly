import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { useCommunity } from "@/contexts/CommunityContext";
import { useActivities } from "@/hooks/useActivityClubPostData";
import { Calendar, Clock, MapPin, Plus, Dumbbell, Heart, Trophy, BookOpen, Gamepad2, Star } from "lucide-react";
import { AdSlot } from "@/components/sponsor/AdSlot";

const categoryIcons: Record<string, { icon: any; color: string; iconColor: string }> = {
  sports: { icon: Dumbbell, color: "bg-[hsl(155,45%,92%)]", iconColor: "text-[hsl(155,45%,32%)]" },
  fitness: { icon: Heart, color: "bg-[hsl(38,50%,92%)]", iconColor: "text-[hsl(38,65%,42%)]" },
  social: { icon: BookOpen, color: "bg-[hsl(340,40%,94%)]", iconColor: "text-[hsl(340,45%,45%)]" },
  kids: { icon: Star, color: "bg-[hsl(45,50%,92%)]", iconColor: "text-[hsl(45,65%,42%)]" },
  outdoor: { icon: Trophy, color: "bg-[hsl(210,40%,92%)]", iconColor: "text-[hsl(210,55%,42%)]" },
  hobby: { icon: Gamepad2, color: "bg-[hsl(280,40%,92%)]", iconColor: "text-[hsl(280,50%,42%)]" },
};

const defaultStyle = { icon: Dumbbell, color: "bg-[hsl(155,45%,92%)]", iconColor: "text-[hsl(155,45%,32%)]" };

export default function Activities() {
  const { communityId } = useCommunity();
  const { data: apiActivities = [] } = useActivities(communityId || "");

  const hasData = apiActivities.length > 0;

  const displayActivities = hasData
    ? apiActivities.map((a: any) => {
        const style = categoryIcons[a.category?.toLowerCase()] || defaultStyle;
        const spots = (a.max_participants || 0) - (a.current_participants || 0);
        return {
          id: a._id,
          title: a.title,
          category: a.category || "Activity",
          time: a.date ? new Date(a.date).toLocaleDateString(undefined, { weekday: "short", month: "short" }) + " · " + new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD",
          location: a.location || "TBD",
          spots,
          ...style,
        };
      })
    : [
        { id: "1", title: "Morning Badminton", category: "Sports", time: "Today · 7:00 AM", location: "Court A", spots: 3, ...categoryIcons.sports },
        { id: "2", title: "Weekend Yoga", category: "Fitness", time: "Sat · 8:00 AM", location: "Clubhouse", spots: 8, ...categoryIcons.fitness },
        { id: "3", title: "Football Practice", category: "Sports", time: "Wed · 5:30 PM", location: "Main Ground", spots: 5, ...categoryIcons.outdoor },
        { id: "4", title: "Book Club Meetup", category: "Social", time: "Fri · 6:30 PM", location: "Lounge", spots: 10, ...categoryIcons.social },
        { id: "5", title: "Kids Art Workshop", category: "Kids", time: "Sun · 10:00 AM", location: "Activity Room", spots: 5, ...categoryIcons.kids },
        { id: "6", title: "Board Game Night", category: "Social", time: "Sat · 7:00 PM", location: "Lounge", spots: 6, ...categoryIcons.hobby },
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground tracking-[-0.02em]">
              Activities
            </h1>
            <p className="text-muted-foreground mt-1">Discover and join activities in your community.</p>
          </div>
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild>
            <Link to="/dashboard/activities/create">
              <Plus className="w-4 h-4 mr-1.5" /> Create
            </Link>
          </Button>
        </div>
      </Reveal>

      {/* Ad placement */}
      <AdSlot placement="activities_list" variant="banner" label="Sponsored" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayActivities.map((activity: any, i: number) => {
          const Icon = activity.icon;
          return (
            <Reveal key={activity._id} delay={i * 0.05}>
              <Link to={`/dashboard/activities/${activity._id}`}>
                <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden cursor-pointer group h-full">
                  <CardContent className="p-0">
                    <div className={`${activity.color} h-24 flex items-center justify-center`}>
                      <Icon className={`w-10 h-10 ${activity.iconColor} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{activity.category}</span>
                      <h3 className="font-semibold text-foreground text-sm mt-0.5 mb-1">{activity.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{activity.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <span className="text-xs text-[hsl(155,50%,38%)] font-medium">{activity.spots} spots left</span>
                        <Button size="sm" className="h-7 text-xs font-semibold bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full">Join</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
