import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

export const checkIn = mutation({
  args: {
    activityId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    // Verify user is a participant
    const participation = await ctx.db
      .query("activity_participants")
      .withIndex("by_activity_user", (q: any) =>
        q.eq("activityId", args.activityId).eq("userId", args.userId)
      )
      .first();
    if (!participation) throw new Error("Must be a participant to check in");

    // Check for duplicate check-in
    const existing = await ctx.db
      .query("activity_feedback")
      .filter((q: any) =>
        q.eq(q.field("activityId"), args.activityId) && q.eq(q.field("userId"), args.userId)
      )
      .first();
    if (existing) throw new Error("Already checked in");

    await ctx.db.insert("activity_feedback", {
      activityId: args.activityId,
      userId: args.userId,
      rating: 5, // Default rating for check-in
      comment: "Checked in",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const getAttendance = query({
  args: { activityId: v.string() },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("activity_participants")
      .withIndex("by_activity", (q: any) => q.eq("activityId", args.activityId))
      .collect();

    const feedback = await ctx.db
      .query("activity_feedback")
      .filter((q: any) => q.eq(q.field("activityId"), args.activityId))
      .collect();

    const checkedInIds = feedback.filter((f: any) => f.comment === "Checked in").map((f: any) => f.userId);

    const enriched = [];
    for (const p of participants) {
      const profile = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), p.userId))
        .first();
      enriched.push({
        ...p,
        user_profiles: profile ? { name: profile.name, avatar: profile.avatar } : null,
        checkedIn: checkedInIds.includes(p.userId),
      });
    }

    return {
      participants: enriched,
      total: participants.length,
      checkedIn: checkedInIds.length,
    };
  },
});
