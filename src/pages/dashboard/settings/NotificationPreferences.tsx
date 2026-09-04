import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Bell, Calendar, MessageCircle, Users, Shield, Megaphone, Trophy, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationPrefs, useSaveNotificationPrefs } from "@/hooks/useMessagingData";

interface Pref {
  key: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
  push: boolean;
}

const defaultPrefs: Pref[] = [
  { key: "activities", label: "Activity Updates", description: "New activities, join requests, reminders", icon: Calendar, enabled: true, push: true },
  { key: "messages", label: "Messages", description: "Direct messages and activity chat", icon: MessageCircle, enabled: true, push: true },
  { key: "clubs", label: "Club Updates", description: "New clubs, member joins, club events", icon: Users, enabled: true, push: false },
  { key: "announcements", label: "Announcements", description: "Official community announcements", icon: Megaphone, enabled: true, push: true },
  { key: "moderation", label: "Moderation", description: "Report updates, content removals", icon: Shield, enabled: true, push: false },
  { key: "sports", label: "Sports & Games", description: "Game invites, availability updates", icon: Trophy, enabled: true, push: true },
  { key: "referrals", label: "Referrals", description: "Referral credits and rewards", icon: Bell, enabled: false, push: false },
];

export default function NotificationPreferences() {
  const { user } = useAuth();
  const savedPrefs = useNotificationPrefs();
  const savePrefs = useSaveNotificationPrefs();
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (savedPrefs !== null && loading) {
      setPrefs((prev) =>
        prev.map((p) => {
          const saved = savedPrefs[p.key];
          return saved ? { ...p, enabled: saved.enabled, push: saved.push } : p;
        })
      );
      setLoading(false);
    } else if (savedPrefs === null && loading) {
      setLoading(false);
    }
  }, [savedPrefs, loading]);

  const togglePref = (key: string, field: "enabled" | "push") => {
    setPrefs((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [field]: !p[field] } : p))
    );
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user) { toast.error("Not authenticated"); return; }
    const prefsObj: Record<string, { enabled: boolean; push: boolean }> = {};
    prefs.forEach((p) => { prefsObj[p.key] = { enabled: p.enabled, push: p.push }; });
    try {
      await savePrefs.mutateAsync({ userId: user.id, notificationPrefs: prefsObj } as any);
      setSaved(true);
      toast.success("Notification preferences saved");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save preferences");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link to="/dashboard/settings">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground">
            Notifications
          </h1>
        </div>
      </Reveal>

      <div className="space-y-3">
        {prefs.map((pref, i) => {
          const Icon = pref.icon;
          return (
            <Reveal key={pref.key} delay={i * 0.03}>
              <Card className="border-border/40 shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[hsl(155,45%,32%)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                    <p className="text-[11px] text-muted-foreground">{pref.description}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[10px] text-muted-foreground">In-app</span>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${pref.enabled ? "bg-[hsl(155,45%,32%)]" : "bg-muted"}`}
                        onClick={() => togglePref(pref.key, "enabled")}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${pref.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[10px] text-muted-foreground">Push</span>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${pref.push ? "bg-[hsl(155,45%,32%)]" : "bg-muted"}`}
                        onClick={() => togglePref(pref.key, "push")}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${pref.push ? "translate-x-4" : "translate-x-0.5"}`} />
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.3}>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={savePrefs.isPending}
            className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] rounded-xl px-8"
          >
            {savePrefs.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {saved ? "✓ Saved" : "Save Preferences"}
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
