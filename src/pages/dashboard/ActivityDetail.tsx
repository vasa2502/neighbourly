import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Dumbbell,
  Share2,
  Bookmark,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ActivityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: activity, isLoading } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("activities" as any).select("*, user_profiles!host_id(name, avatar)").eq("id", id).single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user) return;
      const { error } = await supabase.from("activity_participants" as any).insert({ activity_id: id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Joined activity!");
      qc.invalidateQueries({ queryKey: ["activity", id] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to join"),
  });

  const a = activity || {
    id: id || "1",
    title: "Morning Badminton",
    description: "Join us for a fun session of doubles badminton. All skill levels welcome.",
    category: "Sports",
    date: "Wednesday, August 27",
    time: "7:00 AM – 8:30 AM",
    location: "Community Court A",
    skill_level: "All levels",
    format: "Doubles",
    max_participants: 16,
    current_participants: 12,
    is_free: true,
    user_profiles: { name: "Rajesh K.", avatar: null },
    _fallback: true,
  };

  const spotsLeft = (a.max_participants || 16) - (a.current_participants || 12);
  const hostInitials = (a.user_profiles?.name || "Host").split(" ").map((n: string) => n[0]).join("");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/activities" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Activities
        </Link>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Reveal>
              <div className="bg-gradient-to-br from-[hsl(155,45%,92%)] to-[hsl(155,55%,88%)] rounded-2xl h-48 sm:h-64 flex items-center justify-center">
                <Dumbbell className="w-16 h-16 text-[hsl(155,45%,32%)]" />
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{a.category}</span>
                  {a.is_free !== false && <><span className="text-muted-foreground">·</span><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(155,50%,38%)] bg-[hsl(155,45%,92%)] px-2 py-0.5 rounded-full">Free</span></>}
                </div>
                <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground tracking-[-0.02em] mb-3">{a.title}</h1>
                <p className="text-muted-foreground leading-relaxed">{a.description || "No description provided."}</p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: a.date || "TBD" },
                  { icon: Clock, label: "Time", value: a.time || "TBD" },
                  { icon: MapPin, label: "Location", value: a.location || "TBD" },
                  { icon: Users, label: "Details", value: `${a.format || "Flexible"} · ${a.skill_level || "All"}` },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="bg-muted/40 rounded-xl p-3">
                      <Icon className="w-4 h-4 text-[hsl(155,45%,32%)] mb-1.5" />
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <Card className="border-border/40 shadow-sm rounded-2xl">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[hsl(155,45%,32%)]">{hostInitials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.user_profiles?.name || "Host"}</p>
                    <p className="text-xs text-muted-foreground">Host</p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          <div className="space-y-4">
            <Reveal delay={0.1}>
              <Card className="border-border/40 shadow-sm rounded-2xl sticky top-20">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-2xl font-bold text-foreground">{spotsLeft}</span>
                      <span className="text-sm text-muted-foreground">of {a.max_participants || 16} spots left</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[hsl(155,45%,32%)] rounded-full transition-all" style={{ width: `${((a.current_participants || 12) / (a.max_participants || 16)) * 100}%` }} />
                    </div>
                  </div>
                  <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending} className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12 mb-3">
                    {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {joinMutation.isPending ? "Joining..." : "Join Activity"}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-full text-sm h-10"><MessageCircle className="w-4 h-4 mr-1.5" /> Chat</Button>
                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10"><Share2 className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10"><Bookmark className="w-4 h-4" /></Button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/40 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground"><Calendar className="w-4 h-4 shrink-0" /><span>{a.date}</span></div>
                    <div className="flex items-center gap-3 text-muted-foreground"><Clock className="w-4 h-4 shrink-0" /><span>{a.time}</span></div>
                    <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="w-4 h-4 shrink-0" /><span>{a.location}</span></div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      )}
    </div>
  );
}
