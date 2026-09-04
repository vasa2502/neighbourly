import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { Search, MoreVertical, Loader2, Download } from "lucide-react";
import { useCommunity } from "@/contexts/CommunityContext";
import { useCommunityMembers } from "@/hooks/useConvexData";

const statusColors: Record<string, string> = {
  approved: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]",
  pending: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]",
  rejected: "bg-destructive/10 text-destructive",
  none: "bg-muted text-muted-foreground",
};

export default function ResidentManagement() {
  const [query, setQuery] = useState("");
  const { communityId } = useCommunity();
  const { data: members = [], isLoading } = useCommunityMembers(communityId || "");

  const membersFormatted = members.map((m: any) => ({
    name: m.name || m.userId || "Resident",
    building: m.building || "",
    role: m.role,
    status: m.verificationStatus || "none",
    joined: m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "",
  }));

  const filtered = query
    ? membersFormatted.filter((r: any) => r.name.toLowerCase().includes(query.toLowerCase()))
    : membersFormatted;

  const exportCSV = () => {
    const csv = ["Name,Role,Status,Joined"]
      .concat(filtered.map((r: any) => `${r.name},${r.role},${r.status},${r.joined}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "residents.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-4">
          Resident Management ({membersFormatted.length})
        </h1>
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search residents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 pl-10 rounded-xl bg-muted/40 border-0 text-sm"
            />
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} className="rounded-xl shrink-0">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>
      </Reveal>

      <div className="space-y-2">
        {filtered.map((r: any, i: number) => (
          <Reveal key={r.name + i} delay={i * 0.04}>
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
                    {r.building || "Community"} · {r.role}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[r.status] || statusColors.none}`}>
                  {r.status === "approved" ? "Verified" : r.status === "pending" ? "Pending" : r.status === "rejected" ? "Rejected" : "Unverified"}
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">{r.joined}</span>
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Reveal>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No residents found</div>
        )}
      </div>
    </div>
  );
}
