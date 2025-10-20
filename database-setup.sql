-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE company_type AS ENUM ('restaurant', 'shop', 'retail', 'service');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'customer');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'trial');

-- Create companies table
CREATE TABLE public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    owner_id UUID NULL,
    name CHARACTER VARYING(255) NOT NULL,
    type company_type NULL DEFAULT 'restaurant'::company_type,
    address TEXT NULL,
    phone CHARACTER VARYING(50) NULL,
    email CHARACTER VARYING(100) NULL,
    description TEXT NULL,
    avatar_url TEXT NULL,
    subscription_id CHARACTER VARYING(100) NULL,
    subscription_status subscription_status NULL DEFAULT 'inactive'::subscription_status,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT companies_pkey PRIMARY KEY (id)
);

-- Create users table
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id UUID NULL,
    full_name CHARACTER VARYING(255) NULL,
    email CHARACTER VARYING(100) NULL,
    phone CHARACTER VARYING(50) NOT NULL,
    role user_role NULL DEFAULT 'customer'::user_role,
    avatar_url TEXT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name CHARACTER VARYING(255) NOT NULL,
    description TEXT NULL,
    is_price_fixed BOOLEAN NULL DEFAULT true,
    price NUMERIC(10, 2) NULL,
    min_price NUMERIC(10, 2) NULL,
    max_price NUMERIC(10, 2) NULL,
    stock_quantity INTEGER NULL DEFAULT 0,
    image_url TEXT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT fk_products_company FOREIGN KEY (company_id) REFERENCES companies (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_company_id ON public.users(company_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_products_company_id ON public.products(company_id);
CREATE INDEX idx_companies_email ON public.companies(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can view their own company" ON public.companies
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own company" ON public.companies
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Create RLS policies for users
CREATE POLICY "Users can view users in their company" ON public.users
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins and managers can insert users" ON public.users
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.users WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admins and managers can update users" ON public.users
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admins and managers can delete users" ON public.users
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Create RLS policies for products
CREATE POLICY "Users can view products in their company" ON public.products
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage products in their company" ON public.products
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE user_id = auth.uid() AND role IN ('admin', 'manager', 'employee')
        )
    );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('avatars', 'avatars', true),
    ('products', 'products', true);

-- Create storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their avatar images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete their avatar images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.role() = 'authenticated'
    );

-- Create storage policies for products bucket
CREATE POLICY "Product images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'products' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'products' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'products' AND 
        auth.role() = 'authenticated'
    );

-- Create a function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be used to automatically create user records
    -- when a new auth user is created, if needed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title CHARACTER VARYING(100) NOT NULL,
    description TEXT NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL,
    yearly_discount_percent INTEGER NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);

-- Create subscription features table
CREATE TABLE public.subscription_features (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    feature TEXT NOT NULL,
    CONSTRAINT subscription_features_pkey PRIMARY KEY (id),
    CONSTRAINT subscription_features_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans (id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency CHARACTER VARYING(10) NULL DEFAULT 'USD'::character varying,
    payment_status CHARACTER VARYING(50) NULL DEFAULT 'pending'::character varying,
    provider CHARACTER VARYING(50) NULL,
    transaction_id CHARACTER VARYING(255) NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT payments_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES subscription_plans (id) ON DELETE SET NULL
);

-- Create metrics table for company metrics tracking
CREATE TABLE public.metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    messages_sent_total INTEGER DEFAULT 0,
    messages_allowed_total INTEGER DEFAULT 0,
    products_created_total INTEGER DEFAULT 0,
    products_allowed_total INTEGER DEFAULT 0,
    users_created_total INTEGER DEFAULT 0,
    users_allowed_total INTEGER DEFAULT 0,
    prospects_contacted_total INTEGER DEFAULT 0,
    prospects_allowed_total INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT metrics_pkey PRIMARY KEY (id),
    CONSTRAINT fk_metrics_company_id FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT unique_company_metrics UNIQUE (company_id)
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (title, description, price_monthly, yearly_discount_percent) VALUES
('Starter', 'Perfect for small businesses getting started', 29.00, 10),
('Professional', 'Ideal for growing businesses', 79.00, 15),
('Enterprise', 'For large organizations with advanced needs', 199.00, 20);

-- Insert features for Starter plan (plan_id = 1)
INSERT INTO public.subscription_features (plan_id, feature) VALUES
(1, 'Up to 5 team members'),
(1, 'Basic product management'),
(1, 'Email support'),
(1, '1GB storage'),
(1, 'Basic analytics');

-- Insert features for Professional plan (plan_id = 2)
INSERT INTO public.subscription_features (plan_id, feature) VALUES
(2, 'Up to 25 team members'),
(2, 'Advanced product management'),
(2, 'Priority support'),
(2, '10GB storage'),
(2, 'Advanced analytics'),
(2, 'Custom integrations'),
(2, 'API access');

-- Insert features for Enterprise plan (plan_id = 3)
INSERT INTO public.subscription_features (plan_id, feature) VALUES
(3, 'Unlimited team members'),
(3, 'Full product suite'),
(3, '24/7 dedicated support'),
(3, 'Unlimited storage'),
(3, 'Custom analytics'),
(3, 'White-label options'),
(3, 'Advanced API access'),
(3, 'Custom integrations'),
(3, 'SLA guarantee');

-- Enable RLS for subscription tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_plans (public read access)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
    FOR SELECT USING (true);

-- Create RLS policies for subscription_features (public read access)
CREATE POLICY "Anyone can view subscription features" ON public.subscription_features
    FOR SELECT USING (true);

-- Create RLS policies for payments
CREATE POLICY "Users can view their company payments" ON public.payments
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE user_id = auth.uid()
        )
    );

-- Optional: Create trigger for new user registration
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 
Enable RLS for metrics
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for metrics
CREATE POLICY "Users can view their company metrics" ON public.metrics
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their company metrics" ON public.metrics
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );-- Add f
oreign key constraint for company owner
ALTER TABLE public.companies 
ADD CONSTRAINT fk_companies_owner 
FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;