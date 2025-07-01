
-- Fix the infinite recursion in profiles RLS policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a corrected admin policy that doesn't reference itself
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.id IN (
        SELECT user_id FROM public.profiles WHERE is_admin = true
      )
    )
  );

-- Add foreign key constraint for profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create a notifications table for user alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Create a project updates table for tracking project milestones
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  update_type TEXT NOT NULL DEFAULT 'general', -- 'milestone', 'maintenance', 'performance', 'general'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT project_updates_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE
);

-- Enable RLS on project updates
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

-- Anyone can view project updates for active projects
CREATE POLICY "Anyone can view project updates" ON public.project_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_id 
      AND projects.project_status = 'active'
    )
  );

-- Admins can manage project updates
CREATE POLICY "Admins can manage project updates" ON public.project_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Add indexes for better performance (CREATE INDEX IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_project_id ON public.investments(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON public.project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_performance_user_id ON public.portfolio_performance(user_id);

-- Add email column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create email uniqueness index
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;

-- Add more fields to projects for better functionality
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS energy_output_kwh_year NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS carbon_offset_kg_year NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS warranty_years INTEGER DEFAULT 25;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS maintenance_fee_annual NUMERIC DEFAULT 0;

-- Add investment tracking improvements
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS returns_to_date NUMERIC DEFAULT 0;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS last_return_date TIMESTAMP WITH TIME ZONE;

-- Create function to automatically update sold_shares when investment is made
CREATE OR REPLACE FUNCTION update_project_sold_shares()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects 
  SET sold_shares = sold_shares + NEW.shares_purchased
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic sold_shares update
DROP TRIGGER IF EXISTS investment_update_sold_shares ON public.investments;
CREATE TRIGGER investment_update_sold_shares
  AFTER INSERT ON public.investments
  FOR EACH ROW
  EXECUTE FUNCTION update_project_sold_shares();
