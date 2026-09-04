import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

export const create = mutation({
  args: {
    referrerId: v.string(),
    referredEmail: v.string(),
    communityId: v.optional(v.string()),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.referrerId);

    if (!args.referredEmail.trim() || !args.referredEmail.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Check for duplicate referral
    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_referredEmail", (q: any) => q.eq("referredEmail", args.referredEmail))
      .first();
    if (existing && existing.referrerId === args.referrerId) {
      throw new Error("Already referred this email");
    }

    return await ctx.db.insert("referrals", {
      referrerId: args.referrerId,
      referredEmail: args.referredEmail.trim().toLowerCase(),
      communityId: args.communityId,
      type: args.type,
      status: "pending",
      creditAmount: 10,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: { referrerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q: any) => q.eq("referrerId", args.referrerId))
      .order("desc")
      .collect();
  },
});

export const getCredits = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q: any) => q.eq("referrerId", args.userId))
      .collect();

    const totalCredits = referrals
      .filter((r: any) => r.status === "credited")
      .reduce((sum: number, r: any) => sum + r.creditAmount, 0);

    return {
      totalCredits,
      pendingReferrals: referrals.filter((r: any) => r.status === "pending").length,
      completedReferrals: referrals.filter((r: any) => r.status === "credited").length,
    };
  },
});
