import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json({
    settings: db.settings,
    payouts: db.payouts,
    totalUsers: Object.keys(db.users).length
  });
}

export async function POST(req) {
  try {
    const { action, payload } = await req.json();

    if (action === 'update_settings') {
      db.settings = { ...db.settings, ...payload };
      return NextResponse.json({ success: true, settings: db.settings });
    }

    if (action === 'manage_payout') {
      const { payoutId, status, txnHash } = payload;
      const payout = db.payouts.find(p => p.id === payoutId);
      if (payout) {
        payout.status = status;
        if (txnHash) payout.txnHash = txnHash;

        const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        if (TELEGRAM_TOKEN && db.settings.payoutChannelId) {
          const textMsg = `💰 <b>USDT Payment Processed Alert!</b>\n\n` +
                          `👤 <b>User:</b> @${payout.username}\n` +
                          `💵 <b>Amount:</b> ${payout.amount} USDT\n` +
                          `📊 <b>Status:</b> ${status === 'Approved' ? '✅ Success' : '❌ Rejected'}\n` +
                          `🏦 <b>Wallet Address:</b> <code>${payout.walletAddress}</code>\n` +
                          `${txnHash ? `🔗 <b>Txn Hash:</b> <code>${txnHash}</code>` : ''}`;
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: db.settings.payoutChannelId, text: textMsg, parse_mode: 'HTML' })
          });
        }
        return NextResponse.json({ success: true, payouts: db.payouts });
      }
    }
    return NextResponse.json({ error: 'Action failed' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
