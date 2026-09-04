import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Users, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClubs, useJoinClub, useClubMembers } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";
import { toast } from "sonner";

type Tab = "overview" | "members" | "discussion";

export default function ClubDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { communityId } = useCommunity();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: clubs = [] } = useClubs(communityId || "");
  const { data: members = [] } = useClubMembers(id || "");
  const joinClub = useJoinClub();

  // Find club by ID from the list
  const club = clubs.find((c: any) => c._id === id || c.id === id);
  const c = club || {
    name: "Community Club",
    category: "General",
    description: "A community club for residents to connect and engage.",
    memberCount: 0,
    user_profiles: { name: "Founder", avatar: null },
    _fallback: true,
  };

  const handleJoin = async () => {
    if (!id) return;
    try {
      await joinClub.mutateAsync({ clubId: id, userId: user?.id || "" });
      toast.success("Joined club!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to join");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/clubs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Clubs
        </Link>
      </Reveal>

      <Reveal>
        <div className="bg-gradient-to-br from-[hsl(155,45%,32%)] to-[hsl(155,55%,22%)] rounded-2xl h-40 sm:h-52 flex items-center justify-center mb-6">
          <Users className="w-16 h-16 text-white/40" />
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{c.category}</span>
            <h1 className="text-2xl sm:text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground tracking-[-0.02em] mt-0.5">{c.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">{c.description || "No description yet."}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{c.memberCount || 0} members</span>
            </div>
          </div>
          <Button onClick={handleJoin} disabled={joinClub.isPending} className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full shrink-0">
            {joinClub.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {joinClub.isPending ? "Joining..." : "Join Club"}
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
              <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground mb-3">About this club</h3>
              <p className="text-sm text-muted-foreground">{c.description || "Join this club to participate in activities and discussions."}</p>
            </CardContent>
          </Card>
        </Reveal>
      )}

      {activeTab === "members" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">No members yet.</div>
          ) : (
            members.map((m: any, i: number) => (
              <div key={m._id || i} className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[hsl(155,45%,32%)]">{(m.user_profiles?.name || "R").split(" ").map((n: string) => n[0]).join("")}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{m.user_profiles?.name || "Resident"}</p>
                  <p className="text-[10px] text-muted-foreground">{m.role || "Member"}</p>
                </div>
              </div>
            ))
          )}
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
    </div>
  );
}
