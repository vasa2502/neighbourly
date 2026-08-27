import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import {
  ArrowLeft,
  Users,
  Calendar,
  MessageCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Tab = "overview" | "activities" | "members" | "discussion";

export default function ClubDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: club, isLoading } = useQuery({
    queryKey: ["club", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("clubs" as any).select("*, user_profiles!created_by(name, avatar)").eq("id", id).single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user) return;
      const { error } = await supabase.from("club_members" as any).insert({ club_id: id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Joined club!");
      qc.invalidateQueries({ queryKey: ["club", id] });
      qc.invalidateQueries({ queryKey: ["clubs"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to join"),
  });

  const c = club || {
    id: id || "1",
    name: "Green Valley Fitness",
    category: "Fitness",
    description: "A community fitness group focused on regular workouts and staying active together.",
    member_count: 42,
    user_profiles: { name: "Rajesh K.", avatar: null },
    _fallback: true,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/clubs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Clubs
        </Link>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <Reveal>
            <div className="bg-gradient-to-br from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)] rounded-2xl h-40 sm:h-52 flex items-center justify-center mb-6">
              <Users className="w-16 h-16 text-white/40" />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{c.category}</span>
                <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground tracking-[-0.02em] mt-0.5">{c.name}</h1>
                <p className="text-muted-foreground mt-2 max-w-xl">{c.description || "No description yet."}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{c.member_count || 0} members</span>
                </div>
              </div>
              <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending} className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full shrink-0">
                {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {joinMutation.isPending ? "Joining..." : "Join Club"}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-xl">
              {(["overview", "members", "discussion"] as Tab[]).map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{tab}</button>
              ))}
            </div>
          </Reveal>

          {activeTab === "overview" && (
            <Reveal delay={0.12}>
              <Card className="border-border/40 shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-[Plus_Jakarta_Sans] font-bold text-foreground mb-3">About this club</h3>
                  <p className="text-sm text-muted-foreground">{c.description || "Join this club to participate in activities and discussions."}</p>
                </CardContent>
              </Card>
            </Reveal>
          )}

          {activeTab === "members" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[hsl(155,45%,32%)]">{(c.user_profiles?.name || "F").split(" ").map((n: string) => n[0]).join("")}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.user_profiles?.name || "Founder"}</p>
                  <p className="text-[10px] text-muted-foreground">Founder</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "discussion" && (
            <Reveal delay={0.1}>
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Club discussion will appear here.</p>
                <p className="text-xs text-muted-foreground mt-1">Join the club to participate in conversations.</p>
              </div>
            </Reveal>
          )}
        </>
      )}
    </div>
  );
}
