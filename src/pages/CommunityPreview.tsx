import { useParams, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import {
  ArrowLeft,
  Users,
  MapPin,
  Building2,
  Calendar,
  Trophy,
  MessageCircle,
  Dumbbell,
  Heart,
  Shield,
  CheckCircle2,
  Home,
} from "lucide-react";

/* ─── Mock community data ─── */
const communityData: Record<string, any> = {
  "green-valley": {
    name: "Green Valley Residency",
    area: "Whitefield",
    city: "Bangalore",
    type: "Apartment Complex",
    residents: 847,
    buildings: 12,
    description:
      "A vibrant residential community with lush green spaces, modern amenities, and active resident engagement. Known for its strong sports culture and family-friendly environment.",
    color: "from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)]",
    categories: ["Sports", "Fitness", "Social", "Family", "Learning"],
    activities: [
      { name: "Morning Badminton", time: "Daily · 6:30 AM", icon: Dumbbell },
      { name: "Weekend Yoga", time: "Sat · 8:00 AM", icon: Heart },
      { name: "Community Walk", time: "Sun · 6:00 AM", icon: Users },
    ],
    clubs: [
      { name: "Fitness Club", members: 42 },
      { name: "Photography Club", members: 18 },
      { name: "Parents Network", members: 65 },
    ],
    benefits: [
      "Active sports community",
      "Regular community events",
      "Dedicated play areas",
      "24/7 security",
      "Community garden",
    ],
  },
  "sunrise-heights": {
    name: "Sunrise Heights",
    area: "Koramangala",
    city: "Bangalore",
    type: "High-Rise Society",
    residents: 520,
    buildings: 8,
    description:
      "A premium high-rise community in the heart of Koramangala with rooftop amenities and a close-knit resident community.",
    color: "from-[hsl(38,65%,42%)] to-[hsl(38,75%,32%)]",
    categories: ["Social", "Fitness", "Kids", "Food"],
    activities: [
      { name: "Rooftop Fitness", time: "Daily · 7:00 AM", icon: Dumbbell },
      { name: "Food Club Meetup", time: "Fri · 7:00 PM", icon: Heart },
    ],
    clubs: [
      { name: "Rooftop Yoga", members: 35 },
      { name: "Book Club", members: 22 },
    ],
    benefits: [
      "Rooftop amenities",
      "Co-working spaces",
      "Community events",
      "Kids play zone",
    ],
  },
  "oak-park": {
    name: "Oak Park Residences",
    area: "HSR Layout",
    city: "Bangalore",
    type: "Gated Community",
    residents: 1200,
    buildings: 16,
    description:
      "One of the largest gated communities in HSR Layout with extensive sports facilities and a highly organized resident welfare association.",
    color: "from-[hsl(210,55%,42%)] to-[hsl(210,65%,32%)]",
    categories: ["Sports", "Fitness", "Family", "Social", "Learning", "Outdoor"],
    activities: [
      { name: "Football Practice", time: "Wed · 5:30 PM", icon: Trophy },
      { name: "Cricket Match", time: "Sat · 4:00 PM", icon: Dumbbell },
      { name: "Kids Art Class", time: "Sun · 10:00 AM", icon: Heart },
    ],
    clubs: [
      { name: "Football Club", members: 80 },
      { name: "Cricket Club", members: 55 },
      { name: "Tennis Club", members: 30 },
    ],
    benefits: [
      "Multiple sports courts",
      "Large community park",
      "Active events calendar",
      "Organized RWA",
      "Swimming pool",
    ],
  },
  "lotus-pond": {
    name: "Lotus Pond Apartments",
    area: "JP Nagar",
    city: "Bangalore",
    type: "Apartment Complex",
    residents: 340,
    buildings: 6,
    description:
      "A peaceful community centred around a beautiful lotus pond, known for its serene atmosphere and friendly residents.",
    color: "from-[hsl(340,45%,45%)] to-[hsl(340,55%,35%)]",
    categories: ["Social", "Outdoor", "Fitness"],
    activities: [
      { name: "Morning Walk", time: "Daily · 6:00 AM", icon: Heart },
    ],
    clubs: [
      { name: "Garden Club", members: 28 },
    ],
    benefits: [
      "Scenic lotus pond",
      "Walking trails",
      "Peaceful environment",
      "Community garden",
    ],
  },
};

function getFallback() {
  return {
    name: "Community",
    area: "",
    city: "",
    type: "Residential",
    residents: 0,
    buildings: 0,
    description: "This community is getting set up on JOINN.",
    color: "from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)]",
    categories: [],
    activities: [],
    clubs: [],
    benefits: [],
  };
}

export default function CommunityPreview() {
  const { id } = useParams();
  const community = communityData[id || ""] || getFallback();

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
          <div className="mx-auto">
            <Logo size="sm" />
          </div>
          <div className="w-24" />
        </div>
      </header>

      {/* Hero banner */}
      <div className={`bg-gradient-to-br ${community.color} h-48 sm:h-64 flex items-center justify-center relative`}>
        <Home className="w-20 h-20 text-white/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-10 pb-16">
        {/* Community info card */}
        <Reveal>
          <div className="bg-card rounded-2xl shadow-lg border border-border/40 p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${community.color} flex items-center justify-center shrink-0 shadow-md`}>
                <Home className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-1">
                  {community.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {community.area}{community.city ? `, ${community.city}` : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    ~{community.residents} residents
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {community.buildings} buildings
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {community.description}
                </p>
                <Button
                  className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full"
                  asChild
                >
                  <Link to={`/auth?community=${encodeURIComponent(community.name)}`}>
                    Join This Community
                    <Shield className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Categories */}
        {community.categories.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mb-8">
              <h2 className="font-[Plus_Jakarta_Sans] font-bold text-lg text-foreground mb-3">
                Community Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {community.categories.map((cat: string) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)] text-xs font-semibold rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Example activities */}
          {community.activities.length > 0 && (
            <Reveal delay={0.15}>
              <Card className="border-border/60 shadow-sm rounded-2xl h-full">
                <CardContent className="p-6">
                  <h3 className="font-[Plus_Jakarta_Sans] font-bold text-foreground mb-4">
                    Example Activities
                  </h3>
                  <div className="space-y-3">
                    {community.activities.map((activity: any) => (
                      <div
                        key={activity.name}
                        className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                          <activity.icon className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          )}

          {/* Clubs */}
          {community.clubs.length > 0 && (
            <Reveal delay={0.2}>
              <Card className="border-border/60 shadow-sm rounded-2xl h-full">
                <CardContent className="p-6">
                  <h3 className="font-[Plus_Jakarta_Sans] font-bold text-foreground mb-4">
                    Community Clubs
                  </h3>
                  <div className="space-y-3">
                    {community.clubs.map((club: any) => (
                      <div
                        key={club.name}
                        className="flex items-center justify-between p-3 bg-muted/40 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[hsl(38,50%,92%)] flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-[hsl(38,65%,42%)]" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">{club.name}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{club.members} members</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          )}
        </div>

        {/* Benefits */}
        {community.benefits.length > 0 && (
          <Reveal delay={0.25}>
            <Card className="border-border/60 shadow-sm rounded-2xl mb-8">
              <CardContent className="p-6">
                <h3 className="font-[Plus_Jakarta_Sans] font-bold text-foreground mb-4">
                  Community Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {community.benefits.map((benefit: string) => (
                    <div key={benefit} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[hsl(155,50%,38%)] shrink-0" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        )}

        {/* Join CTA at bottom */}
        <Reveal delay={0.3}>
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-4">
              Ready to join {community.name}?
            </p>
            <Button
              size="lg"
              className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full px-8"
              asChild
            >
              <Link to={`/auth?community=${encodeURIComponent(community.name)}`}>
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
