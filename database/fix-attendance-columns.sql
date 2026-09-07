-- ============================================
-- Fix Attendance & Session Schema for Presensi Feature
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add participant_name column to attendance table (for public QR presensi without login)
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS participant_name VARCHAR(255);

-- 2. Add is_active column to attendance_sessions
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Add session_code column to attendance_sessions
ALTER TABLE attendance_sessions ADD COLUMN IF NOT EXISTS session_code VARCHAR(20);

-- 4. Update existing sessions to be active by default
UPDATE attendance_sessions SET is_active = true WHERE is_active IS NULL;

-- 5. Generate session_code for existing sessions that don't have one
UPDATE attendance_sessions
SET session_code = UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 8))
WHERE session_code IS NULL;

-- 6. Add event_status value for pending_approval if it doesn't exist
-- Note: In Supabase PostgreSQL, you need to drop and recreate the type
DO $$
BEGIN
  -- Check if we can add to the enum safely
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'event_status'
    AND e.enumlabel = 'pending_approval'
  ) THEN
    -- Add pending_approval to event_status enum
    ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'pending_approval';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If adding value fails (e.g., enum is referenced elsewhere), ignore
    RAISE NOTICE 'Could not add pending_approval to event_status: %', SQLERRM;
END $$;

-- 7. Add rejected status to event_status enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'event_status'
    AND e.enumlabel = 'rejected'
  ) THEN
    ALTER TYPE event_status ADD VALUE IF NOT EXISTS 'rejected';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add rejected to event_status: %', SQLERRM;
END $$;

-- 8. Create index on session_name for faster attendance lookups
CREATE INDEX IF NOT EXISTS idx_attendance_session_name ON attendance(session_name);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_session_code ON attendance_sessions(session_code);

-- 9. Grant permissions (adjust role as needed)
-- GRANT ALL ON attendance TO anon, authenticated;
-- GRANT ALL ON attendance_sessions TO anon, authenticated;

SELECT 'Migration completed successfully!' as status;
