import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Image, MapPin, Send } from "lucide-react";
import { useCommunity } from "@/contexts/CommunityContext";
import { useCreatePost } from "@/hooks/useActivityClubPostData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const postTypes = [
  { value: "ask", label: "Ask", color: "bg-[hsl(210,40%,92%)] text-[hsl(210,55%,42%)]" },
  { value: "help", label: "Help", color: "bg-[hsl(0,50%,94%)] text-[hsl(0,65%,50%)]" },
  { value: "offer", label: "Offer", color: "bg-[hsl(155,45%,92%)] text-[hsl(155,50%,38%)]" },
  { value: "recommendation", label: "Recommendation", color: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]" },
  { value: "discussion", label: "Discussion", color: "bg-[hsl(280,40%,92%)] text-[hsl(280,50%,42%)]" },
  { value: "looking-for", label: "Looking For", color: "bg-[hsl(170,40%,92%)] text-[hsl(170,50%,38%)]" },
  { value: "lost-found", label: "Lost & Found", color: "bg-[hsl(340,40%,94%)] text-[hsl(340,45%,45%)]" },
  { value: "buy-sell", label: "Buy/Sell/Giveaway", color: "bg-[hsl(45,50%,92%)] text-[hsl(45,65%,42%)]" },
  { value: "urgent", label: "Urgent", color: "bg-destructive/10 text-destructive" },
];

export default function CreatePost() {
  const [selectedType, setSelectedType] = useState<"ask" | "help" | "offer" | "looking_for" | "recommendation" | "discussion" | "interest" | "lost_found" | "buy_sell" | "urgent">("discussion");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { communityId } = useCommunity();
  const { user } = useAuth();
  const createPost = useCreatePost();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/posts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Posts
        </Link>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6">Create Post</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-6">
            <label className="text-sm font-medium text-foreground mb-3 block">Post type</label>
            <div className="flex flex-wrap gap-2">
              {postTypes.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setSelectedType(pt.value as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${pt.color} ${
                    selectedType === pt.value ? "ring-2 ring-foreground/20" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title *</label>
              <Input
                placeholder="What's on your mind?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                placeholder="Add more details..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)] focus:ring-offset-0"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" size="sm" className="rounded-full text-sm">
                <Image className="w-4 h-4 mr-1.5" /> Photo
              </Button>
              <Button variant="outline" size="sm" className="rounded-full text-sm">
                <MapPin className="w-4 h-4 mr-1.5" /> Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.15}>
        <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full px-6" onClick={async () => {
          if (!title.trim()) { toast.error("Title is required"); return; }
          if (!communityId || !user) { toast.error("Please sign in"); return; }
          try {
            await createPost.mutateAsync({
              communityId,
              authorId: user.id,
              title: title.trim(),
              body: body.trim(),
              type: selectedType,
            });
            toast.success("Post published!");
            navigate("/dashboard/posts");
          } catch (err: any) {
            toast.error(err?.message || "Failed to publish post");
          }
        }}>
          <Send className="w-4 h-4 mr-2" /> Publish Post
        </Button>
      </Reveal>
    </div>
  );
}
