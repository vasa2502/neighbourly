import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Pin, Clock, Megaphone } from "lucide-react";
import { useAnnouncementDetail } from "@/hooks/useMessagingData";

export default function AnnouncementDetail() {
  const { id } = useParams();
  const { data: announcement } = useAnnouncementDetail(id || "");

  const title = (announcement as any)?.title || "Announcement";
  const body = (announcement as any)?.body || (announcement as any)?.content || "";
  const pinned = (announcement as any)?.pinned || false;
  const authorName = (announcement as any)?.user_profiles?.name || "Community Admin";
  const createdAt = (announcement as any)?.created_at;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <Link to="/dashboard/community/announcements" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="w-4 h-4" /> Back to Announcements</Link>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="border-border/40 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              {pinned && <>
                <Pin className="w-4 h-4 text-[hsl(38,65%,42%)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(38,65%,42%)] bg-[hsl(38,50%,92%)] px-2 py-0.5 rounded-full">Pinned</span>
              </>}
              {createdAt && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(createdAt).toLocaleDateString()}</span>}
            </div>
            <h1 className="text-2xl font-[Bricolage_Grotesque] font-extrabold text-foreground mb-2">{title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center"><Megaphone className="w-4 h-4 text-[hsl(155,45%,32%)]" /></div>
              <div><p className="text-xs font-semibold text-foreground">{authorName}</p><p className="text-[10px] text-muted-foreground">Official announcement</p></div>
            </div>
            <div className="prose prose-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{body}</div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
