// Supabase Edge Function for detecting inactive users
// Deploy with: supabase functions deploy check-inactive-users
// Schedule with: supabase functions schedule check-inactive-users --cron "0 10 * * *"
// Runs daily at 10 AM

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

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get users who haven't logged in recently
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('id, email, name, last_login_at, created_at, notifications')
      .not('notifications->goalReminders', 'is', false)
      .lt('last_login_at', sevenDaysAgo.toISOString());

    if (usersError) throw usersError;

    const results = [];

    for (const user of users || []) {
      const lastLogin = new Date(user.last_login_at || user.created_at);
      const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

      // Get user's goals
      const { data: goals } = await supabaseClient
        .from('goals')
        .select('id, completed')
        .eq('user_id', user.id);

      const totalGoals = goals?.length || 0;
      const completedGoals = goals?.filter(g => g.completed).length || 0;

      let notificationType = '';
      
      // Determine which notification to send based on inactivity
      if (daysSinceLogin >= 14) {
        notificationType = 'comeback_motivation';
      } else if (daysSinceLogin >= 7) {
        notificationType = 'inactive_user';
      } else if (daysSinceLogin >= 3) {
        // Check for broken streaks
        const { data: streakData } = await supabaseClient
          .from('user_stats')
          .select('current_streak')
          .eq('user_id', user.id)
          .single();

        if (streakData && streakData.current_streak > 0) {
          notificationType = 'streak_broken';
        }
      }

      if (notificationType) {
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
              type: notificationType,
              userId: user.id,
              data: {
                daysSinceLastLogin: daysSinceLogin,
                totalGoals,
                completedGoals,
                streakDays: daysSinceLogin,
              },
            }),
          }
        );

        results.push({
          userId: user.id,
          email: user.email,
          daysSinceLogin,
          notificationType,
          sent: notificationResponse.ok,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} inactive user notifications`,
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
