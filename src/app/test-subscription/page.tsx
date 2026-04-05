import { createClient } from "../../../supabase/server";

export default async function TestSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">Not logged in</div>;
  }

  const { data: userData } = await supabase
    .from('users')
    .select('email, subscription_status, subscription_expires_at')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Current User Info</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify({
          id: user.id,
          email: user.email,
          subscription_status: userData?.subscription_status,
          subscription_expires_at: userData?.subscription_expires_at,
        }, null, 2)}
      </pre>
    </div>
  );
}
