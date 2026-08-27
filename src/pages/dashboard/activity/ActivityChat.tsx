import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Send, Users, Info } from "lucide-react";
import { useActivityMessages, useSendActivityMessage, useActivityDetail } from "@/hooks/useActivityClubPostData";
import { useAuth } from "@/contexts/AuthContext";

export default function ActivityChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: activity } = useActivityDetail(id || "");
  const { data: messages = [] } = useActivityMessages(id || "");
  const sendMessage = useSendActivityMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !id) return;
    const text = message;
    setMessage("");
    try {
      await sendMessage.mutateAsync({ activityId: id, content: text });
    } catch {
      setMessage(text);
    }
  };

  const hostName = (activity as any)?.user_profiles?.name || "Host";

  return (
    <div className="max-w-2xl mx-auto px-4 pb-0 pt-4 lg:pt-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/40">
        <Link to={`/dashboard/activities/${id}`} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground text-sm truncate">{(activity as any)?.title || "Activity Chat"}</h2>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{(activity as any)?.current_participants || 0} participants</p>
        </div>
        <Info className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.sender_id === user?.id;
          const isHost = msg.sender_id === (activity as any)?.host_id;
          const authorName = msg.user_profiles?.name || "Anonymous";
          const time = new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${!isMe ? "text-left" : ""}`}>
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-foreground">{authorName}</span>
                    {isHost && <span className="text-[9px] font-bold text-[hsl(155,45%,32%)] bg-[hsl(155,45%,92%)] px-1.5 py-0.5 rounded-full">Host</span>}
                    <span className="text-[10px] text-muted-foreground">{time}</span>
                  </div>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-[hsl(155,45%,32%)] text-white rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pb-4 pt-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="rounded-full h-11 flex-1"
          />
          <Button
            size="icon"
            className="w-11 h-11 rounded-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] shrink-0"
            onClick={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
