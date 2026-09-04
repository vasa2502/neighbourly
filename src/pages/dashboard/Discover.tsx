import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import {
  Search,
  Calendar,
  Users,
  MessageCircle,
  Compass,
  Dumbbell,
  Heart,
  Trophy,
  Star,
  BookOpen,
  Gamepad2,
  Clock,
  MapPin,
} from "lucide-react";
import { useActivities, useClubs, usePosts } from "@/hooks/useActivityClubPostData";
import { useCommunityMembers } from "@/hooks/useCommunityData";
import { useCommunity } from "@/contexts/CommunityContext";
import { useProfile } from "@/hooks/useCommunityData";
import { AdSlot } from "@/components/sponsor/AdSlot";
import { InlineSponsors } from "@/components/sponsor/InlineSponsors";

type Tab = "activities" | "people" | "clubs" | "posts";

const tabConfig = [
  { key: "activities" as Tab, label: "Activities", icon: Calendar },
  { key: "people" as Tab, label: "People", icon: Users },
  { key: "clubs" as Tab, label: "Clubs", icon: Trophy },
  { key: "posts" as Tab, label: "Posts", icon: MessageCircle },
];

const categories = ["All", "Sports", "Fitness", "Social", "Family", "Kids", "Hobby", "Learning", "Outdoor"];

const activityIcons: Record<string, any> = { sports: Dumbbell, fitness: Heart, social: Users, family: Star, kids: Gamepad2, hobby: BookOpen, learning: BookOpen, outdoor: Trophy };



export default function Discover() {
  const [activeTab, setActiveTab] = useState<Tab>("activities");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { communityId } = useCommunity();

  const { data: rawActivities = [] } = useActivities(communityId || "");
  const { data: rawClubs = [] } = useClubs(communityId || "");
  const { data: rawPosts = [] } = usePosts(communityId || "");
  const { data: people = [], isLoading: peopleLoading } = useCommunityMembers(communityId || "");
  const { data: profile } = useProfile();

  const activities = rawActivities;
  const clubs = rawClubs;
  const posts = rawPosts;

  const filteredActivities = (Array.isArray(activities) ? activities : []).filter((a: any) => {
    const matchesSearch = !searchQuery || a.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === "All" || a.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const filteredClubs = (Array.isArray(clubs) ? clubs : []).filter((c: any) => !searchQuery || c.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPosts = (Array.isArray(posts) ? posts : []).filter((p: any) => !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground tracking-[-0.02em] flex items-center gap-3">
            <Compass className="w-7 h-7 text-[hsl(155,45%,32%)]" />
            Discover
          </h1>
          <p className="text-muted-foreground mt-1">Explore activities, people, clubs, and posts in your community.</p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search activities, people, clubs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-11 pl-10 pr-4 rounded-xl bg-muted/40 border-0 text-sm" />
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-xl overflow-x-auto scrollbar-none">
          {tabConfig.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      {activeTab === "activities" && (
        <Reveal delay={0.12}>
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button key={cat} type="button" onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{cat}</button>
            ))}
          </div>
        </Reveal>
      )}

      {activeTab === "activities" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filteredActivities as any[]).map((activity: any, i: number) => {
            const catKey = activity.category?.toLowerCase() || "sports";
            const Icon = activityIcons[catKey] || Dumbbell;
            const colorBg = ["sports", "fitness"].includes(catKey) ? "bg-[hsl(155,45%,92%)]" : ["social", "hobby"].includes(catKey) ? "bg-[hsl(38,50%,92%)]" : "bg-[hsl(210,40%,92%)]";
            const colorTxt = ["sports", "fitness"].includes(catKey) ? "text-[hsl(155,45%,32%)]" : ["social", "hobby"].includes(catKey) ? "text-[hsl(38,65%,42%)]" : "text-[hsl(210,55%,42%)]";
            return (
              <Reveal key={activity._id || i} delay={i * 0.05}>
                <Link to={`/dashboard/activities/${activity._id}`}>
                  <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden cursor-pointer group h-full">
                    <CardContent className="p-0">
                      <div className={`${colorBg} h-24 flex items-center justify-center`}>
                        <Icon className={`w-10 h-10 ${colorTxt} group-hover:scale-110 transition-transform`} />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{activity.category}</span>
                          <span className="text-[10px] font-bold text-[hsl(155,50%,38%)] bg-[hsl(155,45%,92%)] px-2 py-0.5 rounded-full">{activity.is_free !== false ? "Free" : "Paid"}</span>
                        </div>
                        <h3 className="font-semibold text-foreground text-sm mb-1">{activity.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.time || activity.date || "TBD"}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{activity.location}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-border/40">
                          <span className="text-xs text-[hsl(155,50%,38%)] font-medium">{activity.spots ?? activity.max_participants ?? 0} spots</span>
                          <span className="text-xs text-muted-foreground">by {activity.host || activity.host_name || "Host"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}

      {activeTab === "people" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {peopleLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading residents...</p>
            </div>
          ) : people.length > 0 ? (
            (people as any[]).filter((p: any) => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              return p.name?.toLowerCase().includes(q) ||
                     p.building?.toLowerCase().includes(q) ||
                     (p.interests || []).some((i: string) => i.toLowerCase().includes(q)) ||
                     (p.sports || []).some((s: any) => (s.name || s).toLowerCase().includes(q));
            }).map((person: any, i: number) => (
              <Reveal key={person._id || i} delay={i * 0.05}>
                <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-2xl cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                      {person.avatar ? (
                        <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-[hsl(155,45%,32%)]">{(person.name || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">{person.name || "Resident"}</h3>
                        {person.verified && <span className="w-4 h-4 rounded-full bg-[hsl(155,45%,32%)] flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
                      </div>
                      {person.building && <p className="text-xs text-muted-foreground">{person.building}</p>}
                      {(person.interests?.length > 0 || person.sports?.length > 0) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(person.interests || []).slice(0, 4).map((interest: string) => (
                            <span key={interest} className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{interest}</span>
                          ))}
                          {(person.sports || []).slice(0, 2).map((sport: any) => (
                            <span key={typeof sport === 'string' ? sport : sport.name} className="text-[10px] font-medium bg-[hsl(155,45%,92%)] px-2 py-0.5 rounded-full text-[hsl(155,45%,32%)]">
                              {typeof sport === 'string' ? sport : sport.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No residents found{searchQuery ? ` matching "${searchQuery}"` : "."}</p>
              <p className="text-xs text-muted-foreground mt-1">Residents appear here once they join your community.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "clubs" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(filteredClubs as any[]).length > 0 ? (filteredClubs as any[]).map((club: any, i: number) => (
            <Reveal key={club._id || i} delay={i * 0.05}>
              <Link to={`/dashboard/clubs/${club._id}`}>
                <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)] h-28 flex items-center justify-center">
                      <Users className="w-12 h-12 text-white/70 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{club.category}</span>
                      <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground mt-0.5 mb-2">{club.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{club.member_count || 0} members</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </Reveal>
          )) : (
            <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">No clubs yet. Be the first to create one!</div>
          )}
        </div>
      )}

      {activeTab === "posts" && (
        <div className="space-y-3">
          {/* Ad placement between posts */}
          <AdSlot placement="discover_posts" variant="banner" label="Sponsored" />
          {/* Ad placement between content */}
          <AdSlot placement="discover_posts" variant="banner" label="Sponsored" />


          {(filteredPosts as any[]).length > 0 ? (filteredPosts as any[]).map((post: any, i: number) => {
            const typeColors: Record<string, { text: string; bg: string }> = {
              ask: { text: "text-[hsl(155,50%,38%)]", bg: "bg-[hsl(155,45%,92%)]" },
              offer: { text: "text-[hsl(155,50%,38%)]", bg: "bg-[hsl(155,45%,92%)]" },
              recommendation: { text: "text-[hsl(38,65%,42%)]", bg: "bg-[hsl(38,50%,92%)]" },
              looking_for: { text: "text-[hsl(210,55%,42%)]", bg: "bg-[hsl(210,40%,92%)]" },
              discussion: { text: "text-[hsl(340,45%,45%)]", bg: "bg-[hsl(340,40%,94%)]" },
              help: { text: "text-[hsl(210,55%,42%)]", bg: "bg-[hsl(210,40%,92%)]" },
            };
            const tc = typeColors[post.type] || typeColors.discussion;
            return (
              <Reveal key={post._id || i} delay={i * 0.05}>
                <Link to={`/dashboard/posts/${post._id}`}>
                  <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-2xl cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${tc.text} ${tc.bg} px-2 py-0.5 rounded-full`}>{post.type}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">{post.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.body}</p>
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            );
          }) : (
            <div className="text-center py-12 text-muted-foreground text-sm">No posts yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
