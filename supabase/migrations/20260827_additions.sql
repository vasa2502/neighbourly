-- ============================================================
-- PUSH SUBSCRIPTIONS (for browser push notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(endpoint)
);

-- ============================================================
-- SUBSCRIPTIONS: Add Stripe columns + community_partner tier
-- ============================================================
-- Add Stripe-related columns if they don't exist
DO $$ BEGIN
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ============================================================
-- ACTIVITY MESSAGES (chat within activities)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ACTIVITY FEEDBACK
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

-- ============================================================
-- PLAYER AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS player_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  time_start TEXT NOT NULL,
  time_end TEXT NOT NULL,
  skill_level TEXT DEFAULT 'all',
  notes TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AD SLOTS (community advertising)
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  placement TEXT NOT NULL,
  description TEXT,
  audience_count INTEGER DEFAULT 0,
  reserve_price NUMERIC(10,2),
  current_bid NUMERIC(10,2),
  current_bidder_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired')),
  auction_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AD BIDS
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID NOT NULL REFERENCES ad_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(10,2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AD CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID NOT NULL REFERENCES auth.users(id),
  slot_id UUID REFERENCES ad_slots(id),
  community_id UUID REFERENCES communities(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
  budget NUMERIC(10,2),
  start_date DATE,
  end_date DATE,
  creative_url TEXT,
  target_audience TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AD CAMPAIGN ANALYTICS (daily)
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  spend NUMERIC(10,2) DEFAULT 0,
  UNIQUE(campaign_id, date)
);

-- ============================================================
-- COMMUNITY RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS community_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMMUNITY DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS community_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMMUNITY FACILITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS community_facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  hours TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMMUNITY CONTACTS (emergency)
-- ============================================================
CREATE TABLE IF NOT EXISTS community_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  available TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- MODERATION REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS moderation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_communities_city ON communities(city);
CREATE INDEX IF NOT EXISTS idx_communities_status ON communities(status);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_community ON community_memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_activities_community ON activities(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_community ON verification_requests(community_id);
CREATE INDEX IF NOT EXISTS idx_player_availability_community ON player_availability(community_id);
CREATE INDEX IF NOT EXISTS idx_ad_slots_community ON ad_slots(community_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- ============================================================
-- RLS (Row Level Security) policies
-- ============================================================
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Communities: anyone can read active ones
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active communities" ON communities FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can create communities" ON communities FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Memberships: users can read their own, insert their own
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memberships" ON community_memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join communities" ON community_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activities: authenticated users in the community can read/write
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community members can view activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create activities" ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Posts: community members can read/write
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community members can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages: only sender and conversation members can read
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view messages" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: only the recipient can read
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Referrals: users can view their own
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Authenticated users can create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Verification requests
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own verification requests" ON verification_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit verification requests" ON verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community claims
ALTER TABLE community_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view claims" ON community_claims FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit claims" ON community_claims FOR INSERT WITH CHECK (auth.uid() = claimant_id);

-- Polls
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community members can view polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create polls" ON polls FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Poll votes
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view poll votes" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote once" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community members can view announcements" ON announcements FOR SELECT USING (true);

-- Moderation reports
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view reports" ON moderation_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create reports" ON moderation_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Ad slots
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active ad slots" ON ad_slots FOR SELECT USING (true);

-- Ad bids
ALTER TABLE ad_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view bids" ON ad_bids FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can place bids" ON ad_bids FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ad campaigns
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own campaigns" ON ad_campaigns FOR SELECT USING (auth.uid() = advertiser_id);
CREATE POLICY "Authenticated users can create campaigns" ON ad_campaigns FOR INSERT WITH CHECK (auth.uid() = advertiser_id);

-- Community rules, documents, facilities, contacts
ALTER TABLE community_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community members can view rules" ON community_rules FOR SELECT USING (true);

ALTER TABLE community_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community members can view documents" ON community_documents FOR SELECT USING (true);

ALTER TABLE community_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community members can view facilities" ON community_facilities FOR SELECT USING (true);

ALTER TABLE community_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community members can view contacts" ON community_contacts FOR SELECT USING (true);

-- Activity messages
ALTER TABLE activity_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view activity messages" ON activity_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can send activity messages" ON activity_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Activity feedback
ALTER TABLE activity_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view feedback" ON activity_feedback FOR SELECT USING (true);
CREATE POLICY "Users can submit feedback" ON activity_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Player availability
ALTER TABLE player_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Community members can view availability" ON player_availability FOR SELECT USING (true);
CREATE POLICY "Users can manage own availability" ON player_availability FOR ALL USING (auth.uid() = user_id);
