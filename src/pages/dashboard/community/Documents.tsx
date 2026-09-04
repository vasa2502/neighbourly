import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { FileText, Download, Calendar, Plus, Loader2 } from "lucide-react";
import { useCommunityDocuments, useCreateDocument } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import { toast } from "sonner";

const catColors: Record<string, string> = { Rules: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]", Maintenance: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]", Safety: "bg-destructive/10 text-destructive", Facilities: "bg-[hsl(210,40%,92%)] text-[hsl(210,55%,42%)]", Meetings: "bg-[hsl(280,40%,92%)] text-[hsl(280,50%,42%)]" };

const fallbackDocs = [
  { id: "1", title: "Community Rules & Guidelines 2026", category: "Rules", created_at: "2026-01-01" },
  { id: "2", title: "Monthly Maintenance Schedule", category: "Maintenance", created_at: "2026-08-01" },
  { id: "3", title: "Emergency Evacuation Plan", category: "Safety", created_at: "2026-03-15" },
  { id: "4", title: "Parking Allocation Chart", category: "Facilities", created_at: "2026-06-01" },
  { id: "5", title: "Annual General Meeting Minutes", category: "Meetings", created_at: "2026-07-20" },
];

export default function Documents() {
  const { communityId } = useCommunity();
  const { data: dbDocs = [] } = useCommunityDocuments(communityId || "");
  const createDoc = useCreateDocument();
  const isAdmin = useIsAdmin();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const documents = dbDocs.length > 0 ? dbDocs : fallbackDocs;

  const handleAdd = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    try {
      await createDoc.mutateAsync({ communityId: communityId || "", title, description: desc || undefined, url: docUrl || "#", type: "pdf" });
      toast.success("Document added!");
      setTitle(""); setDesc(""); setDocUrl(""); setShowAdd(false);
    } catch { toast.error("Failed to add document"); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground flex items-center gap-3"><FileText className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Documents</h1>
          {isAdmin && <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white rounded-full" onClick={() => setShowAdd(!showAdd)}><Plus className="w-4 h-4 mr-1" /> Add</Button>}
        </div>
      </Reveal>

      {showAdd && isAdmin && (
        <Reveal delay={0.05}>
          <Card className="mb-6 border-[hsl(155,45%,32%)]/30">
            <CardContent className="p-5 space-y-3">
              <Input placeholder="Document title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
              <Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} className="rounded-xl" />
              <Input placeholder="Document URL (optional)" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} className="rounded-xl" />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button size="sm" className="bg-[hsl(155,45%,32%)] text-white" onClick={handleAdd} disabled={createDoc.isPending}>
                  {createDoc.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      )}
      <div className="space-y-3">
        {documents.map((d: any, i: number) => (
          <Reveal key={d._id || d.title} delay={i * 0.04}>
            <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <FileText className="w-8 h-8 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{d.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${catColors[d.category] || "bg-muted text-muted-foreground"}`}>{d.category}</span>
                    {d.created_at && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{new Date(d.created_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
