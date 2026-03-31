create type "public"."email_provider_type" as enum ('mailgun', 'postmark', 'ses', 'resend', 'smtp');

create type "public"."subscription_status" as enum ('active', 'canceled', 'past_due', 'trialing', 'incomplete');

create type "public"."user_role" as enum ('user', 'admin');

create sequence "public"."permissions_id_seq";

create sequence "public"."roles_id_seq";


  create table "public"."app_settings" (
    "id" uuid not null default gen_random_uuid(),
    "setting_key" text not null,
    "setting_value" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
      );


alter table "public"."app_settings" enable row level security;


  create table "public"."billing_config" (
    "id" uuid not null default gen_random_uuid(),
    "key" text not null,
    "value" jsonb not null,
    "description" text,
    "updated_by" uuid,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."billing_config" enable row level security;


  create table "public"."credit_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "wallet_id" uuid not null,
    "user_id" uuid not null,
    "type" text not null,
    "amount" integer not null,
    "balance_after" integer not null,
    "description" text not null,
    "source" text not null,
    "reference_id" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."credit_transactions" enable row level security;


  create table "public"."credits_wallets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "balance" integer not null default 0,
    "total_earned" integer not null default 0,
    "total_spent" integer not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."credits_wallets" enable row level security;


  create table "public"."creem_payments" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "creem_payment_id" text not null,
    "creem_customer_id" text,
    "creem_product_id" text,
    "status" text not null,
    "amount" integer not null,
    "currency" text not null default 'USD'::text,
    "checkout_id" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."creem_payments" enable row level security;


  create table "public"."creem_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "creem_subscription_id" text not null,
    "creem_customer_id" text not null,
    "creem_product_id" text not null,
    "status" text not null,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean default false,
    "canceled_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "payment_email" text,
    "plan_name" text
      );


alter table "public"."creem_subscriptions" enable row level security;


  create table "public"."discount_codes" (
    "id" uuid not null default gen_random_uuid(),
    "code" text not null,
    "description" text,
    "discount_type" text not null,
    "discount_value" integer not null,
    "currency" text default 'usd'::text,
    "max_uses" integer,
    "current_uses" integer default 0,
    "min_purchase_amount" integer default 0,
    "applicable_plans" jsonb,
    "expires_at" timestamp with time zone,
    "is_active" boolean default true,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "creem_discount_id" text,
    "discount_percentage" integer,
    "discount_amount" numeric(10,2),
    "used_count" integer default 0
      );


alter table "public"."discount_codes" enable row level security;


  create table "public"."discount_usage" (
    "id" uuid not null default gen_random_uuid(),
    "discount_code_id" uuid not null,
    "user_id" uuid not null,
    "subscription_id" uuid,
    "payment_id" uuid,
    "discount_amount" integer not null,
    "used_at" timestamp with time zone default now()
      );


alter table "public"."discount_usage" enable row level security;


  create table "public"."email_providers" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "provider_type" public.email_provider_type not null,
    "is_active" boolean default false,
    "config" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."email_providers" enable row level security;


  create table "public"."impersonation_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "admin_id" uuid not null,
    "impersonated_user_id" uuid not null,
    "started_at" timestamp with time zone not null default now(),
    "ended_at" timestamp with time zone,
    "reason" text
      );


alter table "public"."impersonation_sessions" enable row level security;


  create table "public"."permissions" (
    "id" integer not null default nextval('public.permissions_id_seq'::regclass),
    "name" text not null,
    "description" text,
    "resource" text not null,
    "action" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."permissions" enable row level security;


  create table "public"."pricing_plans" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "price" integer not null,
    "currency" text not null default 'USD'::text,
    "interval" text not null default 'month'::text,
    "features" jsonb default '[]'::jsonb,
    "is_active" boolean default true,
    "sort_order" integer default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "creem_product_id" text,
    "badge" text,
    "popular" boolean default false,
    "payment_type" text not null default 'subscription'::text,
    "credits_per_cycle" integer default 0,
    "grants_credits" boolean default false
      );


alter table "public"."pricing_plans" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text not null,
    "full_name" text,
    "avatar_url" text,
    "role" public.user_role not null default 'user'::public.user_role,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."role_permissions" (
    "role_id" integer not null,
    "permission_id" integer not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."role_permissions" enable row level security;


  create table "public"."roles" (
    "id" integer not null default nextval('public.roles_id_seq'::regclass),
    "name" text not null,
    "description" text,
    "is_system_role" boolean default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."roles" enable row level security;


  create table "public"."user_roles" (
    "user_id" uuid not null,
    "role_id" integer not null,
    "assigned_by" uuid,
    "assigned_at" timestamp with time zone not null default now()
      );


alter table "public"."user_roles" enable row level security;

alter sequence "public"."permissions_id_seq" owned by "public"."permissions"."id";

alter sequence "public"."roles_id_seq" owned by "public"."roles"."id";

CREATE UNIQUE INDEX app_settings_pkey ON public.app_settings USING btree (id);

CREATE UNIQUE INDEX app_settings_setting_key_key ON public.app_settings USING btree (setting_key);

CREATE UNIQUE INDEX billing_config_key_key ON public.billing_config USING btree (key);

CREATE UNIQUE INDEX billing_config_pkey ON public.billing_config USING btree (id);

CREATE UNIQUE INDEX credit_transactions_pkey ON public.credit_transactions USING btree (id);

CREATE UNIQUE INDEX credits_wallets_pkey ON public.credits_wallets USING btree (id);

CREATE UNIQUE INDEX credits_wallets_user_id_key ON public.credits_wallets USING btree (user_id);

CREATE UNIQUE INDEX creem_payments_creem_payment_id_key ON public.creem_payments USING btree (creem_payment_id);

CREATE UNIQUE INDEX creem_payments_pkey ON public.creem_payments USING btree (id);

CREATE UNIQUE INDEX creem_subscriptions_creem_subscription_id_key ON public.creem_subscriptions USING btree (creem_subscription_id);

CREATE UNIQUE INDEX creem_subscriptions_pkey ON public.creem_subscriptions USING btree (id);

CREATE UNIQUE INDEX discount_codes_code_key ON public.discount_codes USING btree (code);

CREATE UNIQUE INDEX discount_codes_creem_discount_id_key ON public.discount_codes USING btree (creem_discount_id);

CREATE UNIQUE INDEX discount_codes_pkey ON public.discount_codes USING btree (id);

CREATE UNIQUE INDEX discount_usage_discount_code_id_user_id_key ON public.discount_usage USING btree (discount_code_id, user_id);

CREATE UNIQUE INDEX discount_usage_pkey ON public.discount_usage USING btree (id);

CREATE UNIQUE INDEX email_providers_pkey ON public.email_providers USING btree (id);

CREATE UNIQUE INDEX email_providers_slug_key ON public.email_providers USING btree (slug);

CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions USING btree (created_at DESC);

CREATE INDEX idx_credit_transactions_reference_id ON public.credit_transactions USING btree (reference_id);

CREATE INDEX idx_credit_transactions_source ON public.credit_transactions USING btree (source);

CREATE INDEX idx_credit_transactions_type ON public.credit_transactions USING btree (type);

CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions USING btree (user_id);

CREATE INDEX idx_credit_transactions_wallet_id ON public.credit_transactions USING btree (wallet_id);

CREATE INDEX idx_credits_wallets_user_id ON public.credits_wallets USING btree (user_id);

CREATE INDEX idx_creem_payments_created_at ON public.creem_payments USING btree (created_at);

CREATE INDEX idx_creem_payments_customer ON public.creem_payments USING btree (creem_customer_id);

CREATE INDEX idx_creem_payments_product ON public.creem_payments USING btree (creem_product_id);

CREATE INDEX idx_creem_payments_status ON public.creem_payments USING btree (status);

CREATE INDEX idx_creem_payments_user_id ON public.creem_payments USING btree (user_id);

CREATE INDEX idx_creem_subs_customer ON public.creem_subscriptions USING btree (creem_customer_id);

CREATE INDEX idx_creem_subs_product ON public.creem_subscriptions USING btree (creem_product_id);

CREATE INDEX idx_creem_subscriptions_creem_id ON public.creem_subscriptions USING btree (creem_subscription_id);

CREATE INDEX idx_creem_subscriptions_payment_email ON public.creem_subscriptions USING btree (payment_email);

CREATE INDEX idx_creem_subscriptions_plan_name ON public.creem_subscriptions USING btree (plan_name);

CREATE INDEX idx_creem_subscriptions_status ON public.creem_subscriptions USING btree (status);

CREATE INDEX idx_creem_subscriptions_user_id ON public.creem_subscriptions USING btree (user_id);

CREATE INDEX idx_discount_codes_code ON public.discount_codes USING btree (code) WHERE (is_active = true);

CREATE INDEX idx_discount_codes_creem_id ON public.discount_codes USING btree (creem_discount_id);

CREATE INDEX idx_discount_usage_user ON public.discount_usage USING btree (user_id);

CREATE INDEX idx_email_providers_is_active ON public.email_providers USING btree (is_active);

CREATE INDEX idx_email_providers_slug ON public.email_providers USING btree (slug);

CREATE INDEX idx_impersonation_sessions_admin_id ON public.impersonation_sessions USING btree (admin_id);

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);

CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);

CREATE UNIQUE INDEX impersonation_sessions_pkey ON public.impersonation_sessions USING btree (id);

CREATE UNIQUE INDEX permissions_new_name_key ON public.permissions USING btree (name);

CREATE UNIQUE INDEX permissions_new_pkey ON public.permissions USING btree (id);

CREATE UNIQUE INDEX pricing_plans_pkey ON public.pricing_plans USING btree (id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX role_permissions_new_pkey ON public.role_permissions USING btree (role_id, permission_id);

CREATE UNIQUE INDEX roles_new_name_key ON public.roles USING btree (name);

CREATE UNIQUE INDEX roles_new_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX unique_creem_product_id ON public.pricing_plans USING btree (creem_product_id);

CREATE UNIQUE INDEX unique_wallet_per_user ON public.credits_wallets USING btree (user_id);

CREATE UNIQUE INDEX user_roles_new_pkey ON public.user_roles USING btree (user_id, role_id);

alter table "public"."app_settings" add constraint "app_settings_pkey" PRIMARY KEY using index "app_settings_pkey";

alter table "public"."billing_config" add constraint "billing_config_pkey" PRIMARY KEY using index "billing_config_pkey";

alter table "public"."credit_transactions" add constraint "credit_transactions_pkey" PRIMARY KEY using index "credit_transactions_pkey";

alter table "public"."credits_wallets" add constraint "credits_wallets_pkey" PRIMARY KEY using index "credits_wallets_pkey";

alter table "public"."creem_payments" add constraint "creem_payments_pkey" PRIMARY KEY using index "creem_payments_pkey";

alter table "public"."creem_subscriptions" add constraint "creem_subscriptions_pkey" PRIMARY KEY using index "creem_subscriptions_pkey";

alter table "public"."discount_codes" add constraint "discount_codes_pkey" PRIMARY KEY using index "discount_codes_pkey";

alter table "public"."discount_usage" add constraint "discount_usage_pkey" PRIMARY KEY using index "discount_usage_pkey";

alter table "public"."email_providers" add constraint "email_providers_pkey" PRIMARY KEY using index "email_providers_pkey";

alter table "public"."impersonation_sessions" add constraint "impersonation_sessions_pkey" PRIMARY KEY using index "impersonation_sessions_pkey";

alter table "public"."permissions" add constraint "permissions_new_pkey" PRIMARY KEY using index "permissions_new_pkey";

alter table "public"."pricing_plans" add constraint "pricing_plans_pkey" PRIMARY KEY using index "pricing_plans_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."role_permissions" add constraint "role_permissions_new_pkey" PRIMARY KEY using index "role_permissions_new_pkey";

alter table "public"."roles" add constraint "roles_new_pkey" PRIMARY KEY using index "roles_new_pkey";

alter table "public"."user_roles" add constraint "user_roles_new_pkey" PRIMARY KEY using index "user_roles_new_pkey";

alter table "public"."app_settings" add constraint "app_settings_setting_key_key" UNIQUE using index "app_settings_setting_key_key";

alter table "public"."billing_config" add constraint "billing_config_key_key" UNIQUE using index "billing_config_key_key";

alter table "public"."billing_config" add constraint "billing_config_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.profiles(id) not valid;

alter table "public"."billing_config" validate constraint "billing_config_updated_by_fkey";

alter table "public"."credit_transactions" add constraint "credit_transactions_source_check" CHECK ((source = ANY (ARRAY['subscription'::text, 'purchase'::text, 'bonus'::text, 'refund'::text, 'usage'::text, 'expiration'::text]))) not valid;

alter table "public"."credit_transactions" validate constraint "credit_transactions_source_check";

alter table "public"."credit_transactions" add constraint "credit_transactions_type_check" CHECK ((type = ANY (ARRAY['earned'::text, 'spent'::text, 'refunded'::text, 'expired'::text]))) not valid;

alter table "public"."credit_transactions" validate constraint "credit_transactions_type_check";

alter table "public"."credit_transactions" add constraint "credit_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."credit_transactions" validate constraint "credit_transactions_user_id_fkey";

alter table "public"."credit_transactions" add constraint "credit_transactions_wallet_id_fkey" FOREIGN KEY (wallet_id) REFERENCES public.credits_wallets(id) ON DELETE CASCADE not valid;

alter table "public"."credit_transactions" validate constraint "credit_transactions_wallet_id_fkey";

alter table "public"."credit_transactions" add constraint "positive_amount" CHECK ((amount > 0)) not valid;

alter table "public"."credit_transactions" validate constraint "positive_amount";

alter table "public"."credits_wallets" add constraint "credits_wallets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."credits_wallets" validate constraint "credits_wallets_user_id_fkey";

alter table "public"."credits_wallets" add constraint "positive_balance" CHECK ((balance >= 0)) not valid;

alter table "public"."credits_wallets" validate constraint "positive_balance";

alter table "public"."credits_wallets" add constraint "unique_wallet_per_user" UNIQUE using index "unique_wallet_per_user";

alter table "public"."creem_payments" add constraint "creem_payments_creem_payment_id_key" UNIQUE using index "creem_payments_creem_payment_id_key";

alter table "public"."creem_payments" add constraint "creem_payments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."creem_payments" validate constraint "creem_payments_user_id_fkey";

alter table "public"."creem_subscriptions" add constraint "creem_subscriptions_creem_subscription_id_key" UNIQUE using index "creem_subscriptions_creem_subscription_id_key";

alter table "public"."creem_subscriptions" add constraint "creem_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."creem_subscriptions" validate constraint "creem_subscriptions_user_id_fkey";

alter table "public"."discount_codes" add constraint "discount_codes_code_key" UNIQUE using index "discount_codes_code_key";

alter table "public"."discount_codes" add constraint "discount_codes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."discount_codes" validate constraint "discount_codes_created_by_fkey";

alter table "public"."discount_codes" add constraint "discount_codes_creem_discount_id_key" UNIQUE using index "discount_codes_creem_discount_id_key";

alter table "public"."discount_codes" add constraint "discount_codes_discount_type_check" CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text]))) not valid;

alter table "public"."discount_codes" validate constraint "discount_codes_discount_type_check";

alter table "public"."discount_usage" add constraint "discount_usage_discount_code_id_fkey" FOREIGN KEY (discount_code_id) REFERENCES public.discount_codes(id) ON DELETE CASCADE not valid;

alter table "public"."discount_usage" validate constraint "discount_usage_discount_code_id_fkey";

alter table "public"."discount_usage" add constraint "discount_usage_discount_code_id_user_id_key" UNIQUE using index "discount_usage_discount_code_id_user_id_key";

alter table "public"."discount_usage" add constraint "discount_usage_payment_id_fkey" FOREIGN KEY (payment_id) REFERENCES public.creem_payments(id) not valid;

alter table "public"."discount_usage" validate constraint "discount_usage_payment_id_fkey";

alter table "public"."discount_usage" add constraint "discount_usage_subscription_id_fkey" FOREIGN KEY (subscription_id) REFERENCES public.creem_subscriptions(id) not valid;

alter table "public"."discount_usage" validate constraint "discount_usage_subscription_id_fkey";

alter table "public"."discount_usage" add constraint "discount_usage_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."discount_usage" validate constraint "discount_usage_user_id_fkey";

alter table "public"."email_providers" add constraint "email_providers_slug_key" UNIQUE using index "email_providers_slug_key";

alter table "public"."impersonation_sessions" add constraint "different_users" CHECK ((admin_id <> impersonated_user_id)) not valid;

alter table "public"."impersonation_sessions" validate constraint "different_users";

alter table "public"."impersonation_sessions" add constraint "impersonation_sessions_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."impersonation_sessions" validate constraint "impersonation_sessions_admin_id_fkey";

alter table "public"."impersonation_sessions" add constraint "impersonation_sessions_impersonated_user_id_fkey" FOREIGN KEY (impersonated_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."impersonation_sessions" validate constraint "impersonation_sessions_impersonated_user_id_fkey";

alter table "public"."permissions" add constraint "permissions_new_name_key" UNIQUE using index "permissions_new_name_key";

alter table "public"."pricing_plans" add constraint "pricing_plans_payment_type_check" CHECK ((payment_type = ANY (ARRAY['subscription'::text, 'one_time'::text]))) not valid;

alter table "public"."pricing_plans" validate constraint "pricing_plans_payment_type_check";

alter table "public"."pricing_plans" add constraint "unique_creem_product_id" UNIQUE using index "unique_creem_product_id";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."role_permissions" add constraint "role_permissions_new_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_new_permission_id_fkey";

alter table "public"."role_permissions" add constraint "role_permissions_new_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_new_role_id_fkey";

alter table "public"."roles" add constraint "roles_new_name_key" UNIQUE using index "roles_new_name_key";

alter table "public"."user_roles" add constraint "user_roles_new_assigned_by_fkey" FOREIGN KEY (assigned_by) REFERENCES public.profiles(id) not valid;

alter table "public"."user_roles" validate constraint "user_roles_new_assigned_by_fkey";

alter table "public"."user_roles" add constraint "user_roles_new_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_new_role_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_new_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_new_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_credits_wallet_for_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.credits_wallets (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
  user_profile public.profiles%rowtype;
BEGIN
  -- Get the user's profile information
  SELECT * INTO user_profile
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;
  
  -- If profile doesn't exist, return event unchanged
  IF user_profile IS NULL THEN
    RETURN event;
  END IF;
  
  -- Add custom claims to the token
  event := jsonb_set(
    event,
    '{claims,user_role}',
    to_jsonb(user_profile.role)
  );
  
  event := jsonb_set(
    event,
    '{claims,email}',
    to_jsonb(user_profile.email)
  );
  
  event := jsonb_set(
    event,
    '{claims,full_name}',
    to_jsonb(user_profile.full_name)
  );
  
  -- Add admin claim for easy checking
  event := jsonb_set(
    event,
    '{claims,is_admin}',
    to_jsonb(user_profile.role = 'admin')
  );
  
  RETURN event;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything goes wrong, return the original event
    -- This ensures login doesn't break even if there are issues
    RETURN event;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_credits_analytics()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result json;
    total_wallets_count int;
    active_wallets_count int;
    total_credits_distributed_sum numeric;
    total_credits_spent_sum numeric;
    total_credits_outstanding_sum numeric;
    avg_balance_per_user_val numeric;
    credits_granted_today_sum numeric;
    credits_spent_today_sum numeric;
    credits_granted_this_month_sum numeric;
    credits_spent_this_month_sum numeric;
    top_spenders_count_val int;
    zero_balance_wallets_count int;
    high_balance_wallets_count int;
    recent_activity_count_val int;
BEGIN
    -- Get wallet statistics (fixed column names)
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE balance > 0),
        COALESCE(SUM(total_earned), 0),
        COALESCE(SUM(total_spent), 0),
        COALESCE(SUM(balance), 0),
        COALESCE(AVG(balance), 0),
        COUNT(*) FILTER (WHERE balance = 0),
        COUNT(*) FILTER (WHERE balance >= 1000)
    INTO 
        total_wallets_count,
        active_wallets_count,
        total_credits_distributed_sum,
        total_credits_spent_sum,
        total_credits_outstanding_sum,
        avg_balance_per_user_val,
        zero_balance_wallets_count,
        high_balance_wallets_count
    FROM credits_wallets;

    -- Get today's credits granted (earned + refunded) - fixed column name
    SELECT COALESCE(SUM(amount), 0)
    INTO credits_granted_today_sum
    FROM credit_transactions
    WHERE DATE(created_at) = CURRENT_DATE
    AND type IN ('earned', 'refunded');

    -- Get today's credits spent - fixed column name
    SELECT COALESCE(SUM(amount), 0)
    INTO credits_spent_today_sum
    FROM credit_transactions
    WHERE DATE(created_at) = CURRENT_DATE
    AND type = 'spent';

    -- Get this month's credits granted (earned + refunded) - fixed column name
    SELECT COALESCE(SUM(amount), 0)
    INTO credits_granted_this_month_sum
    FROM credit_transactions
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND type IN ('earned', 'refunded');

    -- Get this month's credits spent - fixed column name
    SELECT COALESCE(SUM(amount), 0)
    INTO credits_spent_this_month_sum
    FROM credit_transactions
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND type = 'spent';

    -- Get top spenders count (users who spent more than 1000 credits) - fixed column name
    SELECT COUNT(DISTINCT user_id)
    INTO top_spenders_count_val
    FROM credit_transactions
    WHERE type = 'spent'
    GROUP BY user_id
    HAVING SUM(amount) > 1000;

    -- Get recent activity count (transactions in last 7 days)
    SELECT COUNT(*)
    INTO recent_activity_count_val
    FROM credit_transactions
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

    -- Build the result JSON
    SELECT json_build_object(
        'total_wallets', total_wallets_count,
        'active_wallets', active_wallets_count,
        'total_credits_distributed', total_credits_distributed_sum,
        'total_credits_spent', total_credits_spent_sum,
        'total_credits_outstanding', total_credits_outstanding_sum,
        'avg_balance_per_user', ROUND(avg_balance_per_user_val, 2),
        'credits_granted_today', credits_granted_today_sum,
        'credits_spent_today', credits_spent_today_sum,
        'credits_granted_this_month', credits_granted_this_month_sum,
        'credits_spent_this_month', credits_spent_this_month_sum,
        'top_spenders_count', COALESCE(top_spenders_count_val, 0),
        'zero_balance_wallets', zero_balance_wallets_count,
        'high_balance_wallets', high_balance_wallets_count,
        'recent_activity_count', recent_activity_count_val
    ) INTO result;

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_discount_code_usage()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE discount_codes
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = NEW.discount_code_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_profile_to_auth()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update auth.users metadata when profile is updated
  IF (NEW.full_name IS DISTINCT FROM OLD.full_name) OR 
     (NEW.avatar_url IS DISTINCT FROM OLD.avatar_url) THEN
    
    UPDATE auth.users
    SET 
      raw_user_meta_data = jsonb_set(
        jsonb_set(
          COALESCE(raw_user_meta_data, '{}'::jsonb),
          '{full_name}',
          to_jsonb(NEW.full_name),
          true
        ),
        '{avatar_url}',
        to_jsonb(NEW.avatar_url),
        true
      )
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_app_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_credits_balance(p_user_id uuid, p_amount integer, p_type text, p_description text, p_source text, p_reference_id text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(wallet_id uuid, new_balance integer, transaction_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_wallet_id UUID;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current wallet
  SELECT id, balance INTO v_wallet_id, v_current_balance
  FROM credits_wallets
  WHERE user_id = p_user_id;
  
  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'Credits wallet not found for user %', p_user_id;
  END IF;
  
  -- Calculate new balance
  IF p_type IN ('earned', 'refunded') THEN
    v_new_balance := v_current_balance + p_amount;
  ELSIF p_type IN ('spent', 'expired') THEN
    v_new_balance := v_current_balance - p_amount;
    -- Check for sufficient balance
    IF v_new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient credits. Current balance: %, Requested: %', v_current_balance, p_amount;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid transaction type: %', p_type;
  END IF;
  
  -- Update wallet balance and totals
  UPDATE credits_wallets 
  SET 
    balance = v_new_balance,
    total_earned = CASE WHEN p_type IN ('earned', 'refunded') THEN total_earned + p_amount ELSE total_earned END,
    total_spent = CASE WHEN p_type IN ('spent', 'expired') THEN total_spent + p_amount ELSE total_spent END,
    updated_at = now()
  WHERE id = v_wallet_id;
  
  -- Create transaction record
  INSERT INTO credit_transactions (
    wallet_id,
    user_id,
    type,
    amount,
    balance_after,
    description,
    source,
    reference_id,
    metadata
  ) VALUES (
    v_wallet_id,
    p_user_id,
    p_type,
    p_amount,
    v_new_balance,
    p_description,
    p_source,
    p_reference_id,
    p_metadata
  ) RETURNING id INTO v_transaction_id;
  
  -- Return results
  RETURN QUERY SELECT v_wallet_id, v_new_balance, v_transaction_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."app_settings" to "anon";

grant insert on table "public"."app_settings" to "anon";

grant references on table "public"."app_settings" to "anon";

grant select on table "public"."app_settings" to "anon";

grant trigger on table "public"."app_settings" to "anon";

grant truncate on table "public"."app_settings" to "anon";

grant update on table "public"."app_settings" to "anon";

grant delete on table "public"."app_settings" to "authenticated";

grant insert on table "public"."app_settings" to "authenticated";

grant references on table "public"."app_settings" to "authenticated";

grant select on table "public"."app_settings" to "authenticated";

grant trigger on table "public"."app_settings" to "authenticated";

grant truncate on table "public"."app_settings" to "authenticated";

grant update on table "public"."app_settings" to "authenticated";

grant delete on table "public"."app_settings" to "service_role";

grant insert on table "public"."app_settings" to "service_role";

grant references on table "public"."app_settings" to "service_role";

grant select on table "public"."app_settings" to "service_role";

grant trigger on table "public"."app_settings" to "service_role";

grant truncate on table "public"."app_settings" to "service_role";

grant update on table "public"."app_settings" to "service_role";

grant delete on table "public"."billing_config" to "anon";

grant insert on table "public"."billing_config" to "anon";

grant references on table "public"."billing_config" to "anon";

grant select on table "public"."billing_config" to "anon";

grant trigger on table "public"."billing_config" to "anon";

grant truncate on table "public"."billing_config" to "anon";

grant update on table "public"."billing_config" to "anon";

grant delete on table "public"."billing_config" to "authenticated";

grant insert on table "public"."billing_config" to "authenticated";

grant references on table "public"."billing_config" to "authenticated";

grant select on table "public"."billing_config" to "authenticated";

grant trigger on table "public"."billing_config" to "authenticated";

grant truncate on table "public"."billing_config" to "authenticated";

grant update on table "public"."billing_config" to "authenticated";

grant delete on table "public"."billing_config" to "service_role";

grant insert on table "public"."billing_config" to "service_role";

grant references on table "public"."billing_config" to "service_role";

grant select on table "public"."billing_config" to "service_role";

grant trigger on table "public"."billing_config" to "service_role";

grant truncate on table "public"."billing_config" to "service_role";

grant update on table "public"."billing_config" to "service_role";

grant delete on table "public"."credit_transactions" to "anon";

grant insert on table "public"."credit_transactions" to "anon";

grant references on table "public"."credit_transactions" to "anon";

grant select on table "public"."credit_transactions" to "anon";

grant trigger on table "public"."credit_transactions" to "anon";

grant truncate on table "public"."credit_transactions" to "anon";

grant update on table "public"."credit_transactions" to "anon";

grant delete on table "public"."credit_transactions" to "authenticated";

grant insert on table "public"."credit_transactions" to "authenticated";

grant references on table "public"."credit_transactions" to "authenticated";

grant select on table "public"."credit_transactions" to "authenticated";

grant trigger on table "public"."credit_transactions" to "authenticated";

grant truncate on table "public"."credit_transactions" to "authenticated";

grant update on table "public"."credit_transactions" to "authenticated";

grant delete on table "public"."credit_transactions" to "service_role";

grant insert on table "public"."credit_transactions" to "service_role";

grant references on table "public"."credit_transactions" to "service_role";

grant select on table "public"."credit_transactions" to "service_role";

grant trigger on table "public"."credit_transactions" to "service_role";

grant truncate on table "public"."credit_transactions" to "service_role";

grant update on table "public"."credit_transactions" to "service_role";

grant delete on table "public"."credits_wallets" to "anon";

grant insert on table "public"."credits_wallets" to "anon";

grant references on table "public"."credits_wallets" to "anon";

grant select on table "public"."credits_wallets" to "anon";

grant trigger on table "public"."credits_wallets" to "anon";

grant truncate on table "public"."credits_wallets" to "anon";

grant update on table "public"."credits_wallets" to "anon";

grant delete on table "public"."credits_wallets" to "authenticated";

grant insert on table "public"."credits_wallets" to "authenticated";

grant references on table "public"."credits_wallets" to "authenticated";

grant select on table "public"."credits_wallets" to "authenticated";

grant trigger on table "public"."credits_wallets" to "authenticated";

grant truncate on table "public"."credits_wallets" to "authenticated";

grant update on table "public"."credits_wallets" to "authenticated";

grant delete on table "public"."credits_wallets" to "service_role";

grant insert on table "public"."credits_wallets" to "service_role";

grant references on table "public"."credits_wallets" to "service_role";

grant select on table "public"."credits_wallets" to "service_role";

grant trigger on table "public"."credits_wallets" to "service_role";

grant truncate on table "public"."credits_wallets" to "service_role";

grant update on table "public"."credits_wallets" to "service_role";

grant delete on table "public"."creem_payments" to "anon";

grant insert on table "public"."creem_payments" to "anon";

grant references on table "public"."creem_payments" to "anon";

grant select on table "public"."creem_payments" to "anon";

grant trigger on table "public"."creem_payments" to "anon";

grant truncate on table "public"."creem_payments" to "anon";

grant update on table "public"."creem_payments" to "anon";

grant delete on table "public"."creem_payments" to "authenticated";

grant insert on table "public"."creem_payments" to "authenticated";

grant references on table "public"."creem_payments" to "authenticated";

grant select on table "public"."creem_payments" to "authenticated";

grant trigger on table "public"."creem_payments" to "authenticated";

grant truncate on table "public"."creem_payments" to "authenticated";

grant update on table "public"."creem_payments" to "authenticated";

grant delete on table "public"."creem_payments" to "service_role";

grant insert on table "public"."creem_payments" to "service_role";

grant references on table "public"."creem_payments" to "service_role";

grant select on table "public"."creem_payments" to "service_role";

grant trigger on table "public"."creem_payments" to "service_role";

grant truncate on table "public"."creem_payments" to "service_role";

grant update on table "public"."creem_payments" to "service_role";

grant delete on table "public"."creem_subscriptions" to "anon";

grant insert on table "public"."creem_subscriptions" to "anon";

grant references on table "public"."creem_subscriptions" to "anon";

grant select on table "public"."creem_subscriptions" to "anon";

grant trigger on table "public"."creem_subscriptions" to "anon";

grant truncate on table "public"."creem_subscriptions" to "anon";

grant update on table "public"."creem_subscriptions" to "anon";

grant delete on table "public"."creem_subscriptions" to "authenticated";

grant insert on table "public"."creem_subscriptions" to "authenticated";

grant references on table "public"."creem_subscriptions" to "authenticated";

grant select on table "public"."creem_subscriptions" to "authenticated";

grant trigger on table "public"."creem_subscriptions" to "authenticated";

grant truncate on table "public"."creem_subscriptions" to "authenticated";

grant update on table "public"."creem_subscriptions" to "authenticated";

grant delete on table "public"."creem_subscriptions" to "service_role";

grant insert on table "public"."creem_subscriptions" to "service_role";

grant references on table "public"."creem_subscriptions" to "service_role";

grant select on table "public"."creem_subscriptions" to "service_role";

grant trigger on table "public"."creem_subscriptions" to "service_role";

grant truncate on table "public"."creem_subscriptions" to "service_role";

grant update on table "public"."creem_subscriptions" to "service_role";

grant delete on table "public"."discount_codes" to "anon";

grant insert on table "public"."discount_codes" to "anon";

grant references on table "public"."discount_codes" to "anon";

grant select on table "public"."discount_codes" to "anon";

grant trigger on table "public"."discount_codes" to "anon";

grant truncate on table "public"."discount_codes" to "anon";

grant update on table "public"."discount_codes" to "anon";

grant delete on table "public"."discount_codes" to "authenticated";

grant insert on table "public"."discount_codes" to "authenticated";

grant references on table "public"."discount_codes" to "authenticated";

grant select on table "public"."discount_codes" to "authenticated";

grant trigger on table "public"."discount_codes" to "authenticated";

grant truncate on table "public"."discount_codes" to "authenticated";

grant update on table "public"."discount_codes" to "authenticated";

grant delete on table "public"."discount_codes" to "service_role";

grant insert on table "public"."discount_codes" to "service_role";

grant references on table "public"."discount_codes" to "service_role";

grant select on table "public"."discount_codes" to "service_role";

grant trigger on table "public"."discount_codes" to "service_role";

grant truncate on table "public"."discount_codes" to "service_role";

grant update on table "public"."discount_codes" to "service_role";

grant delete on table "public"."discount_usage" to "anon";

grant insert on table "public"."discount_usage" to "anon";

grant references on table "public"."discount_usage" to "anon";

grant select on table "public"."discount_usage" to "anon";

grant trigger on table "public"."discount_usage" to "anon";

grant truncate on table "public"."discount_usage" to "anon";

grant update on table "public"."discount_usage" to "anon";

grant delete on table "public"."discount_usage" to "authenticated";

grant insert on table "public"."discount_usage" to "authenticated";

grant references on table "public"."discount_usage" to "authenticated";

grant select on table "public"."discount_usage" to "authenticated";

grant trigger on table "public"."discount_usage" to "authenticated";

grant truncate on table "public"."discount_usage" to "authenticated";

grant update on table "public"."discount_usage" to "authenticated";

grant delete on table "public"."discount_usage" to "service_role";

grant insert on table "public"."discount_usage" to "service_role";

grant references on table "public"."discount_usage" to "service_role";

grant select on table "public"."discount_usage" to "service_role";

grant trigger on table "public"."discount_usage" to "service_role";

grant truncate on table "public"."discount_usage" to "service_role";

grant update on table "public"."discount_usage" to "service_role";

grant delete on table "public"."email_providers" to "anon";

grant insert on table "public"."email_providers" to "anon";

grant references on table "public"."email_providers" to "anon";

grant select on table "public"."email_providers" to "anon";

grant trigger on table "public"."email_providers" to "anon";

grant truncate on table "public"."email_providers" to "anon";

grant update on table "public"."email_providers" to "anon";

grant delete on table "public"."email_providers" to "authenticated";

grant insert on table "public"."email_providers" to "authenticated";

grant references on table "public"."email_providers" to "authenticated";

grant select on table "public"."email_providers" to "authenticated";

grant trigger on table "public"."email_providers" to "authenticated";

grant truncate on table "public"."email_providers" to "authenticated";

grant update on table "public"."email_providers" to "authenticated";

grant delete on table "public"."email_providers" to "service_role";

grant insert on table "public"."email_providers" to "service_role";

grant references on table "public"."email_providers" to "service_role";

grant select on table "public"."email_providers" to "service_role";

grant trigger on table "public"."email_providers" to "service_role";

grant truncate on table "public"."email_providers" to "service_role";

grant update on table "public"."email_providers" to "service_role";

grant delete on table "public"."impersonation_sessions" to "anon";

grant insert on table "public"."impersonation_sessions" to "anon";

grant references on table "public"."impersonation_sessions" to "anon";

grant select on table "public"."impersonation_sessions" to "anon";

grant trigger on table "public"."impersonation_sessions" to "anon";

grant truncate on table "public"."impersonation_sessions" to "anon";

grant update on table "public"."impersonation_sessions" to "anon";

grant delete on table "public"."impersonation_sessions" to "authenticated";

grant insert on table "public"."impersonation_sessions" to "authenticated";

grant references on table "public"."impersonation_sessions" to "authenticated";

grant select on table "public"."impersonation_sessions" to "authenticated";

grant trigger on table "public"."impersonation_sessions" to "authenticated";

grant truncate on table "public"."impersonation_sessions" to "authenticated";

grant update on table "public"."impersonation_sessions" to "authenticated";

grant delete on table "public"."impersonation_sessions" to "service_role";

grant insert on table "public"."impersonation_sessions" to "service_role";

grant references on table "public"."impersonation_sessions" to "service_role";

grant select on table "public"."impersonation_sessions" to "service_role";

grant trigger on table "public"."impersonation_sessions" to "service_role";

grant truncate on table "public"."impersonation_sessions" to "service_role";

grant update on table "public"."impersonation_sessions" to "service_role";

grant delete on table "public"."permissions" to "anon";

grant insert on table "public"."permissions" to "anon";

grant references on table "public"."permissions" to "anon";

grant select on table "public"."permissions" to "anon";

grant trigger on table "public"."permissions" to "anon";

grant truncate on table "public"."permissions" to "anon";

grant update on table "public"."permissions" to "anon";

grant delete on table "public"."permissions" to "authenticated";

grant insert on table "public"."permissions" to "authenticated";

grant references on table "public"."permissions" to "authenticated";

grant select on table "public"."permissions" to "authenticated";

grant trigger on table "public"."permissions" to "authenticated";

grant truncate on table "public"."permissions" to "authenticated";

grant update on table "public"."permissions" to "authenticated";

grant delete on table "public"."permissions" to "service_role";

grant insert on table "public"."permissions" to "service_role";

grant references on table "public"."permissions" to "service_role";

grant select on table "public"."permissions" to "service_role";

grant trigger on table "public"."permissions" to "service_role";

grant truncate on table "public"."permissions" to "service_role";

grant update on table "public"."permissions" to "service_role";

grant delete on table "public"."pricing_plans" to "anon";

grant insert on table "public"."pricing_plans" to "anon";

grant references on table "public"."pricing_plans" to "anon";

grant select on table "public"."pricing_plans" to "anon";

grant trigger on table "public"."pricing_plans" to "anon";

grant truncate on table "public"."pricing_plans" to "anon";

grant update on table "public"."pricing_plans" to "anon";

grant delete on table "public"."pricing_plans" to "authenticated";

grant insert on table "public"."pricing_plans" to "authenticated";

grant references on table "public"."pricing_plans" to "authenticated";

grant select on table "public"."pricing_plans" to "authenticated";

grant trigger on table "public"."pricing_plans" to "authenticated";

grant truncate on table "public"."pricing_plans" to "authenticated";

grant update on table "public"."pricing_plans" to "authenticated";

grant delete on table "public"."pricing_plans" to "service_role";

grant insert on table "public"."pricing_plans" to "service_role";

grant references on table "public"."pricing_plans" to "service_role";

grant select on table "public"."pricing_plans" to "service_role";

grant trigger on table "public"."pricing_plans" to "service_role";

grant truncate on table "public"."pricing_plans" to "service_role";

grant update on table "public"."pricing_plans" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."role_permissions" to "anon";

grant insert on table "public"."role_permissions" to "anon";

grant references on table "public"."role_permissions" to "anon";

grant select on table "public"."role_permissions" to "anon";

grant trigger on table "public"."role_permissions" to "anon";

grant truncate on table "public"."role_permissions" to "anon";

grant update on table "public"."role_permissions" to "anon";

grant delete on table "public"."role_permissions" to "authenticated";

grant insert on table "public"."role_permissions" to "authenticated";

grant references on table "public"."role_permissions" to "authenticated";

grant select on table "public"."role_permissions" to "authenticated";

grant trigger on table "public"."role_permissions" to "authenticated";

grant truncate on table "public"."role_permissions" to "authenticated";

grant update on table "public"."role_permissions" to "authenticated";

grant delete on table "public"."role_permissions" to "service_role";

grant insert on table "public"."role_permissions" to "service_role";

grant references on table "public"."role_permissions" to "service_role";

grant select on table "public"."role_permissions" to "service_role";

grant trigger on table "public"."role_permissions" to "service_role";

grant truncate on table "public"."role_permissions" to "service_role";

grant update on table "public"."role_permissions" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";


  create policy "Admins can manage app settings"
  on "public"."app_settings"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view app settings"
  on "public"."app_settings"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Allow admins to update settings"
  on "public"."app_settings"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Allow admins to view settings"
  on "public"."app_settings"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can update billing config"
  on "public"."billing_config"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "Admins can view billing config"
  on "public"."billing_config"
  as permissive
  for select
  to public
using (public.is_admin());



  create policy "Admins can manage transactions"
  on "public"."credit_transactions"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view all transactions"
  on "public"."credit_transactions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Service role can manage transactions"
  on "public"."credit_transactions"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Users can view own transactions"
  on "public"."credit_transactions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins can manage wallets"
  on "public"."credits_wallets"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view all wallets"
  on "public"."credits_wallets"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Service role can manage wallets"
  on "public"."credits_wallets"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Users can view own wallet"
  on "public"."credits_wallets"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins can manage payments"
  on "public"."creem_payments"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view all creem payments"
  on "public"."creem_payments"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view all payments"
  on "public"."creem_payments"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Service role can manage creem payments"
  on "public"."creem_payments"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Users can view own creem payments"
  on "public"."creem_payments"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own payments"
  on "public"."creem_payments"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))));



  create policy "Webhooks can insert payments"
  on "public"."creem_payments"
  as permissive
  for insert
  to public
with check (true);



  create policy "Webhooks can update payments"
  on "public"."creem_payments"
  as permissive
  for update
  to public
using (true);



  create policy "Admins can manage subscriptions"
  on "public"."creem_subscriptions"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view all subscriptions"
  on "public"."creem_subscriptions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Users can view own subscriptions"
  on "public"."creem_subscriptions"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))));



  create policy "Webhooks can insert subscriptions"
  on "public"."creem_subscriptions"
  as permissive
  for insert
  to public
with check (true);



  create policy "Webhooks can update subscriptions"
  on "public"."creem_subscriptions"
  as permissive
  for update
  to public
using (true);



  create policy "Admins can manage discount codes"
  on "public"."discount_codes"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can manage discounts"
  on "public"."discount_codes"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view all discounts"
  on "public"."discount_codes"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Anyone can view active discount codes"
  on "public"."discount_codes"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Anyone can view active discounts"
  on "public"."discount_codes"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Admins can view all discount usage"
  on "public"."discount_usage"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Service role can insert discount usage"
  on "public"."discount_usage"
  as permissive
  for insert
  to public
with check (true);



  create policy "System can insert discount usage"
  on "public"."discount_usage"
  as permissive
  for insert
  to public
with check (true);



  create policy "Users can view own discount usage"
  on "public"."discount_usage"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))));



  create policy "Admins can manage email providers"
  on "public"."email_providers"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can update email providers"
  on "public"."email_providers"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view email providers"
  on "public"."email_providers"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Only admins can create impersonation sessions"
  on "public"."impersonation_sessions"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Only admins can end impersonation sessions"
  on "public"."impersonation_sessions"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Only admins can view impersonation sessions"
  on "public"."impersonation_sessions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can delete permissions"
  on "public"."permissions"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can insert permissions"
  on "public"."permissions"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can update permissions"
  on "public"."permissions"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view all permissions"
  on "public"."permissions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Anyone can view permissions"
  on "public"."permissions"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can delete pricing plans"
  on "public"."pricing_plans"
  as permissive
  for delete
  to public
using (public.is_admin());



  create policy "Admins can insert pricing plans"
  on "public"."pricing_plans"
  as permissive
  for insert
  to public
with check (public.is_admin());



  create policy "Admins can update pricing plans"
  on "public"."pricing_plans"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "Admins can view all pricing plans"
  on "public"."pricing_plans"
  as permissive
  for select
  to public
using (public.is_admin());



  create policy "Anyone can view active pricing plans"
  on "public"."pricing_plans"
  as permissive
  for select
  to public
using ((is_active = true));



  create policy "Admins can update all profiles"
  on "public"."profiles"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "Admins can view all profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using (public.is_admin());



  create policy "Allow profile creation on signup"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check (true);



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view their own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Admins can manage role_permissions"
  on "public"."role_permissions"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Anyone can view role permissions"
  on "public"."role_permissions"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can delete roles"
  on "public"."roles"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can insert roles"
  on "public"."roles"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can update roles"
  on "public"."roles"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Admins can view all roles"
  on "public"."roles"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Anyone can view roles"
  on "public"."roles"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage user_roles"
  on "public"."user_roles"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_app_settings_updated_at();

CREATE TRIGGER update_creem_payments_updated_at BEFORE UPDATE ON public.creem_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creem_subscriptions_updated_at BEFORE UPDATE ON public.creem_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_discount_used AFTER INSERT ON public.discount_usage FOR EACH ROW EXECUTE FUNCTION public.increment_discount_code_usage();

CREATE TRIGGER update_email_providers_updated_at BEFORE UPDATE ON public.email_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON public.pricing_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER create_credits_wallet_trigger AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_credits_wallet_for_user();

CREATE TRIGGER sync_profile_to_auth_trigger AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_auth();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Anyone can view avatars"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Users can delete their own avatar"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can update their own avatar"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload their own avatar"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



