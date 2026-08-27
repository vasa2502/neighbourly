import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { AlertTriangle } from "lucide-react";
import { useModerationReports, useDismissReport, useRemoveReportContent, useSuspendUser } from "@/hooks/useActivityClubPostData";
import { useCommunity } from "@/contexts/CommunityContext";

const severityColors: Record<string, string> = { high: "bg-destructive/10 text-destructive", medium: "bg-[hsl(38,50%,92%)] text-[hsl(38,65%,42%)]", low: "bg-muted text-muted-foreground" };

export default function ModerationQueue() {
  const { communityId } = useCommunity();
  const { data: reports = [] } = useModerationReports(communityId || "");
  const dismissReport = useDismissReport();
  const removeContent = useRemoveReportContent();
  const suspendUser = useSuspendUser();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6 flex items-center gap-3"><AlertTriangle className="w-6 h-6 text-destructive" /> Moderation Queue ({reports.length})</h1>
      </Reveal>
      {reports.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No pending reports.</p>}
      <div className="space-y-3">
        {reports.map((r: any, i: number) => (
          <Reveal key={r.id || i} delay={i * 0.05}>
            <Card className="border-border/40 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${severityColors[r.severity] || severityColors.low}`}>{r.severity || "low"}</span>
                  <span className="text-[10px] text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</span>
                </div>
                <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold text-muted-foreground uppercase">{r.target_type || "Post"}</span></div>
                <p className="text-sm font-semibold text-foreground mb-1">{r.reason || "Reported content"}</p>
                <p className="text-xs text-muted-foreground mb-3">Reported by: {r.user_profiles?.name || "User"}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs font-semibold bg-[hsl(155,45%,32%)] text-white rounded-full" onClick={() => dismissReport.mutate(r.id)}>Dismiss</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-full" onClick={() => removeContent.mutate(r.id)}>Remove</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-full text-destructive border-destructive/20" onClick={() => { if (r.reporter_id && communityId) suspendUser.mutate({ userId: r.reporter_id, communityId, reason: r.reason || "Suspended by moderator" }); }}>Suspend</Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
