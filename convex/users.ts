import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

// ─── Get or create user profile ───
export const getOrCreate = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const existing = await ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .first();
    if (existing) return existing;

    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const now = Date.now();
    await ctx.db.insert("user_profiles", {
      email: args.email,
      name: args.name || "",
      avatar: args.avatar,
      interests: [],
      sports: [],
      referralCode,
      referralCredits: 0,
      country: args.country || "US",
      createdAt: now,
    } as any);
    return await ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

// ─── Get user profile ───
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("_id"), args.userId))
      .first();
  },
});

// ─── Update profile ───
export const update = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    building: v.optional(v.string()),
    floor: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    sports: v.optional(
      v.array(
        v.object({
          name: v.string(),
          skill: v.string(),
          format: v.string(),
        })
      )
    ),
    availability: v.optional(
      v.object({
        times: v.array(v.string()),
        days: v.array(v.string()),
      })
    ),
    privacy: v.optional(v.any()),
    notificationPrefs: v.optional(v.any()),
    country: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const { userId, ...updates } = args;
    const profile = await ctx.db
      .query("user_profiles")
      .filter((q) => q.eq(q.field("_id"), userId))
      .first();
    if (!profile) throw new Error("Profile not found");

    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) filteredUpdates[key] = value;
    }

    await ctx.db.patch(profile._id, filteredUpdates);
    return await ctx.db.get(profile._id);
  },
});
