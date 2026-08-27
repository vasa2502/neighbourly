import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { useCommunity } from "@/contexts/CommunityContext";
import { useClubs } from "@/hooks/useActivityClubPostData";
import { Users, Plus, Trophy, Heart, BookOpen, Gamepad2, Camera } from "lucide-react";

const clubIcons: Record<string, any> = {
  sports: Trophy,
  hobby: Gamepad2,
  social: Users,
  fitness: Heart,
  learning: BookOpen,
  photography: Camera,
};

export default function Clubs() {
  const { communityId } = useCommunity();
  const { data: apiClubs = [] } = useClubs(communityId || "");

  const hasData = apiClubs.length > 0;

  const displayClubs = hasData
    ? apiClubs.map((c: any) => ({
        id: c.id,
        name: c.name,
        members: c.member_count || 0,
        category: c.category || "General",
        icon: clubIcons[c.category?.toLowerCase()] || Users,
      }))
    : [
        { id: "c1", name: "Morning Badminton Group", members: 45, category: "Sports", icon: Trophy },
        { id: "c2", name: "Photography Club", members: 28, category: "Photography", icon: Camera },
        { id: "c3", name: "Parents Network", members: 65, category: "Social", icon: Users },
        { id: "c4", name: "Fitness Club", members: 42, category: "Fitness", icon: Heart },
        { id: "c5", name: "Book Club", members: 18, category: "Learning", icon: BookOpen },
        { id: "c6", name: "Gaming Night", members: 15, category: "Hobby", icon: Gamepad2 },
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground tracking-[-0.02em]">
              Clubs
            </h1>
            <p className="text-muted-foreground mt-1">Join interest groups in your community.</p>
          </div>
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild>
            <Link to="/dashboard/clubs/create">
              <Plus className="w-4 h-4 mr-1.5" /> Create
            </Link>
          </Button>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayClubs.map((club: any, i: number) => {
          const Icon = club.icon;
          return (
            <Reveal key={club.id} delay={i * 0.05}>
              <Link to={`/dashboard/clubs/${club.id}`}>
                <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden cursor-pointer group h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-[hsl(155,45%,92%)] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-[hsl(155,45%,32%)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{club.name}</h3>
                        <p className="text-xs text-muted-foreground">{club.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {club.members} members
                      </span>
                      <Button size="sm" className="h-7 text-xs font-semibold bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-full">Join</Button>
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
