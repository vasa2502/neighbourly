import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, useSendMessage } from "@/hooks/useMessagingData";

export default function DirectConversation() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("id") || "";
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useMessages(conversationId);
  const sendMessage = useSendMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !conversationId) return;
    const text = message;
    setMessage("");
    try {
      await sendMessage.mutateAsync({ conversationId, content: text, senderId: user?.id || "" });
    } catch {
      setMessage(text);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-0 pt-4 lg:pt-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-3 pb-4 border-b border-border/40">
        <Link to="/dashboard/messages" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground text-sm">Conversation</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No messages yet. Start the conversation!</div>
        )}
        {(messages as any[]).map((msg: any) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%]`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-[hsl(155,45%,32%)] text-white rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="pb-4 pt-2">
        <div className="flex items-center gap-2">
          <Input placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()} className="rounded-full h-11 flex-1" />
          <Button size="icon" className="w-11 h-11 rounded-full bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,26%)] shrink-0" onClick={handleSend} disabled={!message.trim() || sendMessage.isPending}>
            {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
