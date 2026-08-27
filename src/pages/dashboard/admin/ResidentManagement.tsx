import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { Search, Shield, MoreVertical, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";

const statusColors: Record<string, string> = {
  approved: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]",
  pending: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]",
  rejected: "bg-destructive/10 text-destructive",
  none: "bg-muted text-muted-foreground",
};

export default function ResidentManagement() {
  const [query, setQuery] = useState("");
  const { communityId } = useCommunity();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin-residents", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase
        .from("community_memberships" as any)
        .select("*, user_profiles(name, email, building)")
        .eq("community_id", communityId);
      if (error) throw error;
      return (data || []).map((m: any) => ({
        name: m.user_profiles?.name || "Resident",
        email: m.user_profiles?.email || "",
        building: m.user_profiles?.building || "",
        role: m.role,
        status: m.verification_status || "none",
        joined: m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "",
      }));
    },
    enabled: !!communityId,
  });

  const filtered = query
    ? members.filter(
        (r: any) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.email.toLowerCase().includes(query.toLowerCase())
      )
    : members;

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
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-4">
          Resident Management ({members.length})
        </h1>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search residents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 pl-10 rounded-xl bg-muted/40 border-0 text-sm"
          />
        </div>
      </Reveal>

      <div className="space-y-2">
        {filtered.map((r: any, i: number) => (
          <Reveal key={r.email + i} delay={i * 0.04}>
            <Card className="border-border/40 shadow-sm rounded-xl">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[hsl(155,45%,32%)]">
                    {r.name.split(" ").map((n: string) => n[0]).join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {r.email} · {r.building || "Community"} · {r.role}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    statusColors[r.status] || statusColors.none
                  }`}
                >
                  {r.status === "approved" ? "Verified" : r.status === "pending" ? "Pending" : r.status === "rejected" ? "Rejected" : "Unverified"}
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  {r.joined}
                </span>
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Reveal>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No residents found
          </div>
        )}
      </div>
    </div>
  );
}
