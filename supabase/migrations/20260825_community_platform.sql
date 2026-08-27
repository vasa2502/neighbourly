-- JOINN Community Platform Schema
-- Run this migration to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COMMUNITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('apartment', 'gated', 'villa', 'street', 'neighborhood')),
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'IN',
  postal_code TEXT,
  description TEXT,
  approximate_residents INTEGER,
  buildings TEXT[] DEFAULT '{}',
  coordinates JSONB,
  founder_id UUID,
  admin_id UUID,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  resident_count INTEGER DEFAULT 0,
  verified_resident_count INTEGER DEFAULT 0,
  invitation_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar TEXT,
  bio TEXT,
  building TEXT,
  floor TEXT,
  interests TEXT[] DEFAULT '{}',
  sports JSONB DEFAULT '[]',
  availability JSONB DEFAULT '{"times":[],"days":[]}',
  privacy JSONB DEFAULT '{}',
  referral_code TEXT UNIQUE,
  referral_credits INTEGER DEFAULT 0,
  country TEXT DEFAULT 'IN',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMMUNITY MEMBERSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS community_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'founder', 'admin', 'moderator', 'host')),
  verified BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ,
  UNIQUE(user_id, community_id)
);

-- ============================================================
-- VERIFICATION REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('invite_code', 'invitation', 'email', 'admin_approval', 'proof', 'address')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  data JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  reviewer_id UUID REFERENCES auth.users(id)
);

-- ============================================================
-- ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  end_time TEXT,
  location TEXT NOT NULL,
  max_participants INTEGER DEFAULT 10,
  current_participants INTEGER DEFAULT 0,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  co_host_ids UUID[] DEFAULT '{}',
  skill_level TEXT,
  format TEXT,
  is_free BOOLEAN DEFAULT true,
  price NUMERIC(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ACTIVITY PARTICIPANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'pending', 'waitlisted', 'cancelled')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

-- ============================================================
-- CLUBS
-- ============================================================
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image TEXT,
  rules TEXT,
  member_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CLUB MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('ask', 'help', 'offer', 'looking_for', 'recommendation', 'discussion', 'interest', 'lost_found', 'buy_sell', 'urgent')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired', 'removed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- POST COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- POST REACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'like' CHECK (type IN ('like', 'heart', 'thumbs_up', 'thumbs_down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'system')),
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'activity', 'club')),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('activity', 'club', 'community', 'message', 'verification', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id),
  community_id UUID REFERENCES communities(id),
  type TEXT NOT NULL CHECK (type IN ('existing_resident', 'new_community')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'joined', 'verified', 'credited', 'expired')),
  credit_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  credited_at TIMESTAMPTZ
);

-- ============================================================
-- COMMUNITY CLAIMS
-- ============================================================
CREATE TABLE IF NOT EXISTS community_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id),
  claimant_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  organization_name TEXT,
  role_title TEXT,
  evidence TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  reviewer_id UUID REFERENCES auth.users(id)
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'resident_plus', 'host_pro')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ,
  credits INTEGER DEFAULT 0,
  country TEXT DEFAULT 'IN',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- POLLS
-- ============================================================
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  type TEXT DEFAULT 'single' CHECK (type IN ('single', 'multiple')),
  anonymous BOOLEAN DEFAULT false,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  option_indices INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_communities_city ON communities(city);
CREATE INDEX IF NOT EXISTS idx_communities_area ON communities(area);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_community ON community_memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_activities_community ON activities(community_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_clubs_community ON clubs(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_verification_community ON verification_requests(community_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Community policies
CREATE POLICY "Communities are viewable by authenticated users" ON communities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create communities" ON communities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Community founders can update their communities" ON communities FOR UPDATE USING (founder_id = auth.uid());
CREATE POLICY "Community admins can update their communities" ON communities FOR UPDATE USING (admin_id = auth.uid());

-- Profile policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Membership policies
CREATE POLICY "Members can view community memberships" ON community_memberships FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create memberships" ON community_memberships FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Activity policies
CREATE POLICY "Community members can view activities" ON activities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create activities" ON activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Hosts can update own activities" ON activities FOR UPDATE USING (host_id = auth.uid());

-- Post policies
CREATE POLICY "Community members can view posts" ON posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update own posts" ON posts FOR UPDATE USING (author_id = auth.uid());

-- Message policies
CREATE POLICY "Conversation members can view messages" ON messages FOR SELECT USING (
  conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
);
CREATE POLICY "Authenticated users can send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Notification policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Referral policies
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (referrer_id = auth.uid());
CREATE POLICY "Authenticated users can create referrals" ON referrals FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- Subscription policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (user_id = auth.uid());

-- Poll policies
CREATE POLICY "Community members can view polls" ON polls FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create polls" ON polls FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Vote policies
CREATE POLICY "Users can view poll votes" ON poll_votes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can vote once" ON poll_votes FOR INSERT WITH CHECK (user_id = auth.uid());

-- Announcement policies
CREATE POLICY "Community members can view announcements" ON announcements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can create announcements" ON announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
