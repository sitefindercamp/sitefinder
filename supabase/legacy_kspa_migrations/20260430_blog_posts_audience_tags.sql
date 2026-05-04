-- Add audience_tags column to blog_posts for guide-specific audience targeting
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS audience_tags text[] NOT NULL DEFAULT '{}';
