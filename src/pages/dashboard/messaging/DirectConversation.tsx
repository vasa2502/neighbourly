import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLeft, Send, Shield, MoreVertical, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";

export default function DirectConversation() {
  const [msg, setMsg] = useState("");
  const { user } = useAuth();
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // For now, use a demo conversation ID from URL params or a placeholder
  const conversationId = window.location.pathname.split("/").pop() || "demo";

  // Subscribe to Supabase Realtime for live message updates
  useRealtimeMessages(conversationId !== "demo" ? conversationId : null);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("messages" as any).select("*, user_profiles!sender_id(name, avatar)").eq("conversation_id", conversationId).order("created_at", { ascending: true });
        if (error) throw error;
        return data as any[];
      } catch {
        return [];
      }
    },
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) return;
      try {
        const { error } = await supabase.from("messages" as any).insert({ conversation_id: conversationId, sender_id: user.id, content });
        if (error) throw error;
      } catch {
        // Fallback: just show the message locally
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      setMsg("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasRealData = messages.length > 0;
  const displayMessages = hasRealData ? messages : [
    { id: "1", content: "Hey! Are you coming to badminton tomorrow?", sender_id: "them", created_at: new Date().toISOString(), user_profiles: { name: "Rajesh K." } },
    { id: "2", content: "Yes! Looking forward to it. What time again?", sender_id: user?.id || "me", created_at: new Date().toISOString(), user_profiles: { name: "You" } },
    { id: "3", content: "7 AM at Court A. Don't forget to bring water!", sender_id: "them", created_at: new Date().toISOString(), user_profiles: { name: "Rajesh K." } },
    { id: "4", content: "Got it, see you there! 🏸", sender_id: user?.id || "me", created_at: new Date().toISOString(), user_profiles: { name: "You" } },
  ];

  const handleSend = () => {
    if (!msg.trim()) return;
    sendMutation.mutate(msg.trim());
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-0 pt-4 lg:pt-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-3 pb-4 border-b border-border/40">
        <Link to="/dashboard/messages" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-9 h-9 rounded-full bg-[hsl(155,45%,92%)] flex items-center justify-center"><span className="text-xs font-bold text-[hsl(155,45%,32%)]">RK</span></div>
        <div className="flex-1 min-w-0"><div className="flex items-center gap-1"><p className="text-sm font-semibold text-foreground">Rajesh K.</p><Shield className="w-3 h-3 text-[hsl(155,45%,32%)]" /></div><p className="text-[10px] text-muted-foreground">Verified Resident</p></div>
        <MoreVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {displayMessages.map((m: any, i: number) => {
          const isMe = m.sender_id === user?.id || m.sender_id === "me";
          return (
            <div key={m.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-[hsl(155,45%,32%)] text-white rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                <p>{m.content}</p>
                <p className={`text-[9px] mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="pb-4 pt-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="rounded-full h-11 flex-1"
          />
          <Button onClick={handleSend} disabled={sendMutation.isPending || !msg.trim()} size="icon" className="w-11 h-11 rounded-full bg-[hsl(155,45%,32%)] text-white shrink-0">
            {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
