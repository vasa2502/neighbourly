import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, MessageCircle, Send, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts" as any).select("*, user_profiles!author_id(name, avatar)").eq("id", id).single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["post-comments", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("post_comments" as any).select("*, user_profiles!author_id(name, avatar)").eq("post_id", id).order("created_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!id,
  });

  const commentMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!id || !user) return;
      const { error } = await supabase.from("post_comments" as any).insert({ post_id: id, author_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["post-comments", id] });
      setComment("");
      toast.success("Comment added!");
    },
    onError: () => toast.error("Failed to add comment"),
  });

  const p = post || {
    id: id || "1",
    title: "Community garden proposal",
    body: "I'd love to start a community garden in the empty lot near Tower C. Who's interested in helping set it up?",
    type: "discussion",
    created_at: new Date().toISOString(),
    status: "active",
    user_profiles: { name: "Priya M.", avatar: null },
    _fallback: true,
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
          <Reveal delay={0.05}>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center">
                    <span className="text-xs font-bold text-[hsl(155,45%,32%)]">{(p.user_profiles?.name || "U").split(" ").map((n: string) => n[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.user_profiles?.name || "Community member"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()} · {p.type}</p>
                  </div>
                </div>
                <h1 className="text-xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-3">{p.title}</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[hsl(155,45%,32%)]" /> Comments ({comments.length || 0})
            </h2>
          </Reveal>

          <div className="space-y-3 mb-6">
            {(comments as any[]).map((c: any, i: number) => (
              <Reveal key={c.id || i} delay={i * 0.03}>
                <Card className="border-border/40 shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[9px] font-bold text-muted-foreground">{(c.user_profiles?.name || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                      </div>
                      <p className="text-xs font-semibold text-foreground">{c.user_profiles?.name || "Resident"}</p>
                      <span className="text-[9px] text-muted-foreground">· {new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.body}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
            {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first to respond!</p>}
          </div>

          <Reveal delay={0.15}>
            <Card className="border-border/40 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Input placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && comment.trim() && commentMutation.mutate(comment.trim())} className="flex-1 rounded-xl h-10 text-sm" />
                  <Button onClick={() => { if (comment.trim()) commentMutation.mutate(comment.trim()); }} disabled={!comment.trim() || commentMutation.isPending} size="icon" className="w-10 h-10 rounded-full bg-[hsl(155,45%,32%)] text-white shrink-0">
                    {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </>
      )}
    </div>
  );
}
