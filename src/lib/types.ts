/* ─── Community Types ─── */
export type CommunityType = "apartment" | "gated" | "villa" | "street" | "neighborhood";

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  area: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  description?: string;
  approximateResidents?: number;
  buildings?: string[];
  createdAt: string;
  founderId: string;
  adminId?: string;
  verified: boolean;
  status: "active" | "pending" | "suspended";
  residentCount: number;
  verifiedResidentCount: number;
  invitationCode?: string;
  coordinates?: { lat: number; lng: number };
}

/* ─── User / Role Types ─── */
export type UserRole = "resident" | "founder" | "admin" | "moderator" | "host";

export interface UserCommunityMembership {
  communityId: string;
  role: UserRole;
  verified: boolean;
  verificationStatus: "none" | "pending" | "approved" | "rejected";
  joinedAt: string;
  verifiedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  building?: string;
  floor?: string;
  interests: string[];
  sports: { name: string; skill: string; format: string }[];
  availability: { times: string[]; days: string[] };
  privacy: Record<string, number>;
  memberships: UserCommunityMembership[];
  referralCode: string;
  referralCredits: number;
  subscription: SubscriptionStatus;
  country: string;
  onboardingCompleted?: boolean;
  createdAt: string;
}

/* ─── Verification Types ─── */
export type VerificationMethod = "invite_code" | "invitation" | "email" | "admin_approval" | "proof" | "address";

export interface VerificationRequest {
  id: string;
  userId: string;
  communityId: string;
  method: VerificationMethod;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  data: Record<string, string>;
  rejectionReason?: string;
}

/* ─── Subscription Types ─── */
export type SubscriptionTier = "free" | "resident_plus" | "host_pro" | "community_partner";

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  billingCycle: "monthly" | "annual" | null;
  expiresAt: string | null;
  credits: number;
  country: string;
}

export interface PricingRegion {
  country: string;
  currency: string;
  symbol: string;
  monthly: number;
  annual: number;
  annualMonthly: number;
}

/* ─── Referral Types ─── */
export interface Referral {
  id: string;
  referrerId: string;
  referredEmail: string;
  referredUserId?: string;
  communityId?: string;
  type: "existing_resident" | "new_community";
  status: "pending" | "verified" | "credited" | "expired";
  createdAt: string;
  creditedAt?: string;
  creditAmount: number;
}

/* ─── Community Claim Types ─── */
export interface CommunityClaim {
  id: string;
  communityId: string;
  claimantId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  evidence: string;
  rejectionReason?: string;
}

/* ─── Activity Types ─── */
export interface Activity {
  id: string;
  communityId: string;
  title: string;
  description?: string;
  category: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  hostId: string;
  skillLevel?: string;
  format?: string;
  isFree: boolean;
  price?: number;
}

/* ─── Club Types ─── */
export interface Club {
  id: string;
  communityId: string;
  name: string;
  category: string;
  description?: string;
  memberCount: number;
  createdBy: string;
}

/* ─── Post Types ─── */
export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  type: "ask" | "help" | "offer" | "looking_for" | "recommendation" | "discussion" | "interest" | "lost_found" | "buy_sell" | "urgent";
  title: string;
  body: string;
  images?: string[];
  location?: string;
  status: "active" | "resolved" | "expired" | "removed";
  createdAt: string;
  updatedAt: string;
}
