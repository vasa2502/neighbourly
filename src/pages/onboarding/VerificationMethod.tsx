import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { motion } from "framer-motion";
import {
  Shield,
  KeyRound,
  Mail,
  UserCheck,
  FileCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const steps = ["Account", "Verification", "Profile", "Interests", "Community"];

const methods = [
  { id: "code", icon: KeyRound, title: "Community Invite Code", description: "Enter the code shared by your community admin or a neighbour.", color: "bg-[hsl(155,45%,92%)]", iconColor: "text-[hsl(155,45%,32%)]" },
  { id: "invitation", icon: Mail, title: "Community Invitation", description: "You've been invited by a verified resident or admin.", color: "bg-[hsl(38,50%,92%)]", iconColor: "text-[hsl(38,65%,42%)]" },
  { id: "email", icon: Mail, title: "Email Verification", description: "Verify using your residential community email address.", color: "bg-[hsl(210,40%,92%)]", iconColor: "text-[hsl(210,55%,42%)]" },
  { id: "approval", icon: UserCheck, title: "Admin Approval", description: "Submit your request and wait for community admin approval.", color: "bg-[hsl(280,40%,92%)]", iconColor: "text-[hsl(280,50%,42%)]" },
  { id: "proof", icon: FileCheck, title: "Residency Proof", description: "Upload a document proving your residency (utility bill, lease, etc.).", color: "bg-[hsl(340,40%,94%)]", iconColor: "text-[hsl(340,45%,45%)]" },
];

export default function OnboardingVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const { submitVerification } = await import("@/lib/api");
      // For now, submit without communityId — user selects community later
      toast.success("Verification method submitted. Continue to set up your profile.");
      navigate("/onboarding/profile");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Reveal>
          <div className="text-center mb-8">
            <Logo size="md" className="justify-center mb-4" />
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    i === 1 ? "bg-[hsl(155,45%,32%)] text-white" : "bg-muted text-muted-foreground"
                  }`}>{i + 1}</div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:inline ${i === 1 ? "text-[hsl(155,45%,32%)]" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
                </div>
              ))}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[hsl(155,45%,92%)] flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-[hsl(155,45%,32%)]" />
            </div>
            <h1 className="text-2xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground mb-2">Verify that you live here</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Verification keeps our community safe and ensures only real residents participate. Choose a verification method below.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-3 mb-6">
            {methods.map((m) => {
              const Icon = m.icon;
              const active = selected === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m.id)}
                  className={`w-full text-left rounded-2xl p-5 transition-all border-2 ${
                    active ? "border-[hsl(155,45%,32%)] bg-[hsl(155,45%,98%)]" : "border-border/40 bg-card hover:border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${m.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                    </div>
                    {active && <CheckCircle2 className="w-5 h-5 text-[hsl(155,45%,32%)] shrink-0 mt-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>

        {selected === "code" && (
          <Reveal delay={0.15}>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Enter your invite code</label>
                <Input placeholder="e.g. GV-2024-ABCD" value={code} onChange={(e) => setCode(e.target.value)} className="rounded-xl h-11 font-mono text-center text-lg tracking-widest" />
              </CardContent>
            </Card>
          </Reveal>
        )}

        {selected === "proof" && (
          <Reveal delay={0.15}>
            <Card className="border-border/40 shadow-sm rounded-2xl mb-6">
              <CardContent className="p-5">
                <label className="text-sm font-medium text-foreground mb-2 block">Upload residency proof</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <FileCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Utility bill, lease agreement, or government ID</p>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        )}

        <Reveal delay={0.2}>
          <Button className="w-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] font-semibold rounded-full h-12" disabled={!selected || submitting} onClick={handleSubmit}>
            {submitting ? "Submitting..." : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            <Link to="/dashboard/home" className="underline hover:text-foreground">Skip for now</Link> — limited access until verified.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
