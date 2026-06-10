import { NextResponse } from 'next/server';
import { db, getUser } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });

  const user = getUser(userId);
  
  const leaderboard = Object.values(db.users)
    .sort((a, b) => b.referrals - a.referrals)
    .slice(0, 5)
    .map((u, i) => ({ rank: i + 1, username: u.username, referrals: u.referrals }));

  return NextResponse.json({
    user,
    settings: db.settings,
    leaderboard,
    recentPayouts: db.payouts.slice(-5).reverse()
  });
}

export async function POST(req) {
  try {
    const { userId, action, payload } = await req.json();
    const user = getUser(userId);

    if (action === 'verify_captcha') {
      user.verified = true;
      return NextResponse.json({ success: true, user });
    }
    if (action === 'verify_channels') {
      user.channelsJoined = true;
      return NextResponse.json({ success: true, user });
    }
    if (action === 'claim_task') {
      const { taskId } = payload;
      const task = db.settings.tasks.find(t => t.id === taskId);
      if (task && !user.completedTasks.includes(taskId)) {
        user.completedTasks.push(taskId);
        user.balance += task.reward;
        return NextResponse.json({ success: true, user });
      }
    }
    if (action === 'submit_withdraw') {
      const { wallet } = payload;
      if (user.balance < db.settings.minWithdraw) {
        return NextResponse.json({ error: 'Low Balance' }, { status: 400 });
      }
      const newPayout = {
        id: "TXN" + Math.floor(100000 + Math.random() * 900000),
        userId: user.userId,
        username: user.username,
        amount: user.balance,
        walletAddress: wallet,
        status: "Pending",
        timestamp: new Date().toLocaleTimeString()
      };
      db.payouts.push(newPayout);
      user.balance = 0;
      return NextResponse.json({ success: true, user, payout: newPayout });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
