import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { useCommunity } from "@/contexts/CommunityContext";
import { useActivities, useClubs, usePosts } from "@/hooks/useActivityClubPostData";
import { InlineSponsors } from "@/components/sponsor/InlineSponsors";
import { AdSlot } from "@/components/sponsor/AdSlot";
import { useProfile } from "@/hooks/useCommunityData";
import { useNotifications, useAnnouncements } from "@/hooks/useMessagingData";
import {
  Calendar,
  Users,
  MessageCircle,
  Clock,
  MapPin,
  ArrowRight,
  Plus,
  Bell,
  Dumbbell,
  Heart,
  Trophy,
  Megaphone,
  TrendingUp,
  Zap,
  Star,
  BookOpen,
  Gamepad2,
} from "lucide-react";

const categoryIcons: Record<string, any> = {
  sports: Dumbbell,
  fitness: Heart,
  social: MessageCircle,
  kids: Star,
  outdoor: MapPin,
  hobby: Gamepad2,
};

export default function ResidentHome() {
  const { communityId } = useCommunity();
  const { data: profile } = useProfile();
  const { data: activities = [], isLoading: activitiesLoading } = useActivities(communityId || "");
  const { data: clubs = [], isLoading: clubsLoading } = useClubs(communityId || "");
  const { data: posts = [], isLoading: postsLoading } = usePosts(communityId || "");
  const { data: notifications = [] } = useNotifications();
  const { data: announcements = [] } = useAnnouncements(communityId || "");

  const unreadNotifications = notifications.filter((n: any) => !n.read).length;

  // Show demo data when no real data exists (before DB migration)
  const hasData = activities.length > 0 || clubs.length > 0;
  const displayActivities = hasData
    ? activities.slice(0, 3).map((a: any) => ({
        id: a._id,
        title: a.title,
        time: a.date ? new Date(a.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD",
        location: a.location || "TBD",
        spotsLeft: (a.max_participants || 0) - (a.current_participants || 0),
        category: a.category || "Activity",
        icon: categoryIcons[a.category?.toLowerCase()] || Calendar,
        color: "bg-[hsl(155,45%,92%)]",
        iconColor: "text-[hsl(155,45%,32%)]",
      }))
    : [
        { id: "demo-1", title: "Morning Badminton", time: "7:00 AM", location: "Community Court A", spotsLeft: 3, category: "Sports", icon: Dumbbell, color: "bg-[hsl(155,45%,92%)]", iconColor: "text-[hsl(155,45%,32%)]" },
        { id: "demo-2", title: "Yoga Session", time: "8:00 AM", location: "Clubhouse Lawn", spotsLeft: 8, category: "Fitness", icon: Heart, color: "bg-[hsl(38,50%,92%)]", iconColor: "text-[hsl(38,65%,42%)]" },
        { id: "demo-3", title: "Evening Football", time: "5:30 PM", location: "Main Ground", spotsLeft: 2, category: "Sports", icon: Trophy, color: "bg-[hsl(210,40%,92%)]", iconColor: "text-[hsl(210,55%,42%)]" },
      ];

  const displayClubs = hasData
    ? clubs.slice(0, 3).map((c: any) => ({
        id: c._id,
        name: c.name,
        members: c.member_count || 0,
        category: c.category || "Club",
      }))
    : [
        { id: "demo-c1", name: "Morning Badminton Group", members: 45, category: "Sports" },
        { id: "demo-c2", name: "Photography Club", members: 28, category: "Hobby" },
        { id: "demo-c3", name: "Parents Network", members: 65, category: "Social" },
      ];

  const displayAnnouncements = announcements.length > 0
    ? announcements.slice(0, 3).map((a: any) => ({
        id: a._id,
        title: a.title || "Announcement",
        date: a.created_at ? new Date(a.created_at).toLocaleDateString() : "Today",
        pinned: a.pinned || false,
      }))
    : [
        { id: "a1", title: "Monthly maintenance reminder", date: "Aug 20", pinned: true },
        { id: "a2", title: "Community picnic this Saturday!", date: "Aug 18", pinned: false },
      ];

  const displayPosts = hasData
    ? posts.slice(0, 2).map((p: any) => ({
        id: p._id,
        title: p.title || "New Post",
        author: (p.user_profiles as any)?.name || "Resident",
        time: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Today",
      }))
    : [
        { id: "demo-p1", title: "Anyone have a spare cricket bat?", author: "Rajesh K.", time: "2h ago" },
        { id: "demo-p2", title: "Selling kids bicycle - like new", author: "Priya S.", time: "5h ago" },
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      {/* Welcome */}
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground tracking-[-0.02em]">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">What's happening in your community today</p>
          </div>
          <Link to="/dashboard/notifications">
            <Button variant="outline" size="icon" className="relative border-border/60">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[hsl(155,45%,32%)] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </Reveal>

      {/* Quick Actions */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { to: "/dashboard/activities/create", label: "Create Activity", icon: Plus, color: "bg-[hsl(155,45%,32%)]" },
            { to: "/dashboard/clubs", label: "Find Clubs", icon: Users, color: "bg-[hsl(210,40%,32%)]" },
            { to: "/dashboard/messages", label: "Messages", icon: MessageCircle, color: "bg-[hsl(38,65%,42%)]" },
            { to: "/dashboard/calendar", label: "Calendar", icon: Calendar, color: "bg-[hsl(340,45%,42%)]" },
          ].map((action) => (
            <Link key={action.label} to={action.to}>
              <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-xl cursor-pointer group">
                <CardContent className="p-3 flex flex-col items-center gap-2 text-center">
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground leading-tight">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Today's Activities */}
      <Reveal delay={0.1}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[Bricolage_Grotesque] font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-[hsl(155,45%,32%)]" />
              Today's Activities
            </h2>
            <Link to="/dashboard/activities" className="text-sm text-[hsl(155,50%,32%)] hover:underline font-medium">
              View all <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
          <div className="space-y-3">
            {displayActivities.map((activity: any) => {
              const Icon = activity.icon;
              return (
                <Link key={activity._id} to={`/dashboard/activities/${activity._id}`}>
                  <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-xl cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${activity.color} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{activity.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.time}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{activity.location}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-[hsl(155,50%,38%)] font-medium">{activity.spotsLeft} spots</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Your Clubs */}
      <Reveal delay={0.15}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[Bricolage_Grotesque] font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[hsl(210,55%,42%)]" />
              Your Clubs
            </h2>
            <Link to="/dashboard/clubs" className="text-sm text-[hsl(155,50%,32%)] hover:underline font-medium">
              View all <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {displayClubs.map((club: any) => (
              <Link key={club._id} to="/dashboard/clubs">
                <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-xl cursor-pointer">
                  <CardContent className="p-4">
                    <p className="font-semibold text-foreground text-sm">{club.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {club.members} members
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Recent Posts */}
      <Reveal delay={0.2}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[Bricolage_Grotesque] font-bold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[hsl(38,65%,42%)]" />
              Community Posts
            </h2>
            <Link to="/dashboard/posts" className="text-sm text-[hsl(155,50%,32%)] hover:underline font-medium">
              View all <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
          <div className="space-y-3">
            {displayPosts.map((post: any) => (
              <Link key={post._id} to="/dashboard/posts">
                <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-xl cursor-pointer">
                  <CardContent className="p-4">
                    <p className="font-semibold text-foreground text-sm">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">by {post.author} · {post.time}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Announcements */}
      <Reveal delay={0.25}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[Bricolage_Grotesque] font-bold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[hsl(155,45%,32%)]" />
              Announcements
            </h2>
          </div>
          <div className="space-y-2">
            {displayAnnouncements.map((ann: any) => (
              <Card key={ann._id} className="border-border/40 shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  {ann.pinned && <span className="text-[10px] font-bold text-[hsl(155,45%,32%)] bg-[hsl(155,45%,95%)] px-2 py-0.5 rounded-full">PINNED</span>}
                  <div>
                    <p className="text-sm font-medium text-foreground">{ann.title}</p>
                    <p className="text-[10px] text-muted-foreground">{ann.date}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Mobile inline sponsors */}
      <InlineSponsors max={2} page="home" showMarkers />

      {/* Desktop ad slot between sections */}
      <div className="hidden xl:block">
        <AdSlot placement="home_content" variant="banner" label="Sponsored" />
      </div>

      {/* Community Growth CTA */}
      <Reveal delay={0.3}>
        <Link to="/dashboard/growth">
          <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-xl cursor-pointer overflow-hidden">
            <div className="bg-gradient-to-r from-[hsl(155,45%,32%)] to-[hsl(155,45%,28%)] p-5 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Grow Your Community</p>
                  <p className="text-white/70 text-sm mt-0.5">Invite neighbors and earn referral credits</p>
                </div>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>
      </Reveal>
    </div>
  );
}
