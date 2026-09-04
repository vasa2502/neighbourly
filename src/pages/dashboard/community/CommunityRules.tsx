import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/motion/Reveal";
import { Shield, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { useCommunityRules, useCreateRule } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { toast } from "sonner";

const fallbackRules = [
  { title: "Respect and courtesy", content: "Treat all residents with respect. Harassment, discrimination, or threatening behavior will not be tolerated." },
  { title: "Noise guidelines", content: "Quiet hours are from 10 PM to 7 AM. Musical instruments, loud music, and construction are restricted during these hours." },
  { title: "Common area usage", content: "Common areas should be kept clean and tidy. Report any damage or maintenance issues promptly." },
  { title: "Parking rules", content: "Only park in designated spots. Visitor parking requires prior approval from the admin office." },
  { title: "Pet policy", content: "Pets must be leashed in common areas. Clean up after your pet. Aggressive pets may be restricted." },
  { title: "Security protocols", content: "All visitors must be registered. Do not share access codes with non-residents." },
];

export default function CommunityRules() {
  const { communityId } = useCommunity();
  const { data: dbRules = [] } = useCommunityRules(communityId || "");
  const createRule = useCreateRule();
  const isAdmin = useIsAdmin();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const rules = dbRules.length > 0 ? dbRules : fallbackRules;

  const handleAdd = async () => {
    if (!title.trim() || !desc.trim()) { toast.error("Fill in all fields"); return; }
    try {
      await createRule.mutateAsync({ communityId: communityId || "", title, description: desc, sortOrder: rules.length + 1 });
      toast.success("Rule added!");
      setTitle(""); setDesc(""); setShowAdd(false);
    } catch { toast.error("Failed to add rule"); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground flex items-center gap-3"><Shield className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Community Rules</h1>
          {isAdmin && <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white rounded-full" onClick={() => setShowAdd(!showAdd)}><Plus className="w-4 h-4 mr-1" /> Add Rule</Button>}
        </div>
        <p className="text-sm text-muted-foreground mb-6">All residents are expected to follow these guidelines.</p>
      </Reveal>

      {showAdd && isAdmin && (
        <Reveal delay={0.05}>
          <Card className="mb-6 border-[hsl(155,45%,32%)]/30">
            <CardContent className="p-5 space-y-3">
              <Input placeholder="Rule title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
              <Textarea placeholder="Rule description" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="rounded-xl" />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white" onClick={handleAdd} disabled={createRule.isPending}>
                  {createRule.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      )}

      <div className="space-y-4">
        {rules.map((rule: any, i: number) => (
          <Reveal key={rule._id || rule.title} delay={i * 0.05}>
            <Card className="border-border/40 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[hsl(155,45%,32%)]">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground text-sm mb-1">{rule.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rule.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <div className="bg-[hsl(38,50%,92%)] rounded-xl p-4 flex items-start gap-3 mt-6">
          <AlertTriangle className="w-5 h-5 text-[hsl(38,65%,42%)] shrink-0 mt-0.5" />
          <p className="text-xs text-[hsl(38,60%,35%)] leading-relaxed">Violations of community rules may result in warnings, restricted access, or other actions by community administration.</p>
        </div>
      </Reveal>
    </div>
  );
}
