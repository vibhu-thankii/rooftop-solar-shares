
-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table for solar installations
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  capacity_kw DECIMAL NOT NULL,
  total_cost DECIMAL NOT NULL,
  available_shares INTEGER NOT NULL,
  sold_shares INTEGER DEFAULT 0,
  price_per_share DECIMAL NOT NULL,
  expected_roi DECIMAL,
  project_status TEXT DEFAULT 'active' CHECK (project_status IN ('active', 'funded', 'completed', 'cancelled')),
  installation_date DATE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investments table to track user investments
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id UUID REFERENCES public.projects NOT NULL,
  shares_purchased INTEGER NOT NULL,
  amount_invested DECIMAL NOT NULL,
  investment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  razorpay_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create host applications table
CREATE TABLE public.host_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  roof_area DECIMAL,
  electricity_bill DECIMAL,
  application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio performance table for tracking returns
CREATE TABLE public.portfolio_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  month DATE NOT NULL,
  total_generation_kwh DECIMAL NOT NULL DEFAULT 0,
  savings_amount DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- RLS Policies for projects
CREATE POLICY "Anyone can view active projects" ON public.projects FOR SELECT USING (project_status = 'active');
CREATE POLICY "Admins can manage all projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- RLS Policies for investments
CREATE POLICY "Users can view their own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all investments" ON public.investments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- RLS Policies for host applications
CREATE POLICY "Admins can manage host applications" ON public.host_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- RLS Policies for portfolio performance
CREATE POLICY "Users can view their own performance" ON public.portfolio_performance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert performance data" ON public.portfolio_performance FOR INSERT WITH CHECK (true);

-- Insert some sample projects
INSERT INTO public.projects (title, description, location, capacity_kw, total_cost, available_shares, price_per_share, expected_roi, image_url) VALUES
('Mumbai Residential Solar Project', 'High-efficiency solar installation on residential complex in Mumbai with excellent sun exposure', 'Mumbai, Maharashtra', 50.0, 2500000, 100, 25000, 12.5, 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'),
('Pune Commercial Solar Array', 'Large-scale commercial solar installation on warehouse rooftops in Pune industrial area', 'Pune, Maharashtra', 100.0, 5000000, 200, 25000, 15.0, 'https://images.unsplash.com/photo-1558618563-bee9c51d6b0a?w=800'),
('Bangalore Tech Park Solar', 'Premium solar installation on tech park buildings with smart monitoring systems', 'Bangalore, Karnataka', 75.0, 3750000, 150, 25000, 13.8, 'https://images.unsplash.com/photo-1558618047-de09f4c4f734?w=800');
