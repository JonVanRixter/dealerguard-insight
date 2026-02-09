-- Add CSS trigger thresholds to user_settings
ALTER TABLE public.user_settings
  ADD COLUMN css_oversight_threshold numeric(3,1) NOT NULL DEFAULT 4.0,
  ADD COLUMN css_reward_threshold numeric(3,1) NOT NULL DEFAULT 8.5;
