import { useParams, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { useCommunityDetail } from "@/hooks/useConvexData";
import { useActivities } from "@/hooks/useActivityClubPostData";
import { useClubs } from "@/hooks/useActivityClubPostData";
import {
  ArrowLeft,
  Users,
  MapPin,
  Building2,
  Trophy,
  Shield,
  CheckCircle2,
  Home,
  Dumbbell,
  Heart,
  Loader2,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Sports: Trophy,
  Fitness: Dumbbell,
  Social: Users,
  default: Heart,
};

export default function CommunityPreview() {
  const { id } = useParams();
  const { data: community, isLoading } = useCommunityDetail(id || "");
  const { data: activities = [] } = useActivities(id || "");
  const { data: clubs = [] } = useClubs(id || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(155,45%,32%)]" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-4xl mx-auto flex items-center h-16 px-6">
            <Link
              to="/find-community"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to search
            </Link>
            <div className="mx-auto"><Logo size="sm" /></div>
            <div className="w-24" />
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <Home className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">
            Community Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This community hasn't been created on JOINN yet.
          </p>
          <Button asChild className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full">
            <Link to="/find-community">Browse Communities</Link>
          </Button>
        </div>
      </div>
    );
  }

  const c = community as any;
  const location = [c.area, c.city].filter(Boolean).join(", ");
  const activityList = (activities as any[]).slice(0, 5);
  const clubList = (clubs as any[]).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center h-16 px-6">
          <Link
            to="/find-community"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
          <div className="mx-auto"><Logo size="sm" /></div>
          <div className="w-24" />
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)] h-48 sm:h-64 flex items-center justify-center relative">
        <Home className="w-20 h-20 text-white/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-10 pb-16">
        {/* Community info card */}
        <Reveal>
          <div className="bg-card rounded-2xl shadow-lg border border-border/40 p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)] flex items-center justify-center shrink-0 shadow-md">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-1">
                  {c.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  {location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {location}
                    </span>
                  )}
                  {c.resident_count > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      ~{c.resident_count} residents
                    </span>
                  )}
                  {c.building_count > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      {c.building_count} buildings
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {c.description}
                  </p>
                )}
                <Button
                  className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full"
                  asChild
                >
                  <Link to={`/auth?community=${encodeURIComponent(c._id)}`}>
                    Join This Community
                    <Shield className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Activities */}
          {activityList.length > 0 && (
            <Reveal delay={0.15}>
              <Card className="border-border/60 shadow-sm rounded-2xl h-full">
                <CardContent className="p-6">
                  <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground mb-4">
                    Upcoming Activities
                  </h3>
                  <div className="space-y-3">
                    {activityList.map((activity: any) => {
                      const Icon = iconMap[activity.category] || iconMap.default;
                      return (
                        <div key={activity._id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                          <div className="w-10 h-10 rounded-xl bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.date}{activity.time ? ` · ${activity.time}` : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          )}

          {/* Clubs */}
          {clubList.length > 0 && (
            <Reveal delay={0.2}>
              <Card className="border-border/60 shadow-sm rounded-2xl h-full">
                <CardContent className="p-6">
                  <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground mb-4">
                    Community Clubs
                  </h3>
                  <div className="space-y-3">
                    {clubList.map((club: any) => (
                      <div key={club._id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[hsl(38,50%,92%)] flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-[hsl(38,65%,42%)]" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">{club.name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{club.member_count || 0} members</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          )}
        </div>

        {/* Join CTA at bottom */}
        <Reveal delay={0.3}>
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-4">
              Ready to join {c.name}?
            </p>
            <Button
              size="lg"
              className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full px-8"
              asChild
            >
              <Link to={`/auth?community=${encodeURIComponent(c._id)}`}>
                Join This Community
                <Shield className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Private resident information is not shown on this preview page.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
