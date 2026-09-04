-- ============================================================
-- JOINN — Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Helper: check if user is a member of a community
CREATE OR REPLACE FUNCTION public.is_community_member(community_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_memberships
    WHERE user_id = auth.uid() AND community_id = community_uuid AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if user has a specific role in a community
CREATE OR REPLACE FUNCTION public.has_community_role(community_uuid UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_memberships
    WHERE user_id = auth.uid() AND community_id = community_uuid
      AND role IN (required_role, 'admin', 'founder') AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── communities ───
CREATE POLICY "Anyone can view active communities" ON communities
  FOR SELECT USING (status = 'active' OR founder_id = auth.uid() OR admin_id = auth.uid());

CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND founder_id = auth.uid());

CREATE POLICY "Admins can update their community" ON communities
  FOR UPDATE USING (admin_id = auth.uid() OR founder_id = auth.uid());

-- ─── user_profiles ───
CREATE POLICY "Users can view profiles of community members" ON user_profiles
  FOR SELECT USING (
    id = auth.uid() -- own profile
    OR EXISTS (
      SELECT 1 FROM community_memberships cm1
      JOIN community_memberships cm2 ON cm1.community_id = cm2.community_id
      WHERE cm1.user_id = auth.uid() AND cm2.user_id = user_profiles.id AND cm1.status = 'active' AND cm2.status = 'active'
    )
  );

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ─── community_memberships ───
CREATE POLICY "Members can view memberships of their communities" ON community_memberships
  FOR SELECT USING (
    user_id = auth.uid() -- own memberships
    OR is_community_member(community_id) -- fellow members can see each other
  );

CREATE POLICY "Authenticated users can join communities" ON community_memberships
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Admins can manage memberships" ON community_memberships
  FOR UPDATE USING (has_community_role(community_id, 'admin'));

CREATE POLICY "Users can leave communities" ON community_memberships
  FOR DELETE USING (user_id = auth.uid());

-- ─── activities ───
CREATE POLICY "Community members can view activities" ON activities
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Community members can create activities" ON activities
  FOR INSERT WITH CHECK (is_community_member(community_id) AND host_id = auth.uid());

CREATE POLICY "Hosts can update their activities" ON activities
  FOR UPDATE USING (host_id = auth.uid() OR has_community_role(community_id, 'admin'));

CREATE POLICY "Hosts can delete their activities" ON activities
  FOR DELETE USING (host_id = auth.uid() OR has_community_role(community_id, 'admin'));

-- ─── activity_participants ───
CREATE POLICY "Community members can view participants" ON activity_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM activities a WHERE a.id = activity_id AND is_community_member(a.community_id))
  );

CREATE POLICY "Users can join activities" ON activity_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave activities" ON activity_participants
  FOR DELETE USING (user_id = auth.uid());

-- ─── activity_feedback ───
CREATE POLICY "Community members can view feedback" ON activity_feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM activities a WHERE a.id = activity_id AND is_community_member(a.community_id))
  );

CREATE POLICY "Participants can submit feedback" ON activity_feedback
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM activity_participants ap WHERE ap.activity_id = activity_id AND ap.user_id = auth.uid())
  );

-- ─── activity_messages ───
CREATE POLICY "Participants can view activity messages" ON activity_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM activities a WHERE a.id = activity_id AND is_community_member(a.community_id))
  );

CREATE POLICY "Participants can send activity messages" ON activity_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM activities a WHERE a.id = activity_id AND is_community_member(a.community_id))
  );

-- ─── clubs ───
CREATE POLICY "Community members can view clubs" ON clubs
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Community members can create clubs" ON clubs
  FOR INSERT WITH CHECK (is_community_member(community_id) AND created_by = auth.uid());

CREATE POLICY "Creators and admins can update clubs" ON clubs
  FOR UPDATE USING (created_by = auth.uid() OR has_community_role(community_id, 'admin'));

-- ─── club_members ───
CREATE POLICY "Club members can view members" ON club_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_id AND is_community_member(c.community_id))
  );

CREATE POLICY "Users can join clubs" ON club_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave clubs" ON club_members
  FOR DELETE USING (user_id = auth.uid());

-- ─── posts ───
CREATE POLICY "Community members can view posts" ON posts
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Community members can create posts" ON posts
  FOR INSERT WITH CHECK (is_community_member(community_id) AND author_id = auth.uid());

CREATE POLICY "Authors can update their posts" ON posts
  FOR UPDATE USING (author_id = auth.uid() OR has_community_role(community_id, 'admin'));

CREATE POLICY "Authors can delete their posts" ON posts
  FOR DELETE USING (author_id = auth.uid() OR has_community_role(community_id, 'admin'));

-- ─── post_comments ───
CREATE POLICY "Community members can view comments" ON post_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND is_community_member(p.community_id))
  );

CREATE POLICY "Community members can comment" ON post_comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND is_community_member(p.community_id))
  );

CREATE POLICY "Authors can update their comments" ON post_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their comments" ON post_comments
  FOR DELETE USING (author_id = auth.uid());

-- ─── conversations ───
CREATE POLICY "Members can view their conversations" ON conversations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = id AND cm.user_id = auth.uid())
  );

-- ─── conversation_members ───
CREATE POLICY "Conversation members can view membership" ON conversation_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid())
  );

-- ─── messages ───
CREATE POLICY "Conversation members can view messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "Conversation members can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM conversation_members cm WHERE cm.conversation_id = messages.conversation_id AND cm.user_id = auth.uid())
  );

-- ─── notifications ───
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ─── referrals ───
CREATE POLICY "Users can view their referrals" ON referrals
  FOR SELECT USING (referrer_id = auth.uid());

CREATE POLICY "Users can create referrals" ON referrals
  FOR INSERT WITH CHECK (referrer_id = auth.uid());

-- ─── subscriptions ───
CREATE POLICY "Users can view their subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- ─── verification_requests ───
CREATE POLICY "Users can view their verification requests" ON verification_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR has_community_role(community_id, 'admin')
  );

CREATE POLICY "Users can submit verification requests" ON verification_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update verification requests" ON verification_requests
  FOR UPDATE USING (has_community_role(community_id, 'admin'));

-- ─── community_claims ───
CREATE POLICY "Anyone can view claims for communities" ON community_claims
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit claims" ON community_claims
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND claimant_id = auth.uid());

-- ─── polls ───
CREATE POLICY "Community members can view polls" ON polls
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Community members can create polls" ON polls
  FOR INSERT WITH CHECK (is_community_member(community_id) AND creator_id = auth.uid());

-- ─── poll_votes ───
CREATE POLICY "Community members can view poll votes" ON poll_votes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM polls p WHERE p.id = poll_id AND is_community_member(p.community_id))
  );

CREATE POLICY "Users can vote once per poll" ON poll_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ─── announcements ───
CREATE POLICY "Community members can view announcements" ON announcements
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Admins can create announcements" ON announcements
  FOR INSERT WITH CHECK (has_community_role(community_id, 'admin') AND author_id = auth.uid());

CREATE POLICY "Admins can update announcements" ON announcements
  FOR UPDATE USING (has_community_role(community_id, 'admin'));

-- ─── community_rules ───
CREATE POLICY "Community members can view rules" ON community_rules
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Admins can manage rules" ON community_rules
  FOR ALL USING (has_community_role(community_id, 'admin'));

-- ─── community_documents ───
CREATE POLICY "Community members can view documents" ON community_documents
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Admins can manage documents" ON community_documents
  FOR ALL USING (has_community_role(community_id, 'admin'));

-- ─── community_facilities ───
CREATE POLICY "Community members can view facilities" ON community_facilities
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Admins can manage facilities" ON community_facilities
  FOR ALL USING (has_community_role(community_id, 'admin'));

-- ─── community_contacts ───
CREATE POLICY "Community members can view contacts" ON community_contacts
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Admins can manage contacts" ON community_contacts
  FOR ALL USING (has_community_role(community_id, 'admin'));

-- ─── moderation_reports ───
CREATE POLICY "Community members can view reports" ON moderation_reports
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Community members can create reports" ON moderation_reports
  FOR INSERT WITH CHECK (is_community_member(community_id) AND reporter_id = auth.uid());

CREATE POLICY "Moderators can update reports" ON moderation_reports
  FOR UPDATE USING (has_community_role(community_id, 'moderator'));

-- ─── player_availability ───
CREATE POLICY "Community members can view availability" ON player_availability
  FOR SELECT USING (is_community_member(community_id));

CREATE POLICY "Users can manage their availability" ON player_availability
  FOR ALL USING (user_id = auth.uid());

-- ─── ad_slots ───
CREATE POLICY "Anyone can view active ad slots" ON ad_slots
  FOR SELECT USING (status = 'active');

-- ─── ad_bids ───
CREATE POLICY "Slot community members can view bids" ON ad_bids
  FOR SELECT USING (
    user_id = auth.uid() -- own bids
    OR EXISTS (
      SELECT 1 FROM ad_slots s
      JOIN communities c ON c.id = s.community_id
      WHERE s.id = slot_id AND is_community_member(c.id)
    )
  );

CREATE POLICY "Authenticated users can place bids" ON ad_bids
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ─── ad_campaigns ───
CREATE POLICY "Advertisers can view their campaigns" ON ad_campaigns
  FOR SELECT USING (advertiser_id = auth.uid());

CREATE POLICY "Authenticated users can create campaigns" ON ad_campaigns
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND advertiser_id = auth.uid());

CREATE POLICY "Advertisers can update their campaigns" ON ad_campaigns
  FOR UPDATE USING (advertiser_id = auth.uid());

-- ─── ad_campaign_analytics ───
CREATE POLICY "Campaign owners can view analytics" ON ad_campaign_analytics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ad_campaigns ac WHERE ac.id = campaign_id AND ac.advertiser_id = auth.uid())
  );
