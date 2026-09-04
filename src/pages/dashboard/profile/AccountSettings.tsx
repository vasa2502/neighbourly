import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Mail, Lock, Shield, Users, Trash2, LogOut, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useCommunityData";
import { useUserMemberships } from "@/hooks/useCommunityData";
import { useState } from "react";
import { toast } from "sonner";

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: memberships } = useUserMemberships();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const communityName = memberships?.[0]?.communities?.name || "Not yet a member";
  const email = user?.email || "user@email.com";

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/auth");
    } catch {
      toast.error("Failed to sign out");
      setSigningOut(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6">Account Settings</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="space-y-3 mb-8">
          {[
            { icon: Mail, label: "Email", description: email, color: "text-[hsl(155,45%,32%)]" },
            { icon: Lock, label: "Password", description: "Managed via your auth provider", color: "text-[hsl(38,65%,42%)]" },
            { icon: Shield, label: "Login Methods", description: "Email, Google", color: "text-[hsl(210,55%,42%)]" },
            { icon: Users, label: "Community Membership", description: communityName, color: "text-[hsl(280,50%,42%)]" },
          ].map(item => (
            <Card key={item.label} className="border-border/40 shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <div className="flex-1"><p className="text-sm font-semibold text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.description}</p></div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="space-y-3">
          <Button variant="outline" className="w-full rounded-xl text-muted-foreground" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
            {signingOut ? "Signing out..." : "Sign Out"}
          </Button>
          <Button variant="outline" className="w-full rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5"><Trash2 className="w-4 h-4 mr-2" /> Delete Account</Button>
        </div>
      </Reveal>
    </div>
  );
}
