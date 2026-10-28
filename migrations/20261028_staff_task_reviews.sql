-- Apply in the EduConnect Supabase SQL editor before enabling task reviews.
ALTER TABLE public.ec_staff_onboarding
  ADD COLUMN IF NOT EXISTS completion_notes text,
  ADD COLUMN IF NOT EXISTS submission_location text,
  ADD COLUMN IF NOT EXISTS review_feedback text;

-- Ensure existing status constraints allow pending_review and returned.
-- Review any existing CHECK constraint on status before enabling the workflow.
