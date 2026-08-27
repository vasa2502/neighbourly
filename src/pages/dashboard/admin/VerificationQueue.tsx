import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { Shield, CheckCircle2, XCircle, Clock, Loader2, Inbox } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function VerificationQueue() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const { data: claims, isLoading } = useQuery({
    queryKey: ["community-claims"],
    queryFn: async () => {
      const { data, error } = await supabase.from("community_claims" as any).select("*, communities(name), user_profiles(name, email)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: verifications, isLoading: loadingVerifications } = useQuery({
    queryKey: ["verification-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("verification_requests" as any).select("*, user_profiles(name, email), communities(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const approveClaimMutation = useMutation({
    mutationFn: async (claimId: string) => {
      const { error } = await supabase.from("community_claims" as any).update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user?.id }).eq("id", claimId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Claim approved!");
      qc.invalidateQueries({ queryKey: ["community-claims"] });
    },
    onError: () => toast.error("Failed to approve claim"),
  });

  const rejectClaimMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase.from("community_claims" as any).update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.id, rejection_reason: reason }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Claim rejected");
      qc.invalidateQueries({ queryKey: ["community-claims"] });
    },
  });

  const approveVerifMutation = useMutation({
    mutationFn: async (verifId: string) => {
      const { error } = await supabase.from("verification_requests" as any).update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", verifId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Verification approved!");
      qc.invalidateQueries({ queryKey: ["verification-requests"] });
    },
  });

  const pendingClaims = (claims || []).filter((c: any) => c.status === "pending");
  const pendingVerifications = (verifications || []).filter((v: any) => v.status === "pending");
  const totalPending = pendingClaims.length + pendingVerifications.length;

  if (isLoading || loadingVerifications) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-[hsl(38,65%,42%)]" /> Verification Queue ({totalPending})
        </h1>
      </Reveal>

      {pendingClaims.length > 0 && (
        <Reveal delay={0.05}>
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Community Claims</h2>
        </Reveal>
      )}

      {pendingClaims.map((claim: any, i: number) => (
        <Reveal key={claim.id} delay={i * 0.05}>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-3">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-[hsl(38,50%,92%)] flex items-center justify-center">
                  <span className="text-sm font-bold text-[hsl(38,65%,42%)]">{(claim.user_profiles?.name || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{claim.user_profiles?.name || "Unknown"}</p>
                  <p className="text-[10px] text-muted-foreground">{claim.user_profiles?.email} · Claims: {claim.communities?.name || "Community"}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(claim.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Organization: {claim.organization_name} · Role: {claim.role_title}</p>
              <p className="text-xs text-muted-foreground mb-3">Evidence: {claim.evidence}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approveClaimMutation.mutate(claim.id)} disabled={approveClaimMutation.isPending} className="h-8 text-xs font-semibold bg-[hsl(155,45%,32%)] text-white rounded-full">
                  {approveClaimMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />} Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => rejectClaimMutation.mutate({ id: claim.id, reason: rejectReason[claim.id] || "Does not meet requirements" })} disabled={rejectClaimMutation.isPending} className="h-8 text-xs font-semibold rounded-full text-destructive border-destructive/20">
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ))}

      {pendingVerifications.length > 0 && (
        <Reveal delay={0.1}>
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 mt-6">Resident Verifications</h2>
        </Reveal>
      )}

      {pendingVerifications.map((v: any, i: number) => (
        <Reveal key={v.id} delay={i * 0.05}>
          <Card className="border-border/40 shadow-sm rounded-2xl mb-3">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-[hsl(210,40%,92%)] flex items-center justify-center">
                  <span className="text-sm font-bold text-[hsl(210,55%,42%)]">{(v.user_profiles?.name || "?").split(" ").map((n: string) => n[0]).join("")}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{v.user_profiles?.name || "Unknown"}</p>
                  <p className="text-[10px] text-muted-foreground">{v.user_profiles?.email} · {v.communities?.name}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(v.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Method: {v.method}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approveVerifMutation.mutate(v.id)} disabled={approveVerifMutation.isPending} className="h-8 text-xs font-semibold bg-[hsl(155,45%,32%)] text-white rounded-full">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold rounded-full text-destructive border-destructive/20">
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ))}

      {totalPending === 0 && (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No pending items in the queue</p>
        </div>
      )}
    </div>
  );
}
