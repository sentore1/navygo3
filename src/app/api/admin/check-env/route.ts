import { NextResponse } from 'next/server';
import { createClient } from '../../../../../supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check which environment variables are set (without exposing values)
    const envVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'KPAY_API_URL',
      'KPAY_USERNAME',
      'KPAY_PASSWORD',
      'KPAY_RETAILER_ID',
      'KPAY_BANK_ID',
      'POLAR_API_KEY',
      'POLAR_ORGANIZATION_ID',
      'POLAR_WEBHOOK_SECRET',
    ];

    const status: Record<string, boolean> = {};
    
    envVars.forEach(varName => {
      // Check if env var exists and is not empty
      status[varName] = !!(process.env[varName] && process.env[varName].length > 0);
    });

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error checking env vars:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
