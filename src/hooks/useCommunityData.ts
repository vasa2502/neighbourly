// Re-export all community-related hooks from the centralized Convex data layer
export {
  useSearchCommunities,
  useCommunityDetail as useCommunity,
  useCreateCommunity,
  useUserMemberships,
  useJoinCommunity,
  useSubmitVerification,
  useProfile,
  useUpdateProfile,
  useFindDuplicates,
  useFindNearby,
  useCommunityMembers,
  useCommunityClaims,
  useApproveClaim,
  useRejectClaim,
  useEnsureUserProfile,
} from "./useConvexData";
