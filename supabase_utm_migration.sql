-- Migration: Add UTM tracking fields to bookings table
-- Run this in Supabase SQL editor

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_term text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_content text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS landing_page text;

-- Index for fast UTM analytics queries
CREATE INDEX IF NOT EXISTS idx_bookings_utm_source ON bookings(utm_source);
CREATE INDEX IF NOT EXISTS idx_bookings_utm_medium ON bookings(utm_medium);
CREATE INDEX IF NOT EXISTS idx_bookings_utm_campaign ON bookings(utm_campaign);
