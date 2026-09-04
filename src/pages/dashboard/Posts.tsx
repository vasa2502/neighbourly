import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { useCommunity } from "@/contexts/CommunityContext";
import { AdSlot } from "@/components/sponsor/AdSlot";
import { usePosts } from "@/hooks/useActivityClubPostData";
import { MessageCircle, Plus, Tag, Search, Gift, Heart } from "lucide-react";

export default function Posts() {
  const { communityId } = useCommunity();
  const { data: apiPosts = [] } = usePosts(communityId || "");

  const hasData = apiPosts.length > 0;

  const displayPosts = hasData
    ? apiPosts.map((p: any) => ({
        id: p._id,
        title: p.title || "Community Post",
        body: p.body || "",
        author: (p.user_profiles as any)?.name || "Resident",
        type: p.type || "discussion",
        time: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Today",
        likeCount: p.likeCount || 0,
        commentCount: p.commentCount || 0,
      }))
    : [
        { id: "p1", title: "Anyone have a spare cricket bat?", body: "My kids want to start playing cricket in the evenings.", author: "Rajesh K.", type: "discussion", time: "2h ago" },
        { id: "p2", title: "Selling kids bicycle - like new", body: "Raleigh Striker 20 inch, used for 3 months. Asking ₹2,500.", author: "Priya S.", type: "giveaway_sell", time: "5h ago" },
        { id: "p3", title: "Found: Blue water bottle near pool", body: "Has a name sticker on it. Collect from security.", author: "Vikram S.", type: "lost_found", time: "1d ago" },
        { id: "p4", title: "Weekend hiking group - anyone interested?", body: "Planning a hike to Nandi Hills this Saturday.", author: "Ananya M.", type: "discussion", time: "1d ago" },
      ];

  const typeIcon = (type: string) => {
    switch (type) {
      case "giveaway_sell": return <Tag className="w-3 h-3" />;
      case "lost_found": return <Search className="w-3 h-3" />;
      default: return <MessageCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-[Bricolage_Grotesque] font-extrabold text-foreground tracking-[-0.02em]">
              Community Posts
            </h1>
            <p className="text-muted-foreground mt-1">Conversations, buy/sell, and lost & found.</p>
          </div>
          <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild>
            <Link to="/dashboard/posts/create">
              <Plus className="w-4 h-4 mr-1.5" /> Create
            </Link>
          </Button>
        </div>
      </Reveal>

      {/* Ad placement */}
      <AdSlot placement="posts_list" variant="banner" label="Sponsored" />

      <div className="space-y-3">
        {displayPosts.map((post: any, i: number) => (
          <Reveal key={post.id} delay={i * 0.05}>
            <Link to={`/dashboard/posts/${post.id}`}>
              <Card className="border-border/40 shadow-sm hover:shadow-md transition-all rounded-xl cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,90%)] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[hsl(155,45%,32%)]">{post.author.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
                          {typeIcon(post.type)} {post.type.replace("_", " & ")}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">{post.title}</h3>
                      {post.body && <p className="text-xs text-muted-foreground line-clamp-2">{post.body}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-[10px] text-muted-foreground">by {post.author} · {post.time}</p>
                        <div className="flex items-center gap-2 ml-auto">
                          {post.likeCount > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><Heart className="w-3 h-3 fill-red-400 text-red-400" />{post.likeCount}</span>
                          )}
                          {post.commentCount > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><MessageCircle className="w-3 h-3" />{post.commentCount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
