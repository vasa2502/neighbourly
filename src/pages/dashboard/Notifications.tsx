import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useMessagingData";
import { useRealtimeNotifications } from "@/hooks/useRealtimeMessages";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Calendar, Users, MessageCircle, Bell, Shield, Settings, Megaphone } from "lucide-react";

const iconMap: Record<string, any> = {
  activity: Calendar,
  club: Users,
  message: MessageCircle,
  announcement: Megaphone,
  verification: Shield,
  system: Settings,
  default: Bell,
};

export default function Notifications() {
  const { user } = useAuth();
  useRealtimeNotifications(user?.id || null);
  const { isSupported, isSubscribed, subscribe } = usePushNotifications();
  const { data: apiNotifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();

  const hasData = apiNotifications.length > 0;

  const displayNotifications = hasData
    ? apiNotifications.map((n: any) => {
        const Icon = iconMap[n.type] || iconMap.default;
        return {
          id: n.id,
          icon: Icon,
          color: "text-[hsl(155,45%,32%)]",
          bg: "bg-[hsl(155,45%,92%)]",
          title: n.title,
          description: n.body || "",
          time: n.created_at ? new Date(n.created_at).toLocaleDateString() : "",
          unread: !n.read,
        };
      })
    : [
        { id: 1, icon: Calendar, color: "text-[hsl(155,45%,32%)]", bg: "bg-[hsl(155,45%,92%)]", title: "New activity: Evening Football", description: "Vikram created a new activity you might like", time: "5m ago", unread: true },
        { id: 2, icon: Users, color: "text-[hsl(38,65%,42%)]", bg: "bg-[hsl(38,50%,92%)]", title: "New member in Photography Club", description: "Ananya joined Photography Club", time: "1h ago", unread: true },
        { id: 3, icon: MessageCircle, color: "text-[hsl(210,55%,42%)]", bg: "bg-[hsl(210,40%,92%)]", title: "Rajesh replied to your post", description: "Thanks for the recommendation!", time: "3h ago", unread: false },
        { id: 4, icon: Megaphone, color: "text-[hsl(38,65%,42%)]", bg: "bg-[hsl(38,50%,92%)]", title: "Official: Monthly maintenance reminder", description: "Please clear your dues by Aug 31", time: "1d ago", unread: false },
        { id: 5, icon: Shield, color: "text-[hsl(155,45%,32%)]", bg: "bg-[hsl(155,45%,92%)]", title: "Verification approved", description: "Your residency verification has been approved", time: "3d ago", unread: false },
      ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground tracking-[-0.02em] mb-6">
          Notifications
        </h1>
      </Reveal>

      {isSupported && !isSubscribed && (
        <Reveal delay={0.05}>
          <div className="mb-6 p-4 rounded-2xl bg-[hsl(155,45%,98%)] border border-[hsl(155,35%,85%)] flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Enable push notifications</p>
              <p className="text-xs text-muted-foreground">Get notified about activities, messages, and community updates</p>
            </div>
            <button
              onClick={() => subscribe()}
              className="text-xs font-semibold text-[hsl(155,45%,32%)] hover:underline"
            >
              Enable
            </button>
          </div>
        </Reveal>
      )}

      <div className="space-y-3">
        {displayNotifications.map((n: any, i: number) => {
          const Icon = n.icon;
          return (
            <Reveal key={n.id} delay={i * 0.05}>
              <Card
                className={`border-border/40 shadow-sm rounded-2xl hover:shadow-md transition-all cursor-pointer ${n.unread ? "bg-[hsl(155,45%,98%)]" : ""}`}
                onClick={() => {
                  if (hasData && n.unread) markRead.mutate(n.id);
                }}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${n.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-[hsl(155,45%,32%)] shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
