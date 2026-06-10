'use client';
import { useEffect, useState } from 'react';
import { Settings, ShieldAlert, Check, X } from 'lucide-react';

export default function AdministrativeControlPlane() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minWithdraw, setMinWithdraw] = useState('');
  const [perReferReward, setPerReferReward] = useState('');
  const [payoutChannel, setPayoutChannel] = useState('');
  const [txnHashes, setTxnHashes] = useState({});

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin');
      const json = await res.json();
      setData(json);
      setMinWithdraw(json.settings.minWithdraw);
      setPerReferReward(json.settings.perReferReward);
      setPayoutChannel(json.settings.payoutChannelId);
      setLoading(false);
    } catch (e) { console.error(e); }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_settings',
        payload: { minWithdraw: parseFloat(minWithdraw), perReferReward: parseFloat(perReferReward), payoutChannelId: payoutChannel }
      })
    });
    alert("Settings updated!");
    fetchAdminData();
  };

  const handleProcessPayout = async (payoutId, status) => {
    const hash = txnHashes[payoutId] || '';
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'manage_payout', payload: { payoutId, status, txnHash: hash } })
    });
    alert(`Payout ${status}! Broadcast sent to Telegram.`);
    fetchAdminData();
  };

  if (loading) return <div className="p-12 text-center text-xs text-purple-400">LOADING CORE CONTROL PANEL...</div>;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
        <ShieldAlert className="w-6 h-6 text-purple-500" />
        <div>
          <h1 className="text-base font-bold">Admin Core Dashboard</h1>
          <p className="text-[11px] text-gray-400">Total Users: {data.totalUsers}</p>
        </div>
      </div>

      <form onSubmit={handleUpdateSettings} className="bg-[#0d1527] p-4 rounded-xl border border-gray-900 space-y-3">
        <h3 className="text-xs font-bold flex items-center gap-1"><Settings className="w-3.5 h-3.5" /> Modify Parameters</h3>
        <div>
          <label className="block text-[10px] text-gray-400 uppercase mb-1">Min Withdraw (USDT)</label>
          <input type="number" step="0.01" value={minWithdraw} onChange={(e) => setMinWithdraw(e.target.value)} className="w-full bg-[#16223f] border border-gray-800 rounded-lg p-2 text-xs" />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 uppercase mb-1">Per Refer Reward (USDT)</label>
          <input type="number" step="0.01" value={perReferReward} onChange={(e) => setPerReferReward(e.target.value)} className="w-full bg-[#16223f] border border-gray-800 rounded-lg p-2 text-xs" />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 uppercase mb-1">Telegram Payout Log Channel</label>
          <input type="text" value={payoutChannel} onChange={(e) => setPayoutChannel(e.target.value)} className="w-full bg-[#16223f] border border-gray-800 rounded-lg p-2 text-xs" />
        </div>
        <button type="submit" className="w-full bg-purple-600 text-xs font-bold py-2 rounded-lg">Save Settings</button>
      </form>

      <div className="bg-[#0d1527] p-4 rounded-xl border border-gray-900 space-y-3">
        <h3 className="text-xs font-bold">Withdrawal Queue Pipeline</h3>
        {data.payouts.map((p) => (
          <div key={p.id} className="p-3 bg-[#16223f] rounded-lg text-xs space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="block font-bold">@{p.username} ({p.amount} USDT)</span>
                <span className="text-[10px] text-gray-400 block break-all font-mono">{p.walletAddress}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{p.status}</span>
            </div>
            {p.status === 'Pending' && (
              <div className="flex gap-2">
                <input type="text" placeholder="Txn Hash (Optional)" value={txnHashes[p.id] || ''} onChange={(e) => setTxnHashes({...txnHashes, [p.id]: e.target.value})} className="flex-1 bg-[#060913] border border-gray-800 rounded p-1.5 text-[11px]" />
                <button onClick={() => handleProcessPayout(p.id, 'Approved')} className="bg-emerald-600 p-1.5 rounded"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleProcessPayout(p.id, 'Rejected')} className="bg-red-600 p-1.5 rounded"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
          }
  
