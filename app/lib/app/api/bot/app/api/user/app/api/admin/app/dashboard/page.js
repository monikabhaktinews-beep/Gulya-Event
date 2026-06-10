'use client';
import { useEffect, useState } from 'react';
import { Shield, Users, Wallet, Trophy, CheckCircle, ExternalLink, Award, Layers } from 'lucide-react';

export default function MiniAppDashboard() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('main');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [walletInput, setWalletInput] = useState('');
  const [withdrawModal, setWithdrawModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('userId') || '8845150920';
    setUserId(id);
    fetchUserData(id);
  }, []);

  const fetchUserData = async (id) => {
    try {
      const res = await fetch(`/api/user?userId=${id}`);
      const resData = await res.json();
      setData(resData);
      setLoading(false);
    } catch (e) { console.error(e); }
  };

  const handleCaptcha = async () => {
    if (captchaAnswer === '11') {
      setLoading(true);
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'verify_captcha' })
      });
      fetchUserData(userId);
    } else { setCaptchaError(true); }
  };

  const handleChannelVerification = async () => {
    setLoading(true);
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'verify_channels' })
    });
    fetchUserData(userId);
  };

  const handleClaimTask = async (taskId) => {
    setLoading(true);
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'claim_task', payload: { taskId } })
    });
    fetchUserData(userId);
  };

  const handleWithdraw = async () => {
    if (!walletInput) return;
    setLoading(true);
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'submit_withdraw', payload: { wallet: walletInput } })
    });
    if (res.ok) {
      setWithdrawModal(false);
      fetchUserData(userId);
      alert("Withdrawal requested successfully!");
    } else {
      alert("Error processing withdrawal.");
      setLoading(false);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen text-purple-400 font-bold tracking-widest text-sm">LOADING REALM...</div>;

  const { user, settings, leaderboard, recentPayouts } = data;

  if (!user.verified) {
    return (
      <div className="p-6 max-w-md mx-auto min-h-screen flex flex-col justify-center">
        <div className="bg-[#0d1527] border border-purple-900 rounded-3xl p-6 text-center shadow-2xl">
          <Shield className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-1">Human Verification</h2>
          <p className="text-xs text-gray-400 mb-6">Solve the quick calculation to continue.</p>
          <div className="bg-[#16223f] rounded-2xl p-4 mb-4 text-xl font-black text-cyan-400">7 + 4 = ?</div>
          <input type="number" placeholder="Your Answer" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} className="w-full bg-[#16223f] border border-gray-800 rounded-xl py-3 text-center text-white font-bold mb-3 focus:outline-none" />
          {captchaError && <p className="text-red-400 text-xs mb-3">Wrong answer!</p>}
          <button onClick={handleCaptcha} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider">Verify</button>
        </div>
      </div>
    );
  }

  if (!user.channelsJoined) {
    return (
      <div className="p-6 max-w-md mx-auto min-h-screen flex flex-col justify-center">
        <div className="bg-[#0d1527] border border-cyan-900 rounded-3xl p-6 shadow-2xl">
          <Layers className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-center mb-1">Join Official Channels</h2>
          <p className="text-xs text-center text-gray-400 mb-6">Unlock dashboard by subscribing to our channels.</p>
          <div className="space-y-3 mb-6">
            {settings.requiredChannels.map((c) => (
              <a key={c.id} href={c.link} target="_blank" className="flex items-center justify-between p-4 bg-[#16223f] rounded-2xl border border-gray-800">
                <span className="text-xs font-semibold">{c.name}</span>
                <ExternalLink className="w-4 h-4 text-cyan-400" />
              </a>
            ))}
          </div>
          <button onClick={handleChannelVerification} className="w-full bg-cyan-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider">I have joined, Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-between pb-24 p-4">
      <header className="mb-4">
        <div className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/20 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase text-purple-400 font-bold tracking-wider block">Weekly Reward Pool</span>
            <span className="text-xl font-black text-white">{settings.poolSize} USDT</span>
          </div>
          <span className="text-xs font-bold text-cyan-400 bg-cyan-950/50 px-3 py-1 rounded-xl">+{settings.perReferReward} / Ref</span>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'main' && (
          <div className="space-y-4">
            <div className="bg-[#0d1527] rounded-3xl p-6 text-center border border-gray-900">
              <span className="text-xs text-gray-400 uppercase block mb-1">Your Balance</span>
              <h1 className="text-3xl font-black text-white mb-4">{user.balance.toFixed(2)} <span className="text-sm text-purple-400 font-bold">USDT</span></h1>
              <button onClick={() => setWithdrawModal(true)} disabled={user.balance < settings.minWithdraw} className={`w-full font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider ${user.balance >= settings.minWithdraw ? 'bg-purple-600 text-white shadow-lg' : 'bg-[#16223f] text-gray-500 cursor-not-allowed'}`}>
                {user.balance >= settings.minWithdraw ? 'Withdraw Funds' : `Min Withdraw: ${settings.minWithdraw} USDT`}
              </button>
            </div>

            <div className="bg-[#0d1527] rounded-2xl p-4 border border-gray-900 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">Your Referrals</span>
                <span className="text-sm font-black text-indigo-400 bg-indigo-950/40 px-3 py-1 rounded-lg">{user.referrals}</span>
              </div>
              <div className="bg-[#16223f] p-3 rounded-xl flex items-center justify-between text-[11px] text-gray-400">
                <span className="truncate mr-2">https://t.me/Bot?start=ref_{userId}</span>
                <button onClick={() => { navigator.clipboard.writeText(`https://t.me/Bot?start=ref_${userId}`); alert("Copied!"); }} className="bg-indigo-600 text-white px-2 py-1 rounded font-bold shrink-0">Copy</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Award className="w-4 h-4 text-purple-400" /> Premium Tasks</h3>
            {settings.tasks.map((t) => (
              <div key={t.id} className="bg-[#0d1527] p-4 rounded-xl border border-gray-900 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-semibold">{t.title}</h4>
                  <span className="text-[10px] font-bold text-cyan-400">+{t.reward} USDT</span>
                </div>
                {user.completedTasks.includes(t.id) ? (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/30 px-2 py-1 rounded">Completed</span>
                ) : (
                  <div className="flex gap-2">
                    <a href={t.link} target="_blank" className="bg-[#16223f] p-2 rounded-lg text-gray-400"><ExternalLink className="w-3.5 h-3.5" /></a>
                    <button onClick={() => handleClaimTask(t.id)} className="bg-purple-600 text-white text-[11px] font-bold px-3 py-1 rounded-lg">Claim</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="bg-[#0d1527] p-4 rounded-2xl border border-gray-900">
              <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-400" /> Top Inviters</h3>
              <div className="space-y-2">
                {leaderboard.map((l) => (
                  <div key={l.rank} className="flex justify-between items-center p-2.5 bg-[#16223f] rounded-xl text-xs">
                    <span className="text-gray-300">#{l.rank} @{l.username}</span>
                    <span className="text-gray-400 font-bold">{l.referrals} Ref</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d1527] p-4 rounded-2xl border border-gray-900">
              <h3 className="text-xs font-bold text-white mb-2">Recent Payout streams</h3>
              {recentPayouts.map((p, idx) => (
                <div key={idx} className="flex justify-between text-[11px] p-2 border-b border-gray-900">
                  <span className="text-gray-300">@{p.username}</span>
                  <span className="text-emerald-400 font-bold">+{p.amount} USDT</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-4 left-4 right-4 bg-[#0d1527]/90 backdrop-blur-md border border-gray-800 rounded-2xl p-1.5 flex justify-around shadow-2xl">
        <button onClick={() => setActiveTab('main')} className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl ${activeTab === 'main' ? 'text-purple-400 bg-purple-950/50' : 'text-gray-500'}`}><Wallet className="w-4 h-4" /><span className="text-[9px] font-bold">Wallet</span></button>
        <button onClick={() => setActiveTab('tasks')} className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl ${activeTab === 'tasks' ? 'text-purple-400 bg-purple-950/50' : 'text-gray-500'}`}><Award className="w-4 h-4" /><span className="text-[9px] font-bold">Tasks</span></button>
        <button onClick={() => setActiveTab('leaderboard')} className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl ${activeTab === 'leaderboard' ? 'text-purple-400 bg-purple-950/50' : 'text-gray-500'}`}><Trophy className="w-4 h-4" /><span className="text-[9px] font-bold">Leaderboard</span></button>
      </nav>

      {withdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#0d1527] border border-gray-800 w-full max-w-xs rounded-2xl p-4">
            <h3 className="text-xs font-bold mb-1">Enter USDT Address</h3>
            <p className="text-[10px] text-gray-400 mb-3">Provide your BEP20 Wallet Address.</p>
            <input type="text" placeholder="0x..." value={walletInput} onChange={(e) => setWalletInput(e.target.value)} className="w-full bg-[#16223f] border border-gray-800 rounded-xl p-2.5 text-xs text-white font-mono mb-3 focus:outline-none" />
            <div className="flex gap-2">
              <button onClick={() => setWithdrawModal(false)} className="flex-1 bg-gray-800 text-xs py-2 rounded-xl">Cancel</button>
              <button onClick={handleWithdraw} className="flex-1 bg-purple-600 text-xs py-2 rounded-xl font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
                }
                                 
