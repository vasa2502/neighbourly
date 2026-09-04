import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

// ─── List posts ───
export const list = query({
  args: {
    communityId: v.string(),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const cursor = args.cursor || 0;

    let results = await ctx.db
      .query("posts")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .collect();

    if (args.type) results = results.filter((p: any) => p.type === args.type);

    // Sort by newest first
    results.sort((a: any, b: any) => b.createdAt - a.createdAt);

    const total = results.length;
    const paginated = results.slice(cursor, cursor + limit);

    const enriched = [];
    for (const p of paginated) {
      const author = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), p.authorId))
        .first();
      const commentCount = await ctx.db
        .query("post_comments")
        .withIndex("by_post", (q: any) => q.eq("postId", p._id))
        .collect();
      const likes: string[] = (p as any).likes || [];
      enriched.push({
        ...p,
        user_profiles: author ? { name: author.name, avatar: author.avatar } : null,
        commentCount: commentCount.length,
        likeCount: likes.length,
      });
    }

    return { data: enriched, total, hasMore: cursor + limit < total, nextCursor: cursor + limit < total ? cursor + limit : null };
  },
});

// ─── Get post ───
export const get = query({
  args: { postId: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .first();
    if (!post) return null;

    const author = await ctx.db
      .query("user_profiles")
      .filter((q: any) => q.eq(q.field("_id"), post.authorId))
      .first();

    const comments = await ctx.db
      .query("post_comments")
      .withIndex("by_post", (q: any) => q.eq("postId", args.postId))
      .collect();

    const enrichedComments = [];
    for (const c of comments) {
      const commentAuthor = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), c.authorId))
        .first();
      enrichedComments.push({
        ...c,
        user_profiles: commentAuthor ? { name: commentAuthor.name, avatar: commentAuthor.avatar } : null,
      });
    }

    return {
      ...post,
      user_profiles: author ? { name: author.name, avatar: author.avatar } : null,
      comments: enrichedComments,
    };
  },
});

// ─── Create post ───
export const create = mutation({
  args: {
    communityId: v.string(),
    authorId: v.string(),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    images: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.authorId);

    if (!args.title.trim()) throw new Error("Post title is required");
    if (!args.body.trim()) throw new Error("Post body is required");
    if (args.title.length > 200) throw new Error("Title too long (max 200 characters)");
    if (args.body.length > 5000) throw new Error("Body too long (max 5000 characters)");

    const validTypes = ["ask", "help", "offer", "looking_for", "recommendation", "discussion", "interest", "lost_found", "buy_sell", "urgent"];
    if (!validTypes.includes(args.type)) throw new Error("Invalid post type");

    await requireRole(ctx, args.authorId, args.communityId, ["admin", "moderator", "host", "resident"]);

    const now = Date.now();
    return await ctx.db.insert("posts", {
      communityId: args.communityId,
      authorId: args.authorId,
      type: args.type,
      title: args.title.trim(),
      body: args.body.trim(),
      images: args.images,
      location: args.location,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ─── Comments ───
export const comments = query({
  args: { postId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("post_comments")
      .withIndex("by_post", (q: any) => q.eq("postId", args.postId))
      .collect();

    const enriched = [];
    for (const c of comments) {
      const author = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), c.authorId))
        .first();
      enriched.push({
        ...c,
        user_profiles: author ? { name: author.name, avatar: author.avatar } : null,
      });
    }
    return enriched.sort((a: any, b: any) => a.createdAt - b.createdAt);
  },
});

export const addComment = mutation({
  args: {
    postId: v.string(),
    authorId: v.string(),
    body: v.string(),
    parentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.authorId);
    if (!args.body.trim()) throw new Error("Comment cannot be empty");
    if (args.body.length > 2000) throw new Error("Comment too long (max 2000 characters)");

    return await ctx.db.insert("post_comments", {
      postId: args.postId,
      authorId: args.authorId,
      body: args.body.trim(),
      parentId: args.parentId,
      createdAt: Date.now(),
    });
  },
});

// ─── Likes ───
export const toggleLike = mutation({
  args: {
    postId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .first();
    if (!post) throw new Error("Post not found");

    const currentLikes: string[] = (post as any).likes || [];
    const index = currentLikes.indexOf(args.userId);

    if (index === -1) {
      // Add like
      await ctx.db.patch(post._id, { likes: [...currentLikes, args.userId] } as any);
    } else {
      // Remove like
      await ctx.db.patch(post._id, { likes: currentLikes.filter((id: string) => id !== args.userId) } as any);
    }

    return { liked: index === -1, likeCount: index === -1 ? currentLikes.length + 1 : currentLikes.length - 1 };
  },
});

export const getLikeStatus = query({
  args: {
    postId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .filter((q) => q.eq(q.field("_id"), args.postId))
      .first();
    if (!post) return { liked: false, likeCount: 0 };

    const likes: string[] = (post as any).likes || [];
    return {
      liked: args.userId ? likes.includes(args.userId) : false,
      likeCount: likes.length,
    };
  },
});
