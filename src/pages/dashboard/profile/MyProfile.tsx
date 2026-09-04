import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { User, Edit3, Star, Trophy, Calendar, Users, Shield, Lock, ChevronRight } from "lucide-react";
import { useProfile } from "@/hooks/useCommunityData";

export default function MyProfile() {
  const { data: profile } = useProfile();

  const name = profile?.name || "Rajesh Kumar";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  const bio = profile?.bio || "Community member. Love organizing activities!";
  const interests = profile?.interests?.length ? profile.interests : ["Badminton", "Football", "Yoga", "Photography", "Books"];
  const sports = profile?.sports?.length ? profile.sports : [
    { name: "Badminton", skill: "Intermediate", format: "Doubles" },
    { name: "Football", skill: "Beginner", format: "5v5" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground">My Profile</h1>
          <Button variant="outline" className="rounded-full text-sm" asChild><Link to="/dashboard/profile/edit"><Edit3 className="w-4 h-4 mr-1.5" /> Edit</Link></Button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[hsl(155,45%,32%)]">{initials}</span>
              )}
            </div>
            <div>
              <h2 className="font-[Bricolage_Grotesque] font-bold text-xl text-foreground">{name}</h2>
              <p className="text-sm text-muted-foreground">{profile?.building || "Community"} · {profile?.subscription?.tier === "resident_plus" ? "Resident+" : "Resident"}</p>
              <p className="text-xs text-muted-foreground mt-1">{bio}</p>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((i: string) => (
              <span key={i} className="px-3 py-1.5 bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)] text-xs font-semibold rounded-full">{i}</span>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Sports</h3>
          <div className="space-y-2">
            {sports.map((s: any) => (
              <div key={s.name} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <Trophy className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                <span className="text-sm font-medium text-foreground">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.skill} · {s.format}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
          {[
            { icon: Edit3, label: "Edit Profile", to: "/dashboard/profile/edit" },
            { icon: Star, label: "My Interests", to: "/dashboard/profile" },
            { icon: Trophy, label: "My Sports", to: "/dashboard/profile" },
            { icon: Calendar, label: "My Activities", to: "/dashboard/activities" },
            { icon: Users, label: "My Clubs", to: "/dashboard/clubs" },
            { icon: Lock, label: "Privacy Settings", to: "/dashboard/settings/privacy" },
          ].map(item => (
            <Link key={item.label} to={item.to} className="flex items-center gap-3 p-4 bg-card border border-border/40 rounded-xl hover:shadow-md transition-all">
              <item.icon className="w-5 h-5 text-[hsl(155,45%,32%)]" />
              <span className="text-sm font-medium text-foreground flex-1">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
