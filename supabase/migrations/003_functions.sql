-- ============================================================
-- JOINN — SQL RPC Functions
-- ============================================================

-- Increment activity participant count
CREATE OR REPLACE FUNCTION public.increment_activity_participants(activity_id UUID)
RETURNS VOID AS $$
  UPDATE activities SET current_participants = current_participants + 1 WHERE id = activity_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Decrement activity participant count
CREATE OR REPLACE FUNCTION public.decrement_activity_participants(activity_id UUID)
RETURNS VOID AS $$
  UPDATE activities SET current_participants = GREATEST(0, current_participants - 1) WHERE id = activity_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Increment club member count
CREATE OR REPLACE FUNCTION public.increment_club_members(club_id UUID)
RETURNS VOID AS $$
  UPDATE clubs SET member_count = member_count + 1 WHERE id = club_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Decrement club member count
CREATE OR REPLACE FUNCTION public.decrement_club_members(club_id UUID)
RETURNS VOID AS $$
  UPDATE clubs SET member_count = GREATEST(0, member_count - 1) WHERE id = club_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Auto-create user profile on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS set_updated_at ON communities;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON user_profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON activities;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON clubs;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON posts;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON conversations;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON subscriptions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
