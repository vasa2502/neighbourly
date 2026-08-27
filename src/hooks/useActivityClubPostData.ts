import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";

/* ─── Activities ─── */

export function useActivities(communityId: string, filters?: { date?: string; category?: string }) {
  return useQuery({
    queryKey: ["activities", communityId, filters],
    queryFn: () => api.getActivities(communityId, filters),
    enabled: !!communityId,
    staleTime: 30_000,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activity: Parameters<typeof api.createActivity>[0]) => api.createActivity(activity),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["activities", variables.communityId] });
    },
  });
}

export function useJoinActivity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (activityId: string) => api.joinActivity(activityId, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useLeaveActivity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (activityId: string) => api.leaveActivity(activityId, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

/* ─── Clubs ─── */

export function useClubs(communityId: string) {
  return useQuery({
    queryKey: ["clubs", communityId],
    queryFn: () => api.getClubs(communityId),
    enabled: !!communityId,
    staleTime: 30_000,
  });
}

export function useCreateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (club: Parameters<typeof api.createClub>[0]) => api.createClub(club),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["clubs", variables.communityId] });
    },
  });
}

export function useJoinClub() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (clubId: string) => api.joinClub(clubId, user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
    },
  });
}

/* ─── Posts ─── */

export function usePosts(communityId: string, type?: string) {
  return useQuery({
    queryKey: ["posts", communityId, type],
    queryFn: () => api.getPosts(communityId, type),
    enabled: !!communityId,
    staleTime: 30_000,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: Parameters<typeof api.createPost>[0]) => api.createPost(post),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["posts", variables.communityId] });
    },
  });
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => api.getPostComments(postId),
    enabled: !!postId,
    staleTime: 15_000,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ postId, body, parentId }: { postId: string; body: string; parentId?: string }) =>
      api.addComment(postId, user!.id, body, parentId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}

/* ─── Activity Detail ─── */

export function useActivityDetail(id: string) {
  return useQuery({
    queryKey: ["activity", id],
    queryFn: () => api.getActivityById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useActivityParticipants(activityId: string) {
  return useQuery({
    queryKey: ["activityParticipants", activityId],
    queryFn: () => api.getActivityParticipants(activityId),
    enabled: !!activityId,
    staleTime: 15_000,
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) => api.updateActivity(id, updates),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["activity", variables.id] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteActivity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useSubmitActivityFeedback() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ activityId, rating, comment }: { activityId: string; rating: number; comment?: string }) =>
      api.submitActivityFeedback(activityId, user!.id, rating, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

/* ─── Activity Messages ─── */

export function useActivityMessages(activityId: string) {
  return useQuery({
    queryKey: ["activityMessages", activityId],
    queryFn: () => api.getActivityMessages(activityId),
    enabled: !!activityId,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}

export function useSendActivityMessage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ activityId, content }: { activityId: string; content: string }) =>
      api.sendActivityMessage(activityId, user!.id, content),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["activityMessages", variables.activityId] });
    },
  });
}

/* ─── Polls ─── */

export function useCreatePoll() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (poll: { communityId: string; question: string; options: string[]; anonymous?: boolean }) =>
      api.createPoll({ community_id: poll.communityId, creator_id: user!.id, question: poll.question, options: poll.options, anonymous: poll.anonymous }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["polls", variables.communityId] });
    },
  });
}

export function useVotePoll() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) =>
      api.votePoll(pollId, user!.id, optionIndex),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["pollResults", variables.pollId] });
    },
  });
}

export function usePollResults(pollId: string) {
  return useQuery({
    queryKey: ["pollResults", pollId],
    queryFn: () => api.getPollResults(pollId),
    enabled: !!pollId,
  });
}

/* ─── Club Members ─── */

export function useClubMembers(clubId: string) {
  return useQuery({
    queryKey: ["clubMembers", clubId],
    queryFn: () => api.getClubMembers(clubId),
    enabled: !!clubId,
    staleTime: 30_000,
  });
}

/* ─── Announcement Detail ─── */

export function useAnnouncementDetail(id: string) {
  return useQuery({
    queryKey: ["announcement", id],
    queryFn: () => api.getAnnouncementById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/* ─── Community Info ─── */

export function useCommunityRules(communityId: string) {
  return useQuery({
    queryKey: ["communityRules", communityId],
    queryFn: () => api.getCommunityRules(communityId),
    enabled: !!communityId,
    staleTime: 60_000,
  });
}

export function useCommunityDocuments(communityId: string) {
  return useQuery({
    queryKey: ["communityDocuments", communityId],
    queryFn: () => api.getCommunityDocuments(communityId),
    enabled: !!communityId,
    staleTime: 60_000,
  });
}

export function useCommunityFacilities(communityId: string) {
  return useQuery({
    queryKey: ["communityFacilities", communityId],
    queryFn: () => api.getCommunityFacilities(communityId),
    enabled: !!communityId,
    staleTime: 60_000,
  });
}

export function useCommunityContacts(communityId: string) {
  return useQuery({
    queryKey: ["communityContacts", communityId],
    queryFn: () => api.getCommunityContacts(communityId),
    enabled: !!communityId,
    staleTime: 60_000,
  });
}

/* ─── Moderation ─── */

export function useModerationReports(communityId: string) {
  return useQuery({
    queryKey: ["moderationReports", communityId],
    queryFn: () => api.getModerationReports(communityId),
    enabled: !!communityId,
    staleTime: 15_000,
  });
}

export function useDismissReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.dismissReport,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["moderationReports"] }); },
  });
}

export function useRemoveReportContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.removeReportContent,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["moderationReports"] }); },
  });
}

export function useSuspendUser() {
  return useMutation({
    mutationFn: ({ userId, communityId, reason }: { userId: string; communityId: string; reason: string }) =>
      api.suspendUser(userId, communityId, reason),
  });
}

/* ─── Sports ─── */

export function useActivitiesByCategory(communityId: string, category: string) {
  return useQuery({
    queryKey: ["activities", communityId, "category", category],
    queryFn: () => api.getActivitiesByCategory(communityId, category),
    enabled: !!communityId && !!category,
    staleTime: 30_000,
  });
}

export function useUserSportsProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sportsProfile", user?.id],
    queryFn: () => api.getUserSportsProfile(user!.id),
    enabled: !!user,
  });
}

/* ─── Host Stats ─── */

export function useHostStats(communityId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["hostStats", user?.id, communityId],
    queryFn: () => api.getHostStats(user!.id, communityId),
    enabled: !!user && !!communityId,
    staleTime: 30_000,
  });
}

/* ─── Player Availability ─── */

export function usePlayerAvailability(communityId: string, sport?: string) {
  return useQuery({
    queryKey: ["playerAvailability", communityId, sport],
    queryFn: () => api.getPlayerAvailability(communityId, sport),
    enabled: !!communityId,
    staleTime: 15_000,
  });
}

export function useMyAvailability() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myAvailability", user?.id],
    queryFn: () => api.getMyAvailability(user!.id),
    enabled: !!user,
  });
}

export function useSetPlayerAvailability() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ communityId, availability }: {
      communityId: string;
      availability: { sport: string; day_of_week: string; time_start: string; time_end: string; skill_level?: string; notes?: string }[]
    }) => api.setPlayerAvailability(user!.id, communityId, availability),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playerAvailability"] });
      qc.invalidateQueries({ queryKey: ["myAvailability"] });
    },
  });
}

/* ─── Ad Marketplace ─── */

export function useAdSlots(communityId?: string) {
  return useQuery({
    queryKey: ["adSlots", communityId],
    queryFn: () => api.getAdSlots(communityId),
    staleTime: 15_000,
  });
}

export function usePlaceBid() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ slotId, amount, message }: { slotId: string; amount: number; message?: string }) =>
      api.placeBid(slotId, user!.id, amount, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adSlots"] });
    },
  });
}

export function useBidsForSlot(slotId: string) {
  return useQuery({
    queryKey: ["adBids", slotId],
    queryFn: () => api.getBidsForSlot(slotId),
    enabled: !!slotId,
  });
}

/* ─── Campaigns ─── */

export function useCampaigns() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["campaigns", user?.id],
    queryFn: () => api.getCampaigns(user!.id),
    enabled: !!user,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (campaign: Omit<Parameters<typeof api.createCampaign>[0], "advertiser_id">) =>
      api.createCampaign({ ...campaign, advertiser_id: user!.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["partnerStats"] });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, updates }: { campaignId: string; updates: Record<string, unknown> }) =>
      api.updateCampaign(campaignId, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function usePartnerStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["partnerStats", user?.id],
    queryFn: () => api.getPartnerStats(user!.id),
    enabled: !!user,
    staleTime: 30_000,
  });
}
