import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";

/* ─── Messages ─── */

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => api.getConversations(user!.id),
    enabled: !!user,
    staleTime: 15_000,
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => api.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5_000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      api.sendMessage(conversationId, user!.id, content),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

/* ─── Notifications ─── */

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => api.getNotifications(user!.id),
    enabled: !!user,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/* ─── Referrals (with anti-abuse validation) ─── */

export function useReferrals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: () => api.getReferrals(user!.id),
    enabled: !!user,
  });
}

export function useCreateReferral() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ referredEmail, communityId, type }: { referredEmail: string; communityId?: string; type?: string }) => {
      // Run anti-abuse validation first
      if (!user) throw new Error("Not authenticated");
      const validation = await api.validateReferral(user.id, referredEmail);
      if (!validation.valid) {
        throw new Error(validation.reason || "Referral not allowed");
      }
      // Validation passed, create the referral
      const referral = await api.createReferral(user.id, referredEmail, communityId, type);
      // Send invitation email (fire and forget - don't block on email)
      const profile = await api.getOrCreateProfile(user.id).catch(() => null);
      api.sendInvitationEmail({
        to: referredEmail,
        communityName: "your community",
        inviterName: profile?.name || "A JOINN member",
        inviteLink: `https://joinn.app/invite/${profile?.referral_code || ""}`,
        type: "referral_invite",
      }).catch(() => {}); // Don't fail the referral if email fails
      return referral;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referrals"] });
    },
  });
}

/* ─── Subscriptions ─── */

export function useSubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: () => api.getSubscription(user!.id),
    enabled: !!user,
  });
}

/* ─── Polls ─── */

export function usePolls(communityId: string) {
  return useQuery({
    queryKey: ["polls", communityId],
    queryFn: () => api.getPolls(communityId),
    enabled: !!communityId,
  });
}

/* ─── Announcements ─── */

export function useAnnouncements(communityId: string) {
  return useQuery({
    queryKey: ["announcements", communityId],
    queryFn: () => api.getAnnouncements(communityId),
    enabled: !!communityId,
    staleTime: 30_000,
  });
}

/* ─── Community Claims ─── */

export function useSubmitClaim() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ communityId, organizationName, roleTitle, evidence }: {
      communityId: string;
      organizationName: string;
      roleTitle: string;
      evidence: string;
    }) => api.submitClaim(user!.id, communityId, { organizationName, roleTitle, evidence }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-claims"] });
    },
  });
}

/* ─── Global Search ─── */

export function useGlobalSearch(query: string, communityId?: string) {
  return useQuery({
    queryKey: ["globalSearch", query, communityId],
    queryFn: () => api.globalSearch(query, communityId),
    enabled: query.length >= 2,
    staleTime: 15_000,
  });
}
