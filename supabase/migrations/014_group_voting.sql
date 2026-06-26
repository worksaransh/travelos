-- Migration 014: Group Voting
-- Adds voting tracking table for itinerary activity swaps and configures RLS

CREATE TABLE IF NOT EXISTS itinerary_item_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_item_id uuid NOT NULL REFERENCES itinerary_items(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  voter_session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (itinerary_item_id, voter_session_id)
);

-- Enable Row Level Security
ALTER TABLE itinerary_item_votes ENABLE ROW LEVEL SECURITY;

-- Select Policy: Allow anyone to read vote counts
DROP POLICY IF EXISTS itinerary_item_votes_select ON itinerary_item_votes;
CREATE POLICY itinerary_item_votes_select ON itinerary_item_votes
  FOR SELECT USING (true);

-- Insert Policy: Allow anyone to cast a vote
DROP POLICY IF EXISTS itinerary_item_votes_insert ON itinerary_item_votes;
CREATE POLICY itinerary_item_votes_insert ON itinerary_item_votes
  FOR INSERT WITH CHECK (true);
