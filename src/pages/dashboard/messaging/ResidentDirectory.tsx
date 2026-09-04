import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { Search, Users, MapPin } from "lucide-react";
import { useCommunityMembers } from "@/hooks/useCommunityData";
import { useCommunity } from "@/contexts/CommunityContext";

export default function ResidentDirectory() {
  const { communityId } = useCommunity();
  const { data: members = [], isLoading } = useCommunityMembers(communityId || "");
  const [search, setSearch] = useState("");

  const filtered = (members as any[]).filter((m: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.name?.toLowerCase().includes(q) || m.building?.toLowerCase().includes(q) || (m.interests || []).some((i: string) => i.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <Users className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Resident Directory
        </h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, building, or interest..." value={search} onChange={e => setSearch(e.target.value)} className="h-11 pl-10 rounded-xl bg-muted/40 border-0 text-sm" />
        </div>
      </Reveal>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading residents...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No residents found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m: any, i: number) => (
            <Reveal key={m._id || i} delay={i * 0.03}>
              <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-2xl">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[hsl(155,45%,32%)]">{(m.name || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm">{m.name || "Resident"}</h3>
                      {m.verified && <span className="w-4 h-4 rounded-full bg-[hsl(155,45%,32%)] flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
                    </div>
                    {m.building && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{m.building}</p>}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
