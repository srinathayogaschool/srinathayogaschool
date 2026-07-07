-- Srinatha Yoga School - Complete Database Schema
-- Safe to run multiple times (uses IF NOT EXISTS / CREATE OR REPLACE)

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  password_set BOOLEAN DEFAULT false,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by owner" ON profiles;
CREATE POLICY "Profiles are viewable by owner"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles are insertable by owner" ON profiles;
CREATE POLICY "Profiles are insertable by owner"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles are updatable by owner" ON profiles;
CREATE POLICY "Profiles are updatable by owner"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup with password detection
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, password_set)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.encrypted_password IS NOT NULL AND NEW.encrypted_password != '' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('course', 'product', 'workshop'))
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are viewable by all" ON categories;
CREATE POLICY "Categories are viewable by all" ON categories FOR SELECT USING (true);

-- 3. Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  lessons_count INT NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'beginner',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  instructor TEXT NOT NULL DEFAULT '',
  instructor_image TEXT,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  certificate_eligible BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Courses are viewable by all" ON courses;
CREATE POLICY "Courses are viewable by all" ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Courses are manageable by admins" ON courses;
CREATE POLICY "Courses are manageable by admins" ON courses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_seconds INT NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- 5. Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_digital BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Products are viewable by all" ON products;
CREATE POLICY "Products are viewable by all" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Products are manageable by admins" ON products;
CREATE POLICY "Products are manageable by admins" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Workshops
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  start_date TIMESTAMPTZ NOT NULL,
  duration TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'English',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  starts_in INT NOT NULL DEFAULT 0,
  instructor TEXT NOT NULL DEFAULT '',
  format TEXT NOT NULL DEFAULT 'online',
  seat_limit INT NOT NULL DEFAULT 0,
  seats_remaining INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Workshops are viewable by all" ON workshops;
CREATE POLICY "Workshops are viewable by all" ON workshops FOR SELECT USING (true);
DROP POLICY IF EXISTS "Workshops are manageable by admins" ON workshops;
CREATE POLICY "Workshops are manageable by admins" ON workshops FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  shipping_address_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Orders are viewable by owner" ON orders;
CREATE POLICY "Orders are viewable by owner" ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Orders are manageable by admins" ON orders;
CREATE POLICY "Orders are manageable by admins" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 8. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Order items viewable by order owner" ON order_items;
CREATE POLICY "Order items viewable by order owner"
  ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid()));

-- 9. Shipping Addresses
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Addresses are viewable by owner" ON shipping_addresses;
CREATE POLICY "Addresses are viewable by owner"
  ON shipping_addresses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Addresses are manageable by owner" ON shipping_addresses;
CREATE POLICY "Addresses are manageable by owner"
  ON shipping_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Addresses updatable by owner" ON shipping_addresses;
CREATE POLICY "Addresses updatable by owner"
  ON shipping_addresses FOR UPDATE USING (auth.uid() = user_id);

-- 10. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress DECIMAL(5, 2) NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  certificate_issued BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enrollments viewable by owner" ON enrollments;
CREATE POLICY "Enrollments viewable by owner"
  ON enrollments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Enrollments manageable by owner" ON enrollments;
CREATE POLICY "Enrollments manageable by owner"
  ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Enrollments updatable by owner" ON enrollments;
CREATE POLICY "Enrollments updatable by owner"
  ON enrollments FOR UPDATE USING (auth.uid() = user_id);

-- Lessons RLS policy (after enrollments table exists)
DROP POLICY IF EXISTS "Lessons are viewable by enrolled users or admins" ON lessons;
CREATE POLICY "Lessons are viewable by enrolled users or admins"
  ON lessons FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM enrollments WHERE user_id = auth.uid() AND course_id = lessons.course_id)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 11. Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  watched_seconds INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Progress viewable by owner" ON lesson_progress;
CREATE POLICY "Progress viewable by owner"
  ON lesson_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Progress manageable by owner" ON lesson_progress;
CREATE POLICY "Progress manageable by owner"
  ON lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Progress updatable by owner" ON lesson_progress;
CREATE POLICY "Progress updatable by owner"
  ON lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- 12. Workshop Registrations
CREATE TABLE IF NOT EXISTS workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'attended')),
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, workshop_id)
);

ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Registrations viewable by owner" ON workshop_registrations;
CREATE POLICY "Registrations viewable by owner"
  ON workshop_registrations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Registrations manageable by owner" ON workshop_registrations;
CREATE POLICY "Registrations manageable by owner"
  ON workshop_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 13. Saved Items
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('course', 'product', 'workshop')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Saved items viewable by owner" ON saved_items;
CREATE POLICY "Saved items viewable by owner"
  ON saved_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Saved items manageable by owner" ON saved_items;
CREATE POLICY "Saved items manageable by owner"
  ON saved_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Saved items deletable by owner" ON saved_items;
CREATE POLICY "Saved items deletable by owner"
  ON saved_items FOR DELETE USING (auth.uid() = user_id);

-- 14. Wishlist Items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Wishlist viewable by owner" ON wishlist_items;
CREATE POLICY "Wishlist viewable by owner"
  ON wishlist_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Wishlist manageable by owner" ON wishlist_items;
CREATE POLICY "Wishlist manageable by owner"
  ON wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Wishlist deletable by owner" ON wishlist_items;
CREATE POLICY "Wishlist deletable by owner"
  ON wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notifications viewable by owner" ON notifications;
CREATE POLICY "Notifications viewable by owner"
  ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Notifications updatable by owner" ON notifications;
CREATE POLICY "Notifications updatable by owner"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 16. TTC Enrollments
CREATE TABLE IF NOT EXISTS ttc_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  medical_conditions TEXT,
  photo_url TEXT,
  id_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ttc_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "TTC enrollments viewable by owner" ON ttc_enrollments;
CREATE POLICY "TTC enrollments viewable by owner"
  ON ttc_enrollments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "TTC enrollments manageable by owner" ON ttc_enrollments;
CREATE POLICY "TTC enrollments manageable by owner"
  ON ttc_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "TTC enrollments manageable by admins" ON ttc_enrollments;
CREATE POLICY "TTC enrollments manageable by admins"
  ON ttc_enrollments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 17. TTC Resources
CREATE TABLE IF NOT EXISTS ttc_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'audio', 'video')),
  description TEXT,
  file_url TEXT,
  size TEXT,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ttc_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "TTC resources viewable by all" ON ttc_resources;
CREATE POLICY "TTC resources viewable by all" ON ttc_resources FOR SELECT USING (true);

-- Seed TTC resources
INSERT INTO ttc_resources (title, type, description, size, duration) VALUES
  ('Primary Series Asana Chart', 'pdf', 'Complete Ashtanga Primary Series with vinyasa counts and drishti', '2.4 MB', NULL),
  ('Sanskrit Pronunciation Guide', 'pdf', 'Correct pronunciation of asana names and mantras', '1.2 MB', NULL),
  ('Yoga Sutras Chanting Audio', 'audio', 'Traditional chanting of Patanjali Yoga Sutras with guidance', NULL, '45 min'),
  ('Human Anatomy for Yoga Teachers', 'pdf', 'Essential anatomy knowledge for safe yoga teaching', '8.5 MB', NULL),
  ('Pranayama Practice Video Series', 'video', 'Step-by-step guided pranayama practices for daily sadhana', NULL, '120 min'),
  ('Class Sequencing Guide', 'pdf', 'How to structure yoga classes for different levels and themes', '1.9 MB', NULL),
  ('Teaching Methodology Video', 'video', 'Masterclass on effective yoga teaching techniques', NULL, '90 min'),
  ('Bhagavad Gita Study Notes', 'pdf', 'Key verses and commentary from the Bhagavad Gita', '2.8 MB', NULL),
  ('Mantra Chanting Compilation', 'audio', 'Collection of traditional mantras for daily practice', NULL, '60 min'),
  ('Adjustments & Assists Manual', 'pdf', 'Safe hands-on adjustments for common yoga postures', '12.4 MB', NULL)
ON CONFLICT DO NOTHING;

-- 18. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Announcements viewable by all" ON announcements;
CREATE POLICY "Announcements viewable by all" ON announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Announcements manageable by admins" ON announcements;
CREATE POLICY "Announcements manageable by admins" ON announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 21. Inventory Log
CREATE TABLE IF NOT EXISTS inventory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_change INT NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inventory log viewable by admins" ON inventory_log;
CREATE POLICY "Inventory log viewable by admins"
  ON inventory_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );
DROP POLICY IF EXISTS "Inventory log manageable by admins" ON inventory_log;
CREATE POLICY "Inventory log manageable by admins"
  ON inventory_log FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );

-- 22. Media Library
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt TEXT,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video', 'document')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Media viewable by admins" ON media;
CREATE POLICY "Media viewable by admins"
  ON media FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );
DROP POLICY IF EXISTS "Media manageable by admins" ON media;
CREATE POLICY "Media manageable by admins"
  ON media FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 23. Banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT NOT NULL,
  cta_text TEXT,
  cta_link TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Banners viewable by all" ON banners;
CREATE POLICY "Banners viewable by all" ON banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Banners manageable by admins" ON banners;
CREATE POLICY "Banners manageable by admins"
  ON banners FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 24. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Audit logs viewable by admins" ON audit_logs;
CREATE POLICY "Audit logs viewable by admins"
  ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Audit logs insertable by admins" ON audit_logs;
CREATE POLICY "Audit logs insertable by admins"
  ON audit_logs FOR INSERT WITH CHECK (true);

-- 25. Leads (CRM)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  followed_up BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leads insertable by anyone" ON leads;
CREATE POLICY "Leads insertable by anyone" ON leads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leads viewable by admins" ON leads;
CREATE POLICY "Leads viewable by admins"
  ON leads FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
DROP POLICY IF EXISTS "Leads manageable by admins" ON leads;
CREATE POLICY "Leads manageable by admins"
  ON leads FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 26. Waitlist
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, workshop_id)
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Waitlist viewable by owner" ON waitlist;
CREATE POLICY "Waitlist viewable by owner"
  ON waitlist FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Waitlist manageable by owner" ON waitlist;
CREATE POLICY "Waitlist manageable by owner"
  ON waitlist FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 19. Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Favorites viewable by owner" ON favorites;
CREATE POLICY "Favorites viewable by owner"
  ON favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Favorites manageable by owner" ON favorites;
CREATE POLICY "Favorites manageable by owner"
  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Favorites deletable by owner" ON favorites;
CREATE POLICY "Favorites deletable by owner"
  ON favorites FOR DELETE USING (auth.uid() = user_id);

-- 20. Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  specialization TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers viewable by all" ON teachers;
CREATE POLICY "Teachers viewable by all" ON teachers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Teachers manageable by admins" ON teachers;
CREATE POLICY "Teachers manageable by admins" ON teachers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Enable Realtime for all relevant tables
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE workshops;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE favorites;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE enrollments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE workshop_registrations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE teachers;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE categories;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE inventory_log;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE media;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE banners;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE leads;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE waitlist;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add missing columns to products
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT '';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS full_description TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE products ADD COLUMN IF NOT EXISTS og_image TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add missing columns to workshops
DO $$ BEGIN
  ALTER TABLE workshops ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE workshops ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add order_number and payment_status and order_status to orders
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'completed', 'cancelled'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Update the profiles role check to include 'admin' properly
DO $$ BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add quantity to order_items
DO $$ BEGIN
  ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add admin function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  seq INT;
BEGIN
  seq := nextval('order_number_seq');
  RETURN 'SYS-' || LPAD(seq::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger to auto-set order_number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'SYS-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_number ON orders;
CREATE TRIGGER trg_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- 18. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contact messages insertable by anyone" ON contact_messages;
CREATE POLICY "Contact messages insertable by anyone"
  ON contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Contact messages viewable by admins" ON contact_messages;
CREATE POLICY "Contact messages viewable by admins"
  ON contact_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_course ON lesson_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_workshop_registrations_user ON workshop_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
