-- Direct SQL script to fix credits issue for prod_5msxNa5N9YZGDTD5Zmz3GF
-- Run this in your Supabase SQL editor

-- Step 1: Update existing pricing plans to grant credits
UPDATE pricing_plans SET 
  credits_per_cycle = CASE 
    WHEN creem_product_id = 'prod_5msxNa5N9YZGDTD5Zmz3GF' THEN 500    -- Starter: 500 credits
    WHEN creem_product_id = 'prod_1XUVlnsLJohbauUKSW8lzD' THEN 2000   -- Pro: 2000 credits  
    WHEN creem_product_id = 'prod_7VuuP3Ect93sLe8KgKk9Ye' THEN 10000  -- Enterprise: 10000 credits
    ELSE credits_per_cycle
  END,
  grants_credits = true,
  updated_at = now()
WHERE creem_product_id IN (
  'prod_5msxNa5N9YZGDTD5Zmz3GF', 
  'prod_1XUVlnsLJohbauUKSW8lzD', 
  'prod_7VuuP3Ect93sLe8KgKk9Ye'
);

-- Step 2: Find users who have active subscriptions and grant them credits
DO $$
DECLARE
    sub_record RECORD;
    plan_record RECORD;
BEGIN
  -- Loop through each plan and grant credits to active subscribers
  FOR plan_record IN 
    SELECT * FROM pricing_plans 
    WHERE grants_credits = true 
    AND credits_per_cycle > 0
  LOOP
    RAISE NOTICE 'Processing plan: % (% credits)', plan_record.name, plan_record.credits_per_cycle;
    
    -- Loop through active subscriptions for this product
    FOR sub_record IN 
      SELECT cs.*, p.email 
      FROM creem_subscriptions cs
      JOIN profiles p ON p.id = cs.user_id
      WHERE cs.creem_product_id = plan_record.creem_product_id
      AND cs.status = 'active'
    LOOP
      RAISE NOTICE 'Granting credits to user: %', sub_record.email;
      
      -- Grant credits using the database function with proper types
      PERFORM update_credits_balance(
        sub_record.user_id::uuid,
        plan_record.credits_per_cycle::integer,
        'earned'::text,
        format('%s credits from %s subscription (manual fix)', 
          plan_record.credits_per_cycle, 
          plan_record.name)::text,
        'subscription'::text,
        sub_record.creem_subscription_id::text,
        jsonb_build_object(
          'plan_name', plan_record.name,
          'plan_id', plan_record.id,
          'product_id', plan_record.creem_product_id,
          'customer_email', sub_record.email,
          'manual_fix', true,
          'fixed_at', now()
        )::jsonb
      );
      
      RAISE NOTICE 'Granted % credits to %', plan_record.credits_per_cycle, sub_record.email;
    END LOOP;
  END LOOP;
END $$;

-- Step 3: Verify the fix worked - show credits for all users with subscriptions
SELECT 
  p.email,
  pp.name as plan_name,
  cw.balance,
  cw.total_earned,
  cw.total_spent,
  cs.status as subscription_status,
  cs.creem_product_id,
  pp.credits_per_cycle
FROM profiles p
LEFT JOIN credits_wallets cw ON cw.user_id = p.id  
LEFT JOIN creem_subscriptions cs ON cs.user_id = p.id
LEFT JOIN pricing_plans pp ON pp.creem_product_id = cs.creem_product_id
WHERE cs.creem_product_id IN (
  'prod_5msxNa5N9YZGDTD5Zmz3GF',
  'prod_1XUVlnsLJohbauUKSW8lzD', 
  'prod_7VuuP3Ect93sLe8KgKk9Ye'
)
ORDER BY p.email;