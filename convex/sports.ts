import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

export const getAvailability = query({
  args: { communityId: v.string(), sport: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("player_availability")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();
    if (args.sport) results = results.filter((r: any) => r.sport === args.sport);
    results = results.filter((r: any) => r.isAvailable);

    const enriched = [];
    for (const r of results) {
      const profile = await ctx.db.query("user_profiles").filter((q: any) => q.eq(q.field("_id"), r.userId)).first();
      enriched.push({ ...r, user_profiles: profile ? { name: profile.name, avatar: profile.avatar } : null });
    }
    return enriched;
  },
});

export const getMyAvailability = query({
  args: { userId: v.string(), communityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("player_availability")
      .withIndex("by_user_community", (q: any) =>
        q.eq("userId", args.userId).eq("communityId", args.communityId)
      )
      .collect();
  },
});

export const setAvailability = mutation({
  args: {
    userId: v.string(),
    communityId: v.string(),
    sport: v.string(),
    dayOfWeek: v.string(),
    timeStart: v.string(),
    timeEnd: v.string(),
    skillLevel: v.optional(v.string()),
    notes: v.optional(v.string()),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (!validDays.includes(args.dayOfWeek)) throw new Error("Invalid day of week");
    if (!args.sport.trim()) throw new Error("Sport is required");

    // Check if availability already exists for this combination
    const existing = await ctx.db
      .query("player_availability")
      .withIndex("by_user_community", (q: any) =>
        q.eq("userId", args.userId).eq("communityId", args.communityId)
      )
      .collect();

    const match = existing.find(
      (e: any) => e.sport === args.sport && e.dayOfWeek === args.dayOfWeek && e.timeStart === args.timeStart
    );

    if (match) {
      await ctx.db.patch(match._id, { isAvailable: args.isAvailable, skillLevel: args.skillLevel, notes: args.notes, timeEnd: args.timeEnd });
      return match._id;
    }

    return await ctx.db.insert("player_availability", {
      userId: args.userId,
      communityId: args.communityId,
      sport: args.sport.trim(),
      dayOfWeek: args.dayOfWeek,
      timeStart: args.timeStart,
      timeEnd: args.timeEnd,
      skillLevel: args.skillLevel,
      notes: args.notes,
      isAvailable: args.isAvailable,
      createdAt: Date.now(),
    });
  },
});
