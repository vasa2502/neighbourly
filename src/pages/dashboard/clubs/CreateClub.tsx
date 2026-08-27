import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft } from "lucide-react";
import { useCommunity } from "@/contexts/CommunityContext";
import { useCreateClub } from "@/hooks/useActivityClubPostData";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const categories = ["Fitness", "Sports", "Hobby", "Social", "Family", "Learning", "Other"];

export default function CreateClub() {
  const [form, setForm] = useState({ name: "", category: "", description: "", rules: "", approval: false });
  const update = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));
  const { communityId } = useCommunity();
  const { user } = useAuth();
  const createClub = useCreateClub();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/clubs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6">Create Club</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="border-border/40 shadow-sm rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Club name *</label><Input placeholder="e.g. Photography Club" value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded-xl h-11" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Category *</label><div className="flex flex-wrap gap-2">{categories.map(c => <button key={c} type="button" onClick={() => update("category", c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${form.category === c ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground"}`}>{c}</button>)}</div></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Description</label><textarea placeholder="What is this club about?" value={form.description} onChange={(e) => update("description", e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]" /></div>
            <div className="space-y-1.5"><label className="text-sm font-medium text-foreground">Rules (optional)</label><textarea placeholder="Club rules for members..." value={form.rules} onChange={(e) => update("rules", e.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]" /></div>
            <div className="flex items-center justify-between py-2"><span className="text-sm text-foreground">Approval required to join</span><button type="button" onClick={() => update("approval", !form.approval)} className={`w-10 h-6 rounded-full transition-colors ${form.approval ? "bg-[hsl(155,45%,32%)]" : "bg-muted"}`}><div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.approval ? "translate-x-4.5" : "translate-x-0.5"}`} /></button></div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Button className="w-full mt-6 bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" onClick={async () => {
          if (!form.name.trim()) { toast.error("Club name is required"); return; }
          if (!communityId || !user) { toast.error("Please sign in"); return; }
          try {
            await createClub.mutateAsync({
              communityId,
              createdBy: user.id,
              name: form.name.trim(),
              category: form.category || "General",
              description: form.description,
            });
            toast.success("Club created!");
            navigate("/dashboard/clubs");
          } catch (err: any) {
            toast.error(err?.message || "Failed to create club");
          }
        }}>Create Club</Button>
      </Reveal>
    </div>
  );
}
