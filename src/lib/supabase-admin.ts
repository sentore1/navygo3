/**
 * Supabase Admin Clients
 * 
 * Use these helper functions to create Supabase clients with appropriate permissions.
 * 
 * IMPORTANT: Never use these in client-side code! Only use in:
 * - API routes (src/app/api/*)
 * - Server components
 * - Edge functions
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with Secret Key
 * 
 * Use this for MOST server-side operations:
 * - User-specific operations
 * - Operations that should respect RLS policies
 * - Sending notifications
 * - Reading/writing data with proper permissions
 * 
 * This key RESPECTS Row Level Security policies.
 * 
 * @example
 * ```typescript
 * const supabase = createSecretClient();
 * const { data } = await supabase
 *   .from('goals')
 *   .select('*')
 *   .eq('user_id', userId); // RLS will enforce user can only see their goals
 * ```
 */
export function createSecretClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      'Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are set.'
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a Supabase client with Service Role Key
 * 
 * ⚠️ USE SPARINGLY! This key has FULL ADMIN ACCESS and bypasses ALL security rules.
 * 
 * Only use for:
 * - Admin operations that need to bypass RLS
 * - External webhooks (Stripe, Polar, etc.)
 * - Bulk operations across all users
 * - System maintenance tasks
 * 
 * This key BYPASSES Row Level Security policies.
 * 
 * @example
 * ```typescript
 * // ✅ Good use case: External webhook
 * const supabase = createServiceRoleClient();
 * await supabase
 *   .from('subscriptions')
 *   .update({ status: 'active' })
 *   .eq('stripe_customer_id', customerId);
 * 
 * // ❌ Bad use case: User operation (use createSecretClient instead)
 * const supabase = createServiceRoleClient();
 * await supabase
 *   .from('goals')
 *   .select('*')
 *   .eq('user_id', userId);
 * ```
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Decision Helper: Which client should I use?
 * 
 * Use createSecretClient() when:
 * ✅ Operating on behalf of a specific user
 * ✅ You want RLS policies to be enforced
 * ✅ Sending user notifications
 * ✅ Most API routes
 * ✅ Most Edge Functions
 * 
 * Use createServiceRoleClient() when:
 * ⚠️ Processing external webhooks (Stripe, Polar)
 * ⚠️ Admin operations that need to bypass RLS
 * ⚠️ Bulk operations across all users
 * ⚠️ System maintenance tasks
 * ⚠️ Creating users programmatically
 * 
 * When in doubt, use createSecretClient() - it's safer!
 */
