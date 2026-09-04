import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { Users, ListOrdered, BarChart3, MessageCircle, Edit3, Calendar, Copy, Trash2, ArrowLeft } from "lucide-react";
import { useActivityDetail, useActivityParticipants, useDeleteActivity } from "@/hooks/useActivityClubPostData";
import { useNavigate } from "react-router-dom";

const tabs = ["Overview", "Participants", "Waitlist", "Chat", "Attendance", "Settings"] as const;
type Tab = typeof tabs[number];

export default function ManageActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Overview");
  const { data: activity } = useActivityDetail(id || "");
  const { data: participants = [] } = useActivityParticipants(id || "");
  const deleteActivity = useDeleteActivity();

  const title = (activity as any)?.title || "Activity";
  const maxP = (activity as any)?.max_participants || 16;
  const currentP = (activity as any)?.current_participants || participants.length;
  const spotsLeft = Math.max(0, maxP - currentP);
  const waitlistCount = Math.max(0, participants.length - maxP);

  const handleCancel = async () => {
    if (!id) return;
    if (confirm("Are you sure you want to cancel this activity?")) {
      await deleteActivity.mutateAsync({ activityId: id });
      navigate("/dashboard/activities");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to={`/dashboard/activities/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Activity
        </Link>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-4">Manage: {title}</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-xl overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Reveal>

      {tab === "Overview" && (
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><Users className="w-4 h-4 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{currentP}/{maxP}</p><p className="text-[10px] text-muted-foreground">Participants</p></CardContent></Card>
            <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><ListOrdered className="w-4 h-4 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{waitlistCount}</p><p className="text-[10px] text-muted-foreground">Waitlist</p></CardContent></Card>
            <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><MessageCircle className="w-4 h-4 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{title}</p><p className="text-[10px] text-muted-foreground">Activity</p></CardContent></Card>
            <Card className="border-border/40 shadow-sm rounded-xl"><CardContent className="p-4"><BarChart3 className="w-4 h-4 text-[hsl(155,45%,32%)] mb-2" /><p className="text-xl font-bold text-foreground">{spotsLeft}</p><p className="text-[10px] text-muted-foreground">Spots left</p></CardContent></Card>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-4 bg-card border border-border/40 rounded-xl hover:shadow-md transition-all text-left"><Edit3 className="w-5 h-5" /><span className="text-sm font-medium">Edit Activity</span></button>
            <button className="w-full flex items-center gap-3 p-4 bg-card border border-border/40 rounded-xl hover:shadow-md transition-all text-left"><Calendar className="w-5 h-5" /><span className="text-sm font-medium">Reschedule</span></button>
            <button className="w-full flex items-center gap-3 p-4 bg-card border border-border/40 rounded-xl hover:shadow-md transition-all text-left"><Copy className="w-5 h-5" /><span className="text-sm font-medium">Duplicate</span></button>
            <button onClick={handleCancel} className="w-full flex items-center gap-3 p-4 bg-card border border-border/40 rounded-xl hover:shadow-md transition-all text-left text-destructive"><Trash2 className="w-5 h-5" /><span className="text-sm font-medium">Cancel Activity</span></button>
          </div>
        </Reveal>
      )}

      {tab === "Participants" && (
        <div className="space-y-2">
          {participants.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No participants yet.</p>}
          {participants.map((p: any, i: number) => (
            <Reveal key={p.id || i} delay={i * 0.03}>
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[hsl(155,45%,32%)]">{(p.user_profiles?.name || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{p.user_profiles?.name || "Resident"}</span>
                {p.role && <span className="text-[10px] font-medium text-muted-foreground">{p.role}</span>}
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {tab === "Waitlist" && (
        <div className="space-y-2">
          {waitlistCount === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No one on the waitlist.</p>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">{waitlistCount} people on the waitlist.</p>
          )}
        </div>
      )}

      {tab === "Attendance" && (
        <div className="space-y-2">
          {participants.map((p: any, i: number) => (
            <Reveal key={p.id || i} delay={i * 0.03}>
              <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[hsl(155,45%,32%)]">{(p.user_profiles?.name || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{p.user_profiles?.name || "Resident"}</span>
                <select className="h-8 rounded-lg border border-border bg-background text-xs px-2">
                  <option>Not marked</option>
                  <option>Attended</option>
                  <option>No-show</option>
                </select>
              </div>
            </Reveal>
          ))}
          <Button className="w-full mt-4 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full">Save Attendance</Button>
        </div>
      )}

      {tab === "Settings" && (
        <Reveal delay={0.1}>
          <Card className="border-border/40 shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-4">
              {["Approval required", "Invite only", "Waitlist enabled", "Auto-promotion from waitlist"].map((s) => (
                <div key={s} className="flex items-center justify-between py-2 border-b border-border/40 last:border-b-0">
                  <span className="text-sm text-foreground">{s}</span>
                  <div className="w-10 h-6 rounded-full bg-muted relative">
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 right-0.5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      )}

      {tab === "Chat" && (
        <Reveal delay={0.1}>
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Chat messages will appear here.</p>
            <Button variant="outline" className="mt-4 rounded-full text-sm" asChild>
              <Link to={`/dashboard/activities/${id}/chat`}>Open Chat</Link>
            </Button>
          </div>
        </Reveal>
      )}
    </div>
  );
}
