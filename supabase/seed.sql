-- ============================================================================
-- CREEM BOILERPLATE - SEED DATA
-- ============================================================================
-- Purpose: Seed the database with initial system configuration and demo users
-- Date: 2026-03-31
-- Version: 1.0
--
-- This file contains system configuration data including:
-- - Demo user accounts (admin and regular user)
-- - RBAC data (roles, permissions, assignments)  
-- - System configuration
-- - Email provider settings
-- - Application settings
-- ============================================================================

-- ============================================================================
-- DEMO AUTH USERS & PROFILES
-- ============================================================================
-- Insert demo auth users first (required for profiles foreign key)
-- Using proper bcrypt hashing with crypt function
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'authenticated',
  'authenticated',
  'admin@example.com',
  '$2a$10$fKDLee6OuijSgynZ9FD9ROgblvCsafBbnw.rAITfnNqBxJaPqekS6',
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User", "role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
), (
  '00000000-0000-0000-0000-000000000000',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'authenticated',
  'authenticated',
  'user@example.com',
  '$2a$10$mpIYc5nTe5MHYceKSJBObOxZe1d/OefUqS3gHBvDXxqmU3cpDcRDG',
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Demo User", "role": "user"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert identities for the demo users
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "name": "Admin User", "email": "admin@example.com", "email_verified": true, "phone_verified": false}',
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
), (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  '{"sub": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22", "name": "Demo User", "email": "user@example.com", "email_verified": true, "phone_verified": false}',
  'email',
  NOW(),
  NOW(),
  NOW(),
  gen_random_uuid()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Insert profiles (backed up data)
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@example.com', 'Admin User', 'admin'::user_role, '2026-03-30 21:29:05.152073+00', '2026-03-30 21:29:05.152073+00'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'user@example.com', 'Demo User', 'user'::user_role, '2026-03-30 21:29:05.152073+00', '2026-03-30 21:29:05.152073+00')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();
-- RBAC SYSTEM SEED DATA
-- ============================================================================

-- Insert default roles (using auto-increment IDs)
INSERT INTO public.roles (name, description, is_system_role) VALUES
  ('admin', 'Administrator with full system access', true),
  ('user', 'Regular user with standard permissions', true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_system_role = EXCLUDED.is_system_role;

-- Insert permissions (using auto-increment IDs)
INSERT INTO public.permissions (name, description, resource, action) VALUES
  ('profiles:read', 'View user profiles', 'profiles', 'read'),
  ('profiles:write', 'Edit user profiles', 'profiles', 'write'),
  ('profiles:delete', 'Delete user profiles', 'profiles', 'delete'),
  ('billing:read', 'View billing information', 'billing', 'read'),
  ('billing:write', 'Manage billing settings', 'billing', 'write'),
  ('subscriptions:read', 'View subscriptions', 'subscriptions', 'read'),
  ('subscriptions:write', 'Manage subscriptions', 'subscriptions', 'write'),
  ('payments:read', 'View payment records', 'payments', 'read'),
  ('payments:write', 'Process payment operations', 'payments', 'write'),
  ('credits:read', 'View credit balances', 'credits', 'read'),
  ('credits:write', 'Manage credit operations', 'credits', 'write'),
  ('discounts:read', 'View discount codes', 'discounts', 'read'),
  ('discounts:write', 'Manage discount codes', 'discounts', 'write'),
  ('analytics:read', 'View analytics data', 'analytics', 'read'),
  ('settings:read', 'View application settings', 'settings', 'read'),
  ('settings:write', 'Manage application settings', 'settings', 'write'),
  ('admin:impersonate', 'Impersonate other users', 'admin', 'impersonate'),
  ('admin:system', 'System administration access', 'admin', 'system'),
  ('users:manage', 'Manage user accounts', 'users', 'manage')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- Assign admin permissions to admin role
INSERT INTO public.role_permissions (role_id, permission_id) 
SELECT 
  r.id,
  p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign limited permissions to user role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'user' AND p.name IN (
  'profiles:read',
  'billing:read', 
  'subscriptions:read',
  'payments:read',
  'credits:read',
  'discounts:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign roles to demo users (from backup data)
INSERT INTO public.user_roles (user_id, role_id, assigned_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, '2026-03-30 21:29:05.187834+00'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 2, '2026-03-30 21:29:05.187834+00')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- BILLING CONFIGURATION
-- ============================================================================

INSERT INTO public.billing_config (key, value, description) VALUES
  ('creem_api_key', '""'::jsonb, 'Creem API key for payment processing'),
  ('creem_webhook_secret', '""'::jsonb, 'Creem webhook secret for verification'),
  ('default_currency', '"usd"'::jsonb, 'Default currency for pricing'),
  ('tax_rate', '"0.00"'::jsonb, 'Default tax rate percentage')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- ============================================================================
-- APPLICATION SETTINGS
-- ============================================================================

INSERT INTO public.app_settings (setting_key, setting_value) VALUES
  ('app_name', '"Creem Boilerplate"'::jsonb),
  ('maintenance_mode', 'false'::jsonb)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value;

-- Insert default settings
INSERT INTO app_settings (setting_key, setting_value) VALUES
  ('open_graph', '{
    "enabled": true,
    "add_logo": true,
    "logo_style": "light",
    "add_screenshot": true,
    "template": "gradient",
    "start_color": "#6366f1",
    "end_color": "#8b5cf6",
    "text_color": "#ffffff",
    "preview_title": "Build Your SaaS with Creem",
    "preview_image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop",
    "preview_url": "https://creem.io"
  }'),
  ('invoice', '{
    "enabled": true,
    "invoice_prefix": "CREEM",
    "company_name": "Creem Technologies Inc.",
    "company_code": "CT2024",
    "company_address": "123 SaaS Street, San Francisco, CA 94105",
    "company_tax_number": "US-TAX-2024-CREEM",
    "company_phone": "+1 (555) 123-4567"
  }')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- CREDITS WALLETS FOR DEMO USERS
-- ============================================================================

-- Create credit wallets for demo users
INSERT INTO public.credits_wallets (user_id, balance, total_earned, total_spent) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 0, 0, 0),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 0, 0, 0)
ON CONFLICT (user_id) DO UPDATE SET
  balance = EXCLUDED.balance,
  total_earned = EXCLUDED.total_earned,
  total_spent = EXCLUDED.total_spent;

-- ============================================================================
-- EMAIL PROVIDERS CONFIGURATION
-- ============================================================================

INSERT INTO public.email_providers (name, slug, provider_type, config, is_active) VALUES
  ('Resend', 'resend', 'smtp', '{"host": "smtp.resend.com", "port": 587, "secure": false}'::jsonb, true),
  ('SendGrid', 'sendgrid', 'smtp', '{"api_key": "", "from_email": ""}'::jsonb, false),
  ('Mailgun', 'mailgun', 'mailgun', '{"api_key": "", "domain": ""}'::jsonb, false),
  ('AWS SES', 'ses', 'ses', '{"host": "email-smtp.us-east-1.amazonaws.com", "port": 587}'::jsonb, false),
  ('Postmark', 'postmark', 'postmark', '{"server_token": "", "from_email": ""}'::jsonb, false)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  provider_type = EXCLUDED.provider_type,
  config = EXCLUDED.config,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Database structure and demo data loaded successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 System Configuration:';
  RAISE NOTICE '   • RBAC system with roles and permissions';
  RAISE NOTICE '   • Email providers configured'; 
  RAISE NOTICE '   • Application settings initialized';
  RAISE NOTICE '   • Billing configuration ready';
  RAISE NOTICE '';
  RAISE NOTICE '👤 Demo Users Restored:';
  RAISE NOTICE '   Admin: admin@example.com / admin@123 (admin role)';
  RAISE NOTICE '   User:  user@example.com / user@123 (user role)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  SECURITY: Change these passwords immediately in production!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Steps:';
  RAISE NOTICE '   1. Test login with demo credentials';
  RAISE NOTICE '   2. Configure email provider settings';
  RAISE NOTICE '   3. Update billing configuration with your API keys';
  RAISE NOTICE '';
END $$;
