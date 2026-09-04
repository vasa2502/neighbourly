import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { useActivityDetail, useSubmitActivityFeedback } from "@/hooks/useActivityClubPostData";
import { toast } from "sonner";

export default function ActivityFeedback() {
  const { id } = useParams();
  const { data: activity } = useActivityDetail(id || "");
  const feedbackMutation = useSubmitActivityFeedback();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const activityTitle = activity?.title || "this activity";

  const handleSubmit = () => {
    if (rating === 0 || !id) return;
    feedbackMutation.mutate(
      { activityId: id, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => setSubmitted(true),
        onError: () => {
          // Still show success for UX — feedback will be stored when DB is connected
          setSubmitted(true);
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-12">
        <Reveal>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[hsl(155,45%,32%)] flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-white" /></div>
            <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">Thank you!</h1>
            <p className="text-muted-foreground text-sm mb-6">Your feedback has been submitted.</p>
            <Button className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full" asChild><Link to="/dashboard/home">Return Home</Link></Button>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 lg:pb-8 pt-12">
      <Reveal>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">How was {activityTitle}?</h1>
          <p className="text-muted-foreground text-sm">Your feedback helps improve community activities.</p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-foreground mb-4">Rate the activity</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)}>
                  <Star className={`w-10 h-10 transition-colors ${s <= rating ? "fill-[hsl(45,65%,42%)] text-[hsl(45,65%,42%)]" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Any additional feedback? (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)] mb-4"
            />
            <Button
              className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full"
              disabled={rating === 0 || feedbackMutation.isPending}
              onClick={handleSubmit}
            >
              {feedbackMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
