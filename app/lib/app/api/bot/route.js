import { NextResponse } from 'next/server';
import { db, getUser } from '@/lib/db';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  if (!TELEGRAM_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const body = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.message) return NextResponse.json({ ok: true });

    const chatId = body.message.chat.id;
    const text = body.message.text || '';
    const userId = body.message.from.id.toString();
    const username = body.message.from.username || `User_${userId}`;

    const user = getUser(userId);
    user.username = username;

    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1 && parts[1].startsWith('ref_')) {
        const referrerId = parts[1].replace('ref_', '');
        if (referrerId !== userId && !user.referredBy) {
          user.referredBy = referrerId;
          const referrer = getUser(referrerId);
          referrer.referrals += 1;
          referrer.balance += db.settings.perReferReward;
          
          await sendTelegramMessage(
            referrerId, 
            `🎉 <b>New Referral Joined!</b>\n@${username} joined using your link. You earned +${db.settings.perReferReward} USDT!`
          );
        }
      }

      const webAppUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/dashboard?userId=${userId}`;
      const welcomeText = `👋 <b>Welcome to Premium Rewards!</b>\n\nComplete the human check verification, claim rewards, and withdraw instantly to your TrustWallet/Metamask.\n\n🚀 Click below to launch app:`;
      
      const inlineKeyboard = {
        inline_keyboard: [
          [{ text: "⚡ Launch App", web_app: { url: webAppUrl } }]
        ]
      };

      await sendTelegramMessage(chatId, welcomeText, inlineKeyboard);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: true });
  }
}
