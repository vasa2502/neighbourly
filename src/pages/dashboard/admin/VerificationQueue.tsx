import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/contexts/CommunityContext";
import { useCommunityClaims } from "@/hooks/useCommunityData";
import { useApproveClaim, useRejectClaim } from "@/hooks/useMessagingData";
import { toast } from "sonner";

export default function VerificationQueue() {
  const { user } = useAuth();
  const { communityId } = useCommunity();
  const { data: claims = [] } = useCommunityClaims();
  const approveClaim = useApproveClaim();
  const rejectClaim = useRejectClaim();

  const pendingClaims = (claims as any[]).filter((c: any) => c.status === "pending");

  const handleApprove = async (claimId: string) => {
    try {
      await approveClaim.mutateAsync({ claimId, reviewedBy: user?.id || "" });
      toast.success("Claim approved!");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (claimId: string) => {
    try {
      await rejectClaim.mutateAsync({ claimId, reviewedBy: user?.id || "", reason: "Rejected by admin" });
      toast.success("Claim rejected");
    } catch {
      toast.error("Failed to reject");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3">
          <Shield className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Verification Queue
        </h1>
      </Reveal>

      {pendingClaims.length === 0 ? (
        <Reveal delay={0.05}>
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No pending verification requests.</p>
          </div>
        </Reveal>
      ) : (
        <div className="space-y-3">
          {pendingClaims.map((claim: any, i: number) => (
            <Reveal key={claim._id || i} delay={i * 0.05}>
              <Card className="border-border/40 shadow-sm rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{claim.organizationName || "Community Claim"}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Role: {claim.roleTitle || "Admin"}</p>
                      <p className="text-xs text-muted-foreground">{claim.evidence || "No evidence provided"}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">Submitted {new Date(claim.submittedAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-8 text-xs font-semibold bg-green-500 text-white rounded-full" onClick={() => handleApprove(claim._id)} disabled={approveClaim.isPending || rejectClaim.isPending}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs font-semibold border-red-200 text-red-600 rounded-full" onClick={() => handleReject(claim._id)} disabled={approveClaim.isPending || rejectClaim.isPending}>
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
