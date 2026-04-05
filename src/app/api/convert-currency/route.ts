import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    const rwfRate = data.rates.RWF;
    
    return NextResponse.json({ rate: rwfRate });
  } catch (error) {
    return NextResponse.json({ rate: 1000 }, { status: 200 });
  }
}
