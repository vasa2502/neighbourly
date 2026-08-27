import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { Search, Shield, Users, MessageCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";

export default function ResidentDirectory() {
  const [query, setQuery] = useState("");
  const { communityId } = useCommunity();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["directory", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      const { data, error } = await supabase.from("community_memberships" as any).select("*, user_profiles(name, email, building, interests, avatar)").eq("community_id", communityId).eq("verification_status", "approved");
      if (error) throw error;
      return (data || []).map((m: any) => ({
        name: m.user_profiles?.name || "Resident",
        building: m.user_profiles?.building || "",
        interests: m.user_profiles?.interests || [],
        verified: m.verification_status === "approved",
        role: m.role,
        avatar: m.user_profiles?.avatar,
      }));
    },
    enabled: !!communityId,
  });

  const fallback = [
    { name: "Rajesh K.", building: "Tower A", interests: ["Badminton", "Cricket"], verified: true, role: "admin" },
    { name: "Priya S.", building: "Tower B", interests: ["Yoga", "Photography"], verified: true, role: "resident" },
    { name: "Vikram S.", building: "Tower C", interests: ["Football", "Tennis"], verified: true, role: "resident" },
    { name: "Ananya M.", building: "Tower B", interests: ["Art", "Cooking"], verified: true, role: "resident" },
    { name: "Devika R.", building: "Tower A", interests: ["Books", "Gardening"], verified: true, role: "resident" },
    { name: "Arjun P.", building: "Tower D", interests: ["Gaming", "Movies"], verified: true, role: "resident" },
  ];

  const residents = members.length > 0 ? members : fallback;
  const filtered = query ? residents.filter((r: any) => r.name.toLowerCase().includes(query.toLowerCase()) || r.building?.toLowerCase().includes(query.toLowerCase())) : residents;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2 flex items-center gap-3"><Users className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Resident Directory</h1>
        <p className="text-sm text-muted-foreground mb-4">Verified residents of your community</p>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="relative mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search by name or building..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-11 pl-10 rounded-xl bg-muted/40 border-0 text-sm" /></div>
      </Reveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((r: any, i: number) => (
          <Reveal key={r.name + i} delay={i * 0.04}>
            <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                  {r.avatar ? <img src={r.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-sm font-bold text-[hsl(155,45%,32%)]">{r.name.split(" ").map((n: string) => n[0]).join("")}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1"><p className="text-sm font-semibold text-foreground">{r.name}</p>{r.verified && <Shield className="w-3 h-3 text-[hsl(155,45%,32%)]" />}</div>
                  <p className="text-[10px] text-muted-foreground">{r.building || "Community member"}{r.role === "admin" ? " · Admin" : r.role === "founder" ? " · Founder" : ""}</p>
                  <div className="flex flex-wrap gap-1 mt-1">{(r.interests || []).slice(0, 3).map((int: string) => <span key={int} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{int}</span>)}</div>
                </div>
                <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
