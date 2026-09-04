import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Users, UserPlus, Share2, QrCode, Mail, Copy, CheckCircle, TrendingUp, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useCommunityData";
import { useReferrals, useCreateReferral } from "@/hooks/useMessagingData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { QRCode } from "@/components/QRCode";

export default function CommunityGrowth() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const { data: referrals = [] } = useReferrals();
  const createReferral = useCreateReferral();

  const [showQR, setShowQR] = useState(false);
  const communitySlug = (profile as any)?.community_id || "my-community";
  const inviteLink = `https://joinn.app/invite/${communitySlug}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("Join my community on JOINN!");
    const body = encodeURIComponent(`Hey! I'd like to invite you to join my residential community on JOINN.\n\nUse this link to join: ${inviteLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join my community on JOINN",
        text: "Join our residential community on JOINN!",
        url: inviteLink,
      }).catch(() => {});
    } else {
      handleCopy(inviteLink);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast.error("Enter an email"); return; }
    try {
      await createReferral.mutateAsync({ referrerId: user?.id || "", referredEmail: inviteEmail, communityId: (profile as any)?.community_id });
      toast.success("Invitation sent!");
      setInviteEmail("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send invitation");
    }
  };

  const accepted = referrals.filter((r: any) => r.status === "verified" || r.status === "credited").length;
  const pending = referrals.filter((r: any) => r.status === "pending" || r.status === "joined").length;
  const sent = referrals.length;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 lg:pb-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-[hsl(155,45%,32%)] hover:text-[hsl(155,50%,28%)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[hsl(155,35%,18%)]">Community Growth</h1>
          <p className="text-sm text-[hsl(155,10%,45%)]">You're helping build your community on JOINN</p>
        </div>
      </div>

      {/* Motivational Banner */}
      <Reveal>
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-[hsl(155,45%,32%)] to-[hsl(155,45%,28%)] p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-semibold mb-1">You're helping build your community on JOINN 🌱</p>
                <p className="text-white/80 text-sm">Invite more verified residents to make your community more active.</p>
              </div>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Growth Stats */}
      <Reveal delay={0.1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Invitations Sent", value: sent, icon: Mail, color: "bg-blue-50" },
            { label: "Accepted", value: accepted, icon: CheckCircle, color: "bg-green-50" },
            { label: "Pending", value: pending, icon: UserPlus, color: "bg-yellow-50" },
            { label: "Referral Credits", value: `$${referrals.filter((r: any) => r.status === "verified" || r.status === "credited").reduce((s: number, r: any) => s + (r.credit_amount || 0), 0).toFixed(2)}`, icon: Users, color: "bg-[hsl(155,45%,95%)]" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                </div>
                <p className="text-2xl font-bold text-[hsl(155,35%,18%)]">{stat.value}</p>
                <p className="text-xs text-[hsl(155,10%,45%)] mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      {/* Invite by Email */}
      <Reveal delay={0.12}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-[hsl(155,45%,32%)]" />
              Invite a Neighbor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter their email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(155,45%,32%)]/30"
              />
              <Button
                onClick={handleInvite}
                disabled={createReferral.isPending}
                className="bg-[hsl(155,45%,32%)] hover:bg-[hsl(155,50%,28%)] text-white"
              >
                {createReferral.isPending ? "Sending..." : "Invite"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* Share Community */}
      <Reveal delay={0.15}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[hsl(155,45%,32%)]" />
              Share Your Community
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[hsl(155,10%,45%)] mb-2">Community Invitation Link</p>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg font-mono text-sm text-[hsl(155,35%,18%)] truncate">
                  {inviteLink}
                </div>
                <Button
                  variant="outline"
                  className="border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)] shrink-0"
                  onClick={() => handleCopy(inviteLink)}
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)]" onClick={handleShareEmail}>
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
              <Button variant="outline" className="flex-1 border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)]" onClick={() => setShowQR(!showQR)}>
                <QrCode className="w-4 h-4 mr-2" /> {showQR ? "Hide QR" : "QR Code"}
              </Button>
              <Button variant="outline" className="flex-1 border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)]" onClick={handleNativeShare}>
                <ExternalLink className="w-4 h-4 mr-2" /> Share Link
              </Button>
            </div>
            {showQR && (
              <div className="flex flex-col items-center gap-2 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Scan to join community</p>
                <QRCode value={inviteLink} size={180} />
                <p className="text-[10px] text-muted-foreground font-mono max-w-[200px] truncate">{inviteLink}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>

      {/* Recent Referrals */}
      <Reveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Recent Invitations</span>
              <Badge variant="secondary" className="bg-[hsl(155,45%,95%)] text-[hsl(155,45%,32%)]">
                {referrals.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-[hsl(155,10%,45%)]">
                <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No invitations yet</p>
                <p className="text-sm mt-1">Invite neighbors to start growing your community.</p>
              </div>
            ) : (
              referrals.slice(0, 10).map((ref: any, i: number) => (
                <div key={ref._id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,90%)] flex items-center justify-center text-[hsl(155,45%,32%)] font-semibold text-sm">
                      {(ref.referred_email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[hsl(155,35%,18%)]">{ref.referred_email}</p>
                      <p className="text-xs text-[hsl(155,10%,45%)]">{new Date(ref.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={
                    ref.status === "verified" || ref.status === "credited" ? "bg-green-100 text-green-700" :
                    ref.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }>
                    {ref.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
