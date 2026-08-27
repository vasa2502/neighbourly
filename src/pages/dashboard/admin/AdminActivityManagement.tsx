import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Calendar, Flag, MoreVertical, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";

export default function AdminActivityManagement() {
  const { communityId } = useCommunity();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["admin-activities", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase
        .from("activities" as any)
        .select("*, user_profiles!host_id(name)")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!communityId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">
          Activity Management ({activities.length})
        </h1>
      </Reveal>
      <div className="space-y-3">
        {activities.map((a: any, i: number) => (
          <Reveal key={a.id || i} delay={i * 0.05}>
            <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <Calendar className="w-5 h-5 text-[hsl(155,45%,32%)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.date || "TBD"} · by {a.user_profiles?.name || "Host"} · {a.category || "Activity"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {a.current_participants || 0}/{a.max_participants || "?"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  a.status === "active" ? "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]" : "bg-muted text-muted-foreground"
                }`}>
                  {a.status}
                </span>
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Reveal>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No activities yet</div>
        )}
      </div>
    </div>
  );
}
