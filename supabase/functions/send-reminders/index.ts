import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    // Get users inactive for 2+ days
    const { data: inactiveUsers } = await supabase
      .from("users")
      .select("id, email, name, updated_at")
      .lt("updated_at", twoDaysAgo);

    // Get users with incomplete goals who haven't logged today
    const { data: usersWithGoals } = await supabase
      .from("goals")
      .select("user_id, users!inner(id, email, name)")
      .lt("progress", 100)
      .not("user_id", "in", `(SELECT DISTINCT user_id FROM progress_logs WHERE logged_at::date = CURRENT_DATE)`);

    const client = new SMTPClient({
      connection: {
        hostname: Deno.env.get("SMTP_HOST")!,
        port: Number(Deno.env.get("SMTP_PORT")),
        tls: true,
        auth: {
          username: Deno.env.get("SMTP_USER")!,
          password: Deno.env.get("SMTP_PASS")!,
        },
      },
    });

    // Send inactivity reminders
    for (const user of inactiveUsers || []) {
      await client.send({
        from: Deno.env.get("SMTP_FROM")!,
        to: user.email,
        subject: "We miss you! 👋",
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hi ${user.name || "there"}!</h2>
          <p>We noticed you haven't been active for a while. Your goals are waiting for you!</p>
          <p><a href="${Deno.env.get("APP_URL")}/dashboard">Continue your journey</a></p>
        </div>`,
      });

      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "inactivity_reminder",
        title: "We miss you! 👋",
        message: "You haven't been active for 2 days. Come back to continue your goals!",
      });
    }

    // Send goal progress reminders
    const uniqueUsers = [...new Map(usersWithGoals?.map(g => [g.users.id, g.users]) || []).values()];
    
    for (const user of uniqueUsers) {
      await client.send({
        from: Deno.env.get("SMTP_FROM")!,
        to: user.email,
        subject: "Don't forget to log your progress today! 📝",
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hi ${user.name || "there"}!</h2>
          <p>You have incomplete goals. Don't break your streak - log your progress today!</p>
          <p><a href="${Deno.env.get("APP_URL")}/dashboard">Log progress now</a></p>
        </div>`,
      });

      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "progress_reminder",
        title: "Don't forget to log your progress! 📝",
        message: "You haven't logged progress today. Keep your streak going!",
      });
    }

    await client.close();

    return new Response(JSON.stringify({ 
      inactiveReminders: inactiveUsers?.length || 0,
      progressReminders: uniqueUsers.length 
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
