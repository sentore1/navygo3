// Supabase Edge Function for sending daily goal reminders
// Deploy with: supabase functions deploy send-goal-reminders
// Schedule with: supabase functions schedule send-goal-reminders --cron "0 9 * * *"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get users who have goal reminders enabled
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, email, name, notifications')
      .not('notifications->goalReminders', 'is', false);

    if (usersError) throw usersError;

    const results = [];

    for (const user of users || []) {
      // Check if user has incomplete goals
      const { data: goals, error: goalsError } = await supabaseClient
        .from('goals')
        .select('id, title, category')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(5); // Get top 5 most recent goals

      if (goalsError) {
        console.error(`Error fetching goals for user ${user.id}:`, goalsError);
        continue;
      }

      if (goals && goals.length > 0) {
        // Send notification via your app's API
        const notificationResponse = await fetch(
          `${Deno.env.get('APP_URL')}/api/send-notification`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              type: 'goal_reminder',
              userId: user.id,
              data: {
                pendingGoals: goals.length,
                goals: goals.map(g => ({ title: g.title, category: g.category })),
              },
            }),
          }
        );

        results.push({
          userId: user.id,
          email: user.email,
          pendingGoals: goals.length,
          sent: notificationResponse.ok,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} reminders`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
