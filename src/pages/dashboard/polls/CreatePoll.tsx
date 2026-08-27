import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useCreatePoll } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [anonymous, setAnonymous] = useState(false);
  const navigate = useNavigate();
  const { communityId } = useCommunity();
  const createPoll = useCreatePoll();

  const addOption = () => setOptions(prev => [...prev, ""]);
  const removeOption = (i: number) => setOptions(prev => prev.filter((_, idx) => idx !== i));
  const updateOption = (i: number, val: string) => setOptions(prev => prev.map((o, idx) => idx === i ? val : o));

  const handlePublish = async () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2 || !communityId) return;
    await createPoll.mutateAsync({
      communityId,
      question: question.trim(),
      options: options.filter(o => o.trim()),
      anonymous,
    });
    navigate("/dashboard/polls");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/polls" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Create Poll</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="border-border/40 shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Question *</label><Input placeholder="What do you want to ask?" value={question} onChange={(e) => setQuestion(e.target.value)} className="rounded-xl h-11" /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Options *</label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder={`Option ${i+1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} className="rounded-xl h-11 flex-1" />
                  {options.length > 2 && <button type="button" onClick={() => removeOption(i)} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={addOption}><Plus className="w-3 h-3 mr-1" /> Add Option</Button>
            </div>
            <div className="flex items-center justify-between py-2"><span className="text-sm text-foreground">Anonymous voting</span><button type="button" onClick={() => setAnonymous(!anonymous)} className={`w-10 h-6 rounded-full transition-colors ${anonymous ? "bg-[hsl(155,45%,32%)]" : "bg-muted"}`}><div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${anonymous ? "translate-x-[18px]" : "translate-x-[2px]"}`} /></button></div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Button
          className="w-full mt-6 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12"
          onClick={handlePublish}
          disabled={!question.trim() || options.filter(o => o.trim()).length < 2 || createPoll.isPending}
        >
          {createPoll.isPending ? "Publishing..." : "Publish Poll"}
        </Button>
      </Reveal>
    </div>
  );
}
