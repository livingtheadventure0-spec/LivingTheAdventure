-- Add the event-level packing/carry guidance to existing databases.
-- Safe to run once; the column is nullable so existing events remain valid.
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS things_to_carry_text TEXT;
