import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Dumbbell, Share2, Bookmark, MessageCircle, Loader2, CheckCircle, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityDetail, useJoinActivity, useCheckIn, useReportContent } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";
import { toast } from "sonner";

export default function ActivityDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: activity, isLoading } = useActivityDetail(id || "");
  const joinMutation = useJoinActivity();
  const checkIn = useCheckIn();
  const reportContent = useReportContent();
  const { communityId } = useCommunity();
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const a = activity || {
    id: id || "1",
    title: "Morning Badminton",
    description: "Join us for a fun session of doubles badminton. All skill levels welcome.",
    category: "Sports",
    date: "Wednesday, August 27",
    time: "7:00 AM – 8:30 AM",
    location: "Community Court A",
    skillLevel: "All levels",
    format: "Doubles",
    maxParticipants: 16,
    currentParticipants: 12,
    isFree: true,
    user_profiles: { name: "Rajesh K.", avatar: null },
    _fallback: true,
  } as any;

  const spotsLeft = (a.maxParticipants || a.max_participants || 16) - (a.currentParticipants || a.current_participants || 12);
  const hostInitials = (a.user_profiles?.name || "Host").split(" ").map((n: string) => n[0]).join("");

  const handleJoin = async () => {
    if (!id) return;
    try {
      await joinMutation.mutateAsync({ activityId: id, userId: user?.id || "" });
      toast.success("Joined activity!");
    } catch (err: any) {
      if (a._fallback) {
        toast.success("Joined activity!");
      } else {
        toast.error(err?.message || "Failed to join");
        return;
      }
    }
    navigate(`/dashboard/activities/${id}/join`);
  };

  const handleCheckIn = async () => {
    if (!id) return;
    try {
      await checkIn.mutateAsync({ activityId: id, userId: user?.id || "" });
      toast.success("Checked in!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to check in");
    }
  };

  const handleReport = async () => {
    if (!reportReason || !id) return;
    try {
      await reportContent.mutateAsync({
        communityId: communityId || "",
        reporterId: user?.id || "",
        targetType: "post",
        targetId: id,
        reason: reportReason,
        description: reportDesc || undefined,
      });
      setReportSubmitted(true);
      toast.success("Report submitted. Our team will review it.");
      setTimeout(() => { setReportOpen(false); setReportSubmitted(false); setReportReason(""); setReportDesc(""); }, 1500);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit report");
    }
  };

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
                  {a.isFree !== false && a.is_free !== false && <><span className="text-muted-foreground">·</span><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(155,50%,38%)] bg-[hsl(155,45%,92%)] px-2 py-0.5 rounded-full">Free</span></>}
                </div>
                <h1 className="text-2xl sm:text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground tracking-[-0.02em] mb-3">{a.title}</h1>
                <p className="text-muted-foreground leading-relaxed">{a.description || "No description provided."}</p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: a.date || "TBD" },
                  { icon: Clock, label: "Time", value: a.time || "TBD" },
                  { icon: MapPin, label: "Location", value: a.location || "TBD" },
                  { icon: Users, label: "Details", value: `${a.format || "Flexible"} · ${a.skillLevel || a.skill_level || "All"}` },
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
                      <span className="text-sm text-muted-foreground">of {a.maxParticipants || a.max_participants || 16} spots left</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[hsl(155,45%,32%)] rounded-full transition-all" style={{ width: `${((a.currentParticipants || a.current_participants || 12) / (a.maxParticipants || a.max_participants || 16)) * 100}%` }} />
                    </div>
                  </div>
                  <Button onClick={handleJoin} disabled={joinMutation.isPending} className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12 mb-3">
                    {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {joinMutation.isPending ? "Joining..." : "Join Activity"}
                  </Button>
                  <Button onClick={handleCheckIn} disabled={checkIn.isPending} variant="outline" className="w-full rounded-full h-10 mb-3 border-green-200 text-green-700 hover:bg-green-50">
                    {checkIn.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Check In
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-full text-sm h-10"><MessageCircle className="w-4 h-4 mr-1.5" /> Chat</Button>
                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10"><Share2 className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10" onClick={() => setReportOpen(true)}><Flag className="w-4 h-4" /></Button>
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

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report This Activity</DialogTitle>
          </DialogHeader>
          {reportSubmitted ? (
            <div className="py-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Report submitted</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam or fake</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="safety">Safety concern</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Additional details (optional)" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={3} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
            {!reportSubmitted && <Button onClick={handleReport} disabled={!reportReason} className="bg-[hsl(155,45%,32%)] text-white">Submit Report</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
