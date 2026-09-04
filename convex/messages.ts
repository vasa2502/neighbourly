import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

// ─── Conversations list ───
export const conversations = query({
  args: { userId: v.string(), limit: v.optional(v.number()), cursor: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const cursor = args.cursor || 0;

    // Get all conversation memberships for this user
    const myMemberships = await ctx.db
      .query("conversation_members")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();

    const convIds = myMemberships.map((m: any) => m.conversationId);

    // Get conversations
    const allConversations = [];
    for (const convId of convIds) {
      const conv = await ctx.db.query("conversations").filter((q: any) => q.eq(q.field("_id"), convId)).first();
      if (!conv) continue;

      // Get other members
      const members = await ctx.db
        .query("conversation_members")
        .withIndex("by_conversation", (q: any) => q.eq("conversationId", convId))
        .collect();

      const otherMembers = members.filter((m: any) => m.userId !== args.userId);
      const memberProfiles = [];
      for (const m of otherMembers) {
        const profile = await ctx.db
          .query("user_profiles")
          .filter((q: any) => q.eq(q.field("_id"), m.userId))
          .first();
        if (profile) memberProfiles.push({ name: profile.name, avatar: profile.avatar });
      }

      // Get last message
      const lastMsg = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q: any) => q.eq("conversationId", convId))
        .order("desc")
        .first();

      allConversations.push({
        ...conv,
        otherMembers: memberProfiles,
        lastMessage: lastMsg,
      });
    }

    // Sort by last message time
    allConversations.sort((a: any, b: any) => {
      const aTime = a.lastMessage?.createdAt || a.updatedAt;
      const bTime = b.lastMessage?.createdAt || b.updatedAt;
      return bTime - aTime;
    });

    const total = allConversations.length;
    const paginated = allConversations.slice(cursor, cursor + limit);
    return { data: paginated, total, hasMore: cursor + limit < total, nextCursor: cursor + limit < total ? cursor + limit : null };
  },
});

// ─── Messages in a conversation ───
export const messages = query({
  args: { conversationId: v.string(), limit: v.optional(v.number()), cursor: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const cursor = args.cursor || 0;

    const all = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    const total = all.length;
    const paginated = all.slice(cursor, cursor + limit);

    const enriched = [];
    for (const m of paginated) {
      const sender = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), m.senderId))
        .first();
      enriched.push({
        ...m,
        user_profiles: sender ? { name: sender.name, avatar: sender.avatar } : null,
      });
    }
    return { data: enriched, total, hasMore: cursor + limit < total, nextCursor: cursor + limit < total ? cursor + limit : null };
  },
});

// ─── Send message ───
export const send = mutation({
  args: {
    conversationId: v.string(),
    senderId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.senderId);
    if (!args.content.trim()) throw new Error("Message cannot be empty");
    if (args.content.length > 2000) throw new Error("Message too long (max 2000 characters)");

    // Verify sender is a member of this conversation
    const membership = await ctx.db
      .query("conversation_members")
      .withIndex("by_conversation_user", (q: any) =>
        q.eq("conversationId", args.conversationId).eq("userId", args.senderId)
      )
      .first();
    if (!membership) throw new Error("Not a member of this conversation");

    const msgId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content.trim(),
      createdAt: Date.now(),
    });

    // Update conversation timestamp
    const conv = await ctx.db
      .query("conversations")
      .filter((q: any) => q.eq(q.field("_id"), args.conversationId))
      .first();
    if (conv) {
      await ctx.db.patch(conv._id, { updatedAt: Date.now() });
    }

    return msgId;
  },
});
