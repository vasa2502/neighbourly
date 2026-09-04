import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/Reveal";
import { useReferrals, useCreateReferral } from "@/hooks/useMessagingData";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useCommunityData";
import { toast } from "sonner";
import { ArrowLeft, Link as LinkIcon, Copy, Share2, Users, Gift, QrCode, ExternalLink, Mail, MessageCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCode } from "@/components/QRCode";

const STATUS_STYLES: Record<string, string> = {
  verified: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]",
  credited: "bg-[hsl(155,45%,92%)] text-[hsl(155,45%,32%)]",
  pending: "bg-yellow-50 text-yellow-700",
  joined: "bg-blue-50 text-blue-700",
  expired: "bg-gray-100 text-gray-500",
};

export default function Referrals() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showQR, setShowQR] = useState(false);
  const { user } = useAuth();
  const { data: referrals = [] } = useReferrals();
  const { data: profile } = useProfile();
  const createReferral = useCreateReferral();
  const referralLink = (profile as any)?.referral_code ? `https://joinn.app/invite/${(profile as any).referral_code}` : "https://joinn.app/invite/";

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { toast.error("Enter an email"); return; }
    try {
      await createReferral.mutateAsync({ referrerId: user?.id || "", referredEmail: inviteEmail });
      toast.success("Invitation sent!");
      setInviteEmail("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send invitation");
    }
  };

  const totalCredits = referrals.filter((r: any) => r.status === "verified" || r.status === "credited").reduce((sum: number, r: any) => sum + (r.credit_amount || 0), 0);
  const pendingCredits = referrals.filter((r: any) => r.status === "pending" || r.status === "joined").length * 25;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("Join me on JOINN!");
    const body = encodeURIComponent(`Hey! I'd like to invite you to join my residential community on JOINN. It's a great way to connect with neighbors, discover activities, and be part of a verified community.\n\nUse my referral link to join: ${referralLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Hey! Join me on JOINN — a private community platform for our residential area. Use my link: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join me on JOINN",
        text: "Join my residential community on JOINN!",
        url: referralLink,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 lg:pb-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-[hsl(155,45%,32%)] hover:text-[hsl(155,50%,28%)]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[hsl(155,35%,18%)]">Referrals</h1>
      </div>

      {/* Credit Summary */}
      <Reveal>
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-[hsl(155,45%,32%)] to-[hsl(155,45%,28%)] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Total Referral Credits Earned</p>
                <p className="text-4xl font-bold">${totalCredits.toFixed(2)}</p>
                <p className="text-white/70 text-sm mt-1">Applied to future subscription payments</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Gift className="w-8 h-8" />
              </div>
            </div>
            {pendingCredits > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                <span className="text-white/70 text-sm">Pending Credits (awaiting verification)</span>
                <span className="font-semibold">${pendingCredits.toFixed(2)}</span>
              </div>
            )}
          </div>
        </Card>
      </Reveal>

      {/* Share Referral Link */}
      <Reveal delay={0.1}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[hsl(155,45%,32%)]" />
              Share Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-sm bg-gray-50" />
              <Button
                variant="outline"
                className="border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)] shrink-0"
                onClick={handleCopy}
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)]" onClick={handleShareEmail}>
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
              <Button variant="outline" className="flex-1 border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)]" onClick={handleShareWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
              <Button variant="outline" className="flex-1 border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)]" onClick={() => setShowQR(!showQR)}>
                <QrCode className="w-4 h-4 mr-2" /> {showQR ? "Hide QR" : "QR Code"}
              </Button>
              <Button variant="outline" className="flex-1 border-[hsl(155,35%,85%)] text-[hsl(155,35%,18%)]" onClick={handleNativeShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
            {showQR && (
              <div className="flex flex-col items-center gap-2 pt-4 border-t mt-4">
                <p className="text-xs text-muted-foreground">Scan to join via your referral</p>
                <QRCode value={referralLink} size={180} />
                <p className="text-[10px] text-muted-foreground font-mono max-w-[200px] truncate">{referralLink}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Reveal>

      {/* How Credits Work */}
      <Reveal delay={0.15}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">How Referral Credits Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[hsl(155,45%,97%)] border border-[hsl(155,35%,85%)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(155,45%,90%)] flex items-center justify-center">
                    <Users className="w-4 h-4 text-[hsl(155,45%,32%)]" />
                  </div>
                  <span className="font-semibold text-[hsl(155,35%,18%)]">Same Community Referral</span>
                </div>
                <p className="text-2xl font-bold text-[hsl(155,45%,32%)] mb-1">$3 credit</p>
                <p className="text-sm text-[hsl(155,10%,45%)]">When a neighbor from your community verifies their residence and joins</p>
              </div>
              <div className="p-4 rounded-xl bg-[hsl(155,45%,97%)] border border-[hsl(155,35%,85%)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(155,45%,90%)] flex items-center justify-center">
                    <Gift className="w-4 h-4 text-[hsl(155,45%,32%)]" />
                  </div>
                  <span className="font-semibold text-[hsl(155,35%,18%)]">New Community Founding</span>
                </div>
                <p className="text-2xl font-bold text-[hsl(155,45%,32%)] mb-1">$9 credit</p>
                <p className="text-sm text-[hsl(155,10%,45%)]">When someone creates a new community and verifies — the bigger reward for growing JOINN</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">Credits are applied to your subscription payments. They cannot be converted to cash.</p>
          </CardContent>
        </Card>
      </Reveal>

      {/* Referral History */}
      <Reveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Referral History</span>
              <Badge variant="secondary" className="bg-[hsl(155,45%,95%)] text-[hsl(155,45%,32%)]">
                {referrals.length} referrals
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-[hsl(155,10%,45%)]">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No referrals yet</p>
                <p className="text-sm mt-1">Share your referral link to invite neighbors and earn credits.</p>
              </div>
            ) : (
              referrals.map((ref: any, i: number) => (
                <div key={ref._id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(155,45%,90%)] flex items-center justify-center font-semibold text-[hsl(155,45%,32%)]">
                      {(ref.referred_email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[hsl(155,35%,18%)]">{ref.referred_email}</p>
                      <p className="text-xs text-[hsl(155,10%,45%)]">{new Date(ref.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {ref.status === "verified" || ref.status === "credited" ? (
                      <Badge className="bg-green-100 text-green-700">+${ref.credit_amount || 0}</Badge>
                    ) : ref.status === "pending" ? (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">{ref.status}</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
