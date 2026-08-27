import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion/Reveal";
import { useConversations } from "@/hooks/useMessagingData";
import { MessageCircle, Users, Clock } from "lucide-react";

export default function Messages() {
  const { data: apiConversations = [] } = useConversations();

  const hasData = apiConversations.length > 0;

  const directMessages = hasData
    ? apiConversations
        .filter((c: any) => c.conversations?.type === "direct")
        .map((c: any) => ({
          name: c.conversations?.title || "Conversation",
          lastMessage: c.conversations?.last_message || "No messages yet",
          time: c.conversations?.updated_at ? new Date(c.conversations.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          unread: 0,
        }))
    : [
        { name: "Rajesh K.", lastMessage: "See you at badminton tomorrow!", time: "2m ago", unread: 2 },
        { name: "Priya S.", lastMessage: "Thanks for the book recommendation", time: "1h ago", unread: 0 },
        { name: "Vikram S.", lastMessage: "Can you bring an extra racket?", time: "3h ago", unread: 1 },
      ];

  const groupMessages = hasData
    ? apiConversations
        .filter((c: any) => c.conversations?.type === "group")
        .map((c: any) => ({
          name: c.conversations?.title || "Group",
          members: 0,
          lastMessage: c.conversations?.last_message || "No messages yet",
          time: c.conversations?.updated_at ? new Date(c.conversations.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          unread: 0,
        }))
    : [
        { name: "Morning Badminton Group", members: 12, lastMessage: "Rajesh: Courts are booked for 7 AM", time: "15m ago", unread: 5 },
        { name: "Parents Network", members: 65, lastMessage: "Ananya: School admissions thread updated", time: "2h ago", unread: 0 },
        { name: "Fitness Club", members: 42, lastMessage: "Priya: New workout schedule posted", time: "1d ago", unread: 0 },
      ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 lg:pb-8 pt-4 lg:pt-6">
      <Reveal>
        <h1 className="text-2xl sm:text-3xl font-[Plus_Jakarta_Sans] font-extrabold text-foreground tracking-[-0.02em] mb-6">
          Messages
        </h1>
      </Reveal>

      {/* Direct Messages */}
      <Reveal delay={0.05}>
        <section className="mb-8">
          <h2 className="font-[Plus_Jakarta_Sans] font-bold text-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[hsl(155,45%,32%)]" />
            Direct
          </h2>
          <div className="space-y-2">
            {directMessages.map((dm: any) => (
              <Link key={dm.name} to="/dashboard/messages/direct">
                <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[hsl(155,45%,32%)]">{dm.name.split(" ").map((n: string) => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{dm.name}</p>
                        <span className="text-[10px] text-muted-foreground">{dm.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{dm.lastMessage}</p>
                    </div>
                    {dm.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[hsl(155,45%,32%)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {dm.unread}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Group Messages */}
      <Reveal delay={0.1}>
        <section>
          <h2 className="font-[Plus_Jakarta_Sans] font-bold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-[hsl(38,65%,42%)]" />
            Groups
          </h2>
          <div className="space-y-2">
            {groupMessages.map((gm: any) => (
              <Link key={gm.name} to="/dashboard/messages/direct">
                <Card className="border-border/40 shadow-sm rounded-xl hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[hsl(38,50%,92%)] flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-[hsl(38,65%,42%)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{gm.name}</p>
                        <span className="text-[10px] text-muted-foreground">{gm.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{gm.lastMessage}</p>
                    </div>
                    {gm.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[hsl(38,65%,42%)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {gm.unread}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
