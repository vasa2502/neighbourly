import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();
  },
});

export const getHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("user_profiles")
      .filter((q: any) => q.eq(q.field("_id"), args.userId))
      .first();
    return profile?.subscription || null;
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    tier: v.string(),
    billingCycle: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const validTiers = ["free", "resident_plus", "host_pro", "community_partner"];
    if (!validTiers.includes(args.tier)) throw new Error("Invalid subscription tier");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        tier: args.tier,
        billingCycle: args.billingCycle,
        expiresAt: args.expiresAt,
        status: "active",
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        tier: args.tier,
        status: "active",
        billingCycle: args.billingCycle,
        expiresAt: args.expiresAt,
        createdAt: Date.now(),
      });
    }
    return { success: true };
  },
});

export const cancel = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();
    if (sub) {
      await ctx.db.patch(sub._id, { status: "canceled" });
    }
    return { success: true };
  },
});
