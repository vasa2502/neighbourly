import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, MessageCircle, Send, Loader2, Flag, CheckCircle, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { usePostDetail, usePostComments, useAddComment, useReportContent, usePostLikeStatus, useToggleLike } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";
import { toast } from "sonner";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState<{ liked: boolean; count: number } | null>(null);

  const { data: post, isLoading } = usePostDetail(id || "");
  const { data: comments = [] } = usePostComments(id || "");
  const addComment = useAddComment();
  const reportContent = useReportContent();
  const { communityId } = useCommunity();

  // Like functionality
  const { liked: serverLiked, likeCount: serverLikeCount } = usePostLikeStatus(id || "", user?.id);
  const toggleLike = useToggleLike();

  // Use optimistic state if available, otherwise server state
  const liked = optimisticLikes !== null ? optimisticLikes.liked : serverLiked;
  const likeCount = optimisticLikes !== null ? optimisticLikes.count : serverLikeCount;

  const p = post || {
    title: "Community discussion",
    body: "Join the conversation with your neighbors.",
    type: "discussion",
    createdAt: Date.now(),
    status: "active",
    user_profiles: { name: "Community member", avatar: null },
    _fallback: true,
  } as any;

  const handleLike = async () => {
    if (!id || !user?.id) {
      toast.error("Please sign in to like posts");
      return;
    }
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setOptimisticLikes({ liked: newLiked, count: Math.max(0, newCount) });

    try {
      await toggleLike.mutateAsync({ postId: id, userId: user.id });
      setOptimisticLikes(null);
    } catch {
      setOptimisticLikes({ liked, count: likeCount });
      toast.error("Failed to update like");
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !id) return;
    try {
      await addComment.mutateAsync({ postId: id, authorId: user?.id || "", body: comment.trim() });
      setComment("");
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment");
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
      toast.success("Report submitted.");
      setTimeout(() => { setReportOpen(false); setReportSubmitted(false); setReportReason(""); setReportDesc(""); }, 1500);
    } catch {
      toast.error("Failed to submit report");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/posts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Posts
        </Link>
      </Reveal>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* Post Card */}
          <Reveal delay={0.05}>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center">
                    <span className="text-xs font-bold text-[hsl(155,45%,32%)]">{(p.user_profiles?.name || "U").split(" ").map((n: string) => n[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.user_profiles?.name || "Community member"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(p.createdAt || Date.now()).toLocaleDateString()} · {p.type}</p>
                  </div>
                </div>
                <h1 className="text-xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-3">{p.title}</h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.body}</p>

                {/* Like + Comment counts bar */}
                <div className="flex items-center gap-4 pt-3 border-t border-border/40">
                  <button
                    onClick={handleLike}
                    disabled={toggleLike.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      liked
                        ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Heart className={`w-4 h-4 transition-all ${liked ? "fill-red-500 text-red-500" : ""}`} />
                    <span>{likeCount > 0 ? likeCount : ""} Like{likeCount !== 1 ? "s" : ""}</span>
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-muted/50 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span>{(comments as any[]).length} Comment{(comments as any[]).length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* Comments Section */}
          <Reveal delay={0.1}>
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[hsl(155,45%,32%)]" /> Comments ({(comments as any[]).length || 0})
            </h2>
          </Reveal>

          <div className="space-y-3 mb-6">
            {(comments as any[]).map((c: any, i: number) => (
              <Reveal key={c._id || i} delay={i * 0.03}>
                <Card className="border-border/40 shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[9px] font-bold text-muted-foreground">{(c.user_profiles?.name || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground">{c.user_profiles?.name || "Resident"}</p>
                      <span className="text-[9px] text-muted-foreground">· {new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.body}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
            {(comments as any[]).length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first to respond!</p>}
          </div>

          {/* Add Comment */}
          <Reveal delay={0.15}>
            <Card className="border-border/40 shadow-sm rounded-xl mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Input placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && handleComment()} className="flex-1 rounded-xl h-10 text-sm" />
                  <Button onClick={handleComment} disabled={!comment.trim() || addComment.isPending} size="icon" className="w-10 h-10 rounded-full bg-[hsl(155,45%,32%)] text-white shrink-0">
                    {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          {/* Report */}
          <Reveal delay={0.2}>
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setReportOpen(true)}>
                <Flag className="w-4 h-4 mr-1.5" /> Report this post
              </Button>
            </div>
          </Reveal>

          {/* Report Dialog */}
          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Report This Post</DialogTitle></DialogHeader>
              {reportSubmitted ? (
                <div className="py-6 text-center"><CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" /><p className="text-sm font-medium">Report submitted</p></div>
              ) : (
                <div className="space-y-4">
                  <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam or fake</SelectItem>
                      <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Additional details (optional)" value={reportDesc} onChange={(e) => setReportDesc(e.target.value)} rows={3} />
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
                {!reportSubmitted && <Button onClick={handleReport} disabled={!reportReason} className="bg-[hsl(155,45%,32%)] text-white">Submit</Button>}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
