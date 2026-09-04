import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/**
 * Seed a full demo community with realistic data.
 * Called once from the admin dashboard or onboarding.
 */
export const seedDemoCommunity = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if demo community already exists
    const existing = await ctx.db
      .query("communities")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();
    if (existing) return { communityId: existing._id, alreadySeeded: true };

    const now = Date.now();

    // Create community
    const communityId = await ctx.db.insert("communities", {
      name: "Green Valley Residency",
      type: "gated",
      area: "Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      postalCode: "560066",
      description: "A vibrant gated community in the heart of Whitefield with world-class amenities and a tight-knit resident community.",
      approximateResidents: 450,
      buildings: ["Tower A", "Tower B", "Tower C", "Club House"],
      founderId: "system",
      verified: true,
      status: "active",
      residentCount: 0,
      verifiedResidentCount: 0,
      createdAt: now,
    });

    // Seed community info
    const rules = [
      { title: "Quiet Hours", description: "Maintain silence between 10:00 PM and 7:00 AM. No loud music or construction during these hours.", sortOrder: 1 },
      { title: "Visitor Policy", description: "All visitors must be registered at the gate. Overnight guests require prior approval from the management.", sortOrder: 2 },
      { title: "Parking Rules", description: "Only designated parking spots may be used. Visitor parking is in the basement Level B2.", sortOrder: 3 },
      { title: "Pet Policy", description: "Pets must be leashed in common areas. Clean up after your pet. Large breeds restricted in elevators during peak hours.", sortOrder: 4 },
      { title: "Waste Management", description: "Segregate waste into wet, dry, and hazardous. Drop-off timings: 7-9 AM and 6-8 PM.", sortOrder: 5 },
    ];
    for (const rule of rules) {
      await ctx.db.insert("community_rules", { ...rule, communityId, createdAt: now });
    }

    const facilities = [
      { name: "Swimming Pool", description: "Olympic-size heated pool with separate kids pool", type: "recreation", hours: "6:00 AM - 9:00 PM", rules: "No diving. Children under 12 must be accompanied by an adult." },
      { name: "Gymnasium", description: "Fully equipped gym with cardio and strength zones", type: "fitness", hours: "5:00 AM - 10:00 PM", rules: "Wipe equipment after use. No shoes on the mat area." },
      { name: "Tennis Court", description: "2 professional-grade tennis courts with floodlights", type: "sports", hours: "6:00 AM - 9:00 PM", rules: "Book via the app. Max 2-hour slots." },
      { name: "Badminton Court", description: "Indoor badminton court with wooden flooring", type: "sports", hours: "6:00 AM - 9:00 PM", rules: "Indoor shoes mandatory." },
      { name: "Children's Play Area", description: "Age-appropriate play equipment for toddlers and older kids", type: "family", hours: "7:00 AM - 7:00 PM", rules: "Adult supervision required at all times." },
      { name: "Club House", description: "Multi-purpose hall for events, meetings, and celebrations", type: "events", hours: "Open 24/7 (book in advance)", rules: "Book at least 48 hours in advance. Clean up after use." },
      { name: "Jogging Track", description: "1.5 km jogging track around the community perimeter", type: "fitness", hours: "Open 24/7", rules: "No cycling on the jogging track." },
      { name: "Library", description: "Quiet reading space with 2000+ books and digital access", type: "learning", hours: "8:00 AM - 8:00 PM", rules: "Maintain silence. Return books within 14 days." },
    ];
    for (const facility of facilities) {
      await ctx.db.insert("community_facilities", { ...facility, communityId, createdAt: now });
    }

    const contacts = [
      { name: "Security Control Room", type: "emergency", phone: "+91-80-4567-0001", available24x7: true },
      { name: "Maintenance Helpdesk", type: "maintenance", phone: "+91-80-4567-0002", email: "maint@greenvalley.in", available24x7: false },
      { name: "Society Office", type: "management", phone: "+91-80-4567-0003", email: "admin@greenvalley.in", available24x7: false },
      { name: "Fire Emergency", type: "emergency", phone: "101", available24x7: true },
      { name: "Medical Emergency", type: "emergency", phone: "108", available24x7: true },
      { name: "Plumber - Ramesh", type: "maintenance", phone: "+91-98-4567-0010", available24x7: false },
    ];
    for (const contact of contacts) {
      await ctx.db.insert("community_contacts", { ...contact, communityId, createdAt: now });
    }

    const documents = [
      { title: "Community Bylaws 2024", description: "Complete set of community rules and regulations", url: "#", type: "pdf" },
      { title: "Monthly Maintenance Bill Template", description: "Standard template for monthly maintenance charges", url: "#", type: "pdf" },
      { title: "Event Booking Form", description: "Form to book the club house or common areas", url: "#", type: "pdf" },
      { title: "Visitor Parking Pass", description: "Printable visitor parking pass for guests", url: "#", type: "pdf" },
    ];
    for (const doc of documents) {
      await ctx.db.insert("community_documents", { ...doc, communityId, createdAt: now });
    }

    // Seed activities
    const activities = [
      { title: "Morning Yoga Session", description: "Start your day with rejuvenating yoga by the poolside. All levels welcome!", category: "Fitness", date: getNextWeekday(1), time: "6:30 AM", endTime: "7:30 AM", location: "Poolside Deck", maxParticipants: 20, currentParticipants: 8, hostId: "demo-host-1", skillLevel: "All levels", format: "Individual", isFree: true, status: "active" },
      { title: "Weekend Cricket Match", description: "5-over fun cricket match. Bring your own gear or borrow from the clubhouse.", category: "Sports", date: getNextWeekday(6), time: "4:00 PM", endTime: "6:00 PM", location: "Cricket Ground", maxParticipants: 22, currentParticipants: 14, hostId: "demo-host-2", skillLevel: "Intermediate", format: "Team", isFree: true, status: "active" },
      { title: "Board Game Night", description: "Catan, Codenames, Uno, and more! Fun for the whole family.", category: "Social", date: getNextWeekday(5), time: "7:00 PM", endTime: "9:00 PM", location: "Club House", maxParticipants: 30, currentParticipants: 12, hostId: "demo-host-1", skillLevel: "All levels", format: "Flexible", isFree: true, status: "active" },
      { title: "Kids Art Workshop", description: "Creative art session for kids aged 5-12. Materials provided.", category: "Kids", date: getNextWeekday(0), time: "10:00 AM", endTime: "12:00 PM", location: "Library", maxParticipants: 15, currentParticipants: 9, hostId: "demo-host-3", skillLevel: "Beginner", format: "Individual", isFree: true, status: "active" },
      { title: "Tennis Tournament", description: "Singles knockout tournament. Registration closes 2 days before.", category: "Sports", date: getNextWeekday(7), time: "8:00 AM", endTime: "2:00 PM", location: "Tennis Courts", maxParticipants: 16, currentParticipants: 11, hostId: "demo-host-2", skillLevel: "Advanced", format: "Singles", isFree: false, price: 200, status: "active" },
      { title: "Photography Walk", description: "Explore the community gardens and capture the beauty of nature.", category: "Hobby", date: getNextWeekday(3), time: "5:30 PM", endTime: "7:00 PM", location: "Community Gardens", maxParticipants: 12, currentParticipants: 6, hostId: "demo-host-1", skillLevel: "All levels", format: "Individual", isFree: true, status: "active" },
    ];

    const activityIds: string[] = [];
    for (const act of activities) {
      const id = await ctx.db.insert("activities", { ...act, communityId, updatedAt: now, createdAt: now });
      activityIds.push(id);
    }

    // Seed clubs
    const clubs = [
      { name: "Green Valley Cricket Club", category: "Sports", description: "For cricket enthusiasts. Practice sessions every Saturday.", memberCount: 18, createdBy: "demo-host-2", status: "active" },
      { name: "Fitness Freaks", category: "Fitness", description: "Daily morning workouts, running groups, and fitness challenges.", memberCount: 25, createdBy: "demo-host-1", status: "active" },
      { name: "Book Worms", category: "Hobby", description: "Monthly book club meetings. Currently reading: Atomic Habits.", memberCount: 12, createdBy: "demo-host-3", status: "active" },
      { name: "Photography Club", category: "Hobby", description: "Share your best shots, learn techniques, organize photo walks.", memberCount: 8, createdBy: "demo-host-1", status: "active" },
      { name: "Parents Circle", category: "Social", description: "A safe space for parents to share tips, organize kids' activities.", memberCount: 30, createdBy: "demo-host-3", status: "active" },
    ];

    for (const club of clubs) {
      await ctx.db.insert("clubs", { ...club, communityId, updatedAt: now, createdAt: now });
    }

    // Seed announcements
    const announcements = [
      { title: "Annual General Meeting - September 15", body: "Dear residents, the Annual General Meeting is scheduled for September 15 at 6:00 PM in the Club House. Agenda includes budget review, facility upgrades, and election of new committee members. Your participation is important!", authorId: "demo-host-1", pinned: true, status: "active" },
      { title: "Water Tank Cleaning Schedule", body: "Water tank cleaning will be done on September 10-12 for all towers. Please store adequate water. Tower A: Sep 10, Tower B: Sep 11, Tower C: Sep 12. Timing: 10 AM to 2 PM.", authorId: "demo-host-1", pinned: false, status: "active" },
      { title: "New EV Charging Stations Now Available", body: "We're excited to announce 4 new EV charging stations in the basement parking (Level B1). Available 24/7 on a first-come-first-served basis. QR code payment enabled.", authorId: "demo-host-2", pinned: false, status: "active" },
    ];

    for (const ann of announcements) {
      await ctx.db.insert("announcements", { ...ann, communityId, createdAt: now });
    }

    // Seed polls
    const pollId = await ctx.db.insert("polls", {
      communityId,
      creatorId: "demo-host-1",
      question: "What new facility would you like to see in our community?",
      options: ["Basketball Court", "Indoor Games Room", "Senior Citizen Garden", "Co-working Space", "Pet Park"],
      anonymous: true,
      status: "active",
      createdAt: now,
    });

    // Seed a few votes
    await ctx.db.insert("poll_votes", { pollId, userId: "demo-voter-1", optionIndex: 4, createdAt: now });
    await ctx.db.insert("poll_votes", { pollId, userId: "demo-voter-2", optionIndex: 3, createdAt: now });
    await ctx.db.insert("poll_votes", { pollId, userId: "demo-voter-3", optionIndex: 0, createdAt: now });

    return { communityId, alreadySeeded: false };
  },
});

/** Helper: get the next occurrence of a weekday (0=Sun, 1=Mon, ..., 6=Sat) */
function getNextWeekday(dayOfWeek: number): string {
  const now = new Date();
  const diff = (dayOfWeek - now.getDay() + 7) % 7 || 7;
  const target = new Date(now);
  target.setDate(now.getDate() + diff);
  return target.toISOString().split("T")[0];
}

/** Check if seed data exists */
export const hasSeedData = query({
  args: {},
  handler: async (ctx) => {
    const community = await ctx.db.query("communities").first();
    return !!community;
  },
});
