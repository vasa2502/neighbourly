import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { Megaphone, Pin, Clock, Loader2 } from "lucide-react";
import { useAnnouncements } from "@/hooks/useMessagingData";
import { useCommunity } from "@/contexts/CommunityContext";

export default function Announcements() {
  const { communityId } = useCommunity();
  const { data: announcements = [], isLoading } = useAnnouncements(communityId || "");

  const fallbackAnnouncements = [
    { id: "f1", title: "Monthly maintenance reminder", content: "Please clear your monthly maintenance dues by August 31st.", created_at: new Date().toISOString(), pinned: true, user_profiles: { name: "Admin" } },
    { id: "f2", title: "Community garden project kickoff", content: "We're starting a community garden project! Volunteers needed.", created_at: new Date(Date.now() - 86400000).toISOString(), pinned: true, user_profiles: { name: "Admin" } },
    { id: "f3", title: "Water supply maintenance", content: "Scheduled maintenance on Aug 28, 10 AM to 2 PM.", created_at: new Date(Date.now() - 2 * 86400000).toISOString(), pinned: false, user_profiles: { name: "Admin" } },
  ];

  const displayAnnouncements = (announcements as any[]).length > 0 ? announcements : fallbackAnnouncements;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-6 flex items-center gap-3"><Megaphone className="w-6 h-6 text-[hsl(155,45%,32%)]" /> Announcements</h1>
      </Reveal>
      <div className="space-y-3">
        {(displayAnnouncements as any[]).map((a: any, i: number) => (
          <Reveal key={a._id} delay={i * 0.05}>
            <Card className="border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {a.pinned && <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(38,65%,42%)] bg-[hsl(38,50%,92%)] px-1.5 py-0.5 rounded-full flex items-center gap-1"><Pin className="w-2.5 h-2.5" /> Pinned</span>}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-[Bricolage_Grotesque] font-bold text-foreground text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.content}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
