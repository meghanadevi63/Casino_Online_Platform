import { useEffect, useState, useMemo } from "react";
import { 
  getAdminJackpots, 
  createJackpot, 
  triggerDraw, 
  getTenantCurrencies, 
  cancelJackpot 
} from "../../api/adminRaffle.api";
import { 
  Trophy, Plus, Users, Timer, Target, 
  Coins, RefreshCw, XCircle, Search, 
  Calendar, CheckCircle2, UserCheck, AlertTriangle, X,
  Clock, ArrowRight, Info, LayoutGrid, Trash2
} from "lucide-react";

const AdminJackpots = () => {
  const [jackpots, setJackpots] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("active");
  
  const [confirmModal, setConfirmModal] = useState({ open: false, type: "", id: null, name: "" });
  const [resultModal, setResultModal] = useState({ open: false, data: null });
  const [noPlayersModal, setNoPlayersModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    currency_id: "",
    jackpot_type: "MANUAL",
    seed_amount: 0,
    entry_fee: 0,
    draw_at: "",
    target_amount: ""
  });

  useEffect(() => {
    loadData();
    getTenantCurrencies().then(res => setCurrencies(res.data));
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdminJackpots();
      setJackpots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createJackpot({
        ...form,
        draw_at: form.draw_at ? new Date(form.draw_at).toISOString() : null,
        target_amount: form.target_amount ? Number(form.target_amount) : null
      });
      setShowCreate(false);
      setForm({ name: "", currency_id: "", jackpot_type: "MANUAL", seed_amount: 0, entry_fee: 0, draw_at: "", target_amount: "" });
      loadData();
    } catch (err) { alert(err.response?.data?.detail || "Error creating jackpot"); }
  };

  const executeDraw = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, type: "", id: null, name: "" });
    try {
      const res = await triggerDraw(id);
      setResultModal({ open: true, data: res.data });
      loadData();
    } catch (err) { 
      if (err.response?.status === 400 && err.response?.data?.detail?.includes("No players joined")) {
        setNoPlayersModal(true);
        loadData();
      } else {
        alert(err.response?.data?.detail || "Error drawing winner"); 
      }
    }
  };

  const executeCancel = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, type: "", id: null, name: "" });
    try {
      await cancelJackpot(id);
      loadData();
    } catch (err) { alert(err.response?.data?.detail || "Error cancelling"); }
  };

  const filteredJackpots = useMemo(() => {
    return jackpots.filter(j => 
      j.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      j.status === currentTab
    );
  }, [jackpots, searchTerm, currentTab]);

  const getDrawButtonState = (j) => {
    if (j.status !== 'active') return { label: "Closed", ready: false };
    if (j.jackpot_type === 'MANUAL') return { label: "Draw Winner", ready: true };
    
    if (j.jackpot_type === 'TIME_BASED') {
      const isTimeMet = new Date(j.draw_at) <= new Date();
      return isTimeMet 
        ? { label: "Draw Winner Now", ready: true } 
        : { label: "Time Not Reached", ready: false };
    }
    
    if (j.jackpot_type === 'THRESHOLD') {
      const isMet = j.current_amount >= j.target_amount;
      return isMet 
        ? { label: "Draw Winner Now", ready: true } 
        : { label: "Threshold Pending", ready: false };
    }
    
    return { label: "Draw Winner", ready: false };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-800 pb-8">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold">Jackpot Management</h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px]">Admin Controls & Logic Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-yellow-500 outline-none w-40 md:w-64 transition-all font-bold uppercase"
              />
           </div>
           <button 
              onClick={() => setShowCreate(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-yellow-500/10 cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} /> Setup New
            </button>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 p-1 bg-gray-900/50 border border-gray-800 rounded-2xl w-fit">
          {['active', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                currentTab === tab 
                ? "bg-yellow-500 text-black shadow-lg" 
                : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
      </div>

      {/* LIST SECTION */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
             <RefreshCw className="text-yellow-500 animate-spin" size={32} />
             <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Syncing Raffle Pools...</p>
          </div>
        ) : filteredJackpots.length === 0 ? (
          <div className="bg-gray-900/50 border border-dashed border-gray-800 rounded-[2.5rem] p-24 text-center">
            <Trophy size={48} className="mx-auto text-gray-800 mb-4 opacity-20" />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No {currentTab} jackpots found</p>
          </div>
        ) : (
          filteredJackpots.map(j => {
            const btnState = getDrawButtonState(j);
            const isReady = btnState.ready && j.status === 'active';

            return (
              <div key={j.jackpot_id} className={`bg-gray-900 border transition-all duration-300 rounded-[1.5rem] p-6 flex flex-col lg:flex-row items-center gap-6 ${j.status === 'active' ? 'border-gray-800 shadow-xl' : 'border-gray-800/30 opacity-60'}`}>
                
                {/* 1. ICON POD */}
                <div className="bg-black/40 p-5 rounded-[1.25rem] border border-gray-800 text-yellow-500 shadow-inner flex-shrink-0">
                  {j.jackpot_type === 'TIME_BASED' ? <Timer size={28} /> : j.jackpot_type === 'THRESHOLD' ? <Target size={28} /> : <Users size={28} />}
                </div>

                {/* 2. MAIN INFO */}
                <div className="flex-1 space-y-4 text-center lg:text-left min-w-0">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">{j.name}</h3>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${
                          j.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                          j.status === 'completed' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                          "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}>
                          {j.status}
                        </span>
                        {isReady && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter bg-yellow-500 text-black ">
                                <CheckCircle2 size={10} /> Ready to Draw
                            </span>
                        )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-2">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Type</span>
                        <span className="text-xs font-bold text-gray-400 uppercase">{j.jackpot_type.replace('_', ' ')}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Entry Fee</span>
                        <span className="text-xs font-bold text-yellow-500 font-mono">{j.currency_symbol}{j.entry_fee}</span>
                     </div>
                     {j.jackpot_type === 'TIME_BASED' && (
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Scheduled Draw</span>
                          <span className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
                              <Clock size={12} className="text-blue-500" />
                              {new Date(j.draw_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                       </div>
                     )}
                     {j.jackpot_type === 'THRESHOLD' && (
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Target Cap</span>
                          <span className="text-xs font-bold text-gray-400 uppercase font-mono tracking-tighter">{j.currency_symbol}{j.target_amount.toLocaleString()}</span>
                       </div>
                     )}
                  </div>
                </div>

                {/* 3. PARTICIPANTS */}
                <div className="flex flex-col items-center lg:items-end px-6 border-l border-gray-800 flex-shrink-0">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Participants</span>
                    <div className="flex flex-col items-center lg:items-end">
                        <div className="flex items-center gap-2 text-white">
                            <Users size={16} className="text-yellow-500" />
                            <span className="text-2xl font-black font-mono tracking-tighter">{j.participants_count}</span>
                        </div>
                        {/*  Logic for "Waiting for drawing" */}
                        {isReady && j.status === 'active' && (
                            <p className="text-[8px] font-black text-yellow-500 uppercase tracking-[2px] mt-1 animate-pulse">Waiting for drawing</p>
                        )}
                    </div>
                </div>

                {/* 4. POOL */}
                <div className="flex flex-col items-center lg:items-end px-6 border-l border-gray-800 flex-shrink-0">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Accumulated Pool</span>
                  <span className="text-3xl font-black text-white font-mono tracking-tighter">
                    {j.currency_symbol}{j.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  {/*Seed Amount display slightly under Pool */}
                  <div className="flex items-center gap-1 mt-1 opacity-80">
                     <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Seed:</span>
                     <span className="text-[10px] font-black text-gray-400 font-mono tracking-tighter">{j.currency_symbol}{j.seed_amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* 5. ACTIONS */}
                <div className="flex flex-row lg:flex-col gap-2 min-w-[170px] flex-shrink-0 border-l border-gray-800 pl-6">
                  {j.status === 'active' && (
                    <>
                      <button 
                        disabled={!isReady} 
                        onClick={() => setConfirmModal({ open: true, type: "draw", id: j.jackpot_id, name: j.name })}
                        className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                            isReady 
                            ? "bg-yellow-500 text-black shadow-yellow-500/20 cursor-pointer" 
                            : "bg-gray-800 text-gray-600 opacity-30 cursor-not-allowed"
                        }`}
                      >
                        {btnState.label}
                      </button>
                      <button 
                        onClick={() => setConfirmModal({ open: true, type: "cancel", id: j.jackpot_id, name: j.name })}
                        className="w-full bg-gray-800 hover:bg-red-900/40 hover:text-red-400 text-gray-500 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                      >
                        Cancel Draw
                      </button>
                    </>
                  )}
                  {j.status === 'completed' && j.winner_id && (
                    <div className="text-center lg:text-right bg-black/40 p-4 rounded-2xl border border-gray-800 min-w-[180px] shadow-inner">
                      <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex items-center justify-end gap-1">
                          <CheckCircle2 size={10} className="text-green-500" /> Winner Announced
                      </p>
                      <p className="text-[11px] font-black text-white mt-1 uppercase tracking-tight leading-none truncate">{j.winner_name}</p>
                      <p className="text-[8px] text-gray-600 font-bold uppercase mt-1">
                        Drawn: {new Date(j.drawn_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      <div className="h-px bg-gray-800 w-full my-2" />
                      <p className="text-xs font-black text-yellow-500 font-mono tracking-tighter">Awarded {j.currency_symbol}{j.won_amount.toLocaleString()}</p>
                    </div>
                  )}
                  {j.status === 'cancelled' && (
                    <div className="text-center lg:text-right p-4">
                        <span className="text-[10px] font-black text-red-500 uppercase flex items-center justify-end gap-2">
                            <XCircle size={14} /> Refunded
                        </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                 <Trophy className="text-yellow-500" size={24} />
                 <h2 className="text-2xl font-bold">Setup Raffle</h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"><X size={24}/></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white font-bold">
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Public Name</label>
                  <input required placeholder="e.g. Mega Weekend Draw" className="w-full bg-black border border-gray-800 p-4 rounded-2xl text-sm text-white outline-none focus:border-yellow-500 transition-all uppercase" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Pool Currency</label>
                  <select required className="w-full bg-black border border-gray-800 p-4 rounded-2xl text-sm text-white outline-none cursor-pointer font-bold uppercase" value={form.currency_id} onChange={e => setForm({...form, currency_id: e.target.value})}>
                    <option value="">Select Currency</option>
                    {currencies.map(c => <option key={c.currency_id} value={c.currency_id}>{c.currency_code}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Draw Condition</label>
                  <select className="w-full bg-black border border-gray-800 p-4 rounded-2xl text-sm text-white outline-none cursor-pointer font-bold uppercase" value={form.jackpot_type} onChange={e => setForm({...form, jackpot_type: e.target.value})}>
                    <option value="MANUAL">Manual (Admin Trigger)</option>
                    <option value="TIME_BASED">Schedule (Time Match)</option>
                    <option value="THRESHOLD">Target (Amount Match)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Seed (Casino Contribution)</label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input type="number" className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-2xl text-sm text-white outline-none focus:border-yellow-500 transition-all font-mono font-bold uppercase" value={form.seed_amount} onChange={e => setForm({...form, seed_amount: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Entry Fee (Per Player)</label>
                  <div className="relative">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input type="number" className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-2xl text-sm text-white outline-none focus:border-yellow-500 transition-all font-mono font-bold uppercase" value={form.entry_fee} onChange={e => setForm({...form, entry_fee: e.target.value})} />
                  </div>
                </div>
                {form.jackpot_type === 'TIME_BASED' && (
                  <div className="col-span-1 md:col-span-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Target Draw Date & Time</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                      <input type="datetime-local" style={{ colorScheme: 'dark' }} className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-2xl text-sm text-white outline-none focus:border-yellow-500 transition-all font-bold uppercase cursor-pointer" value={form.draw_at} onChange={e => setForm({...form, draw_at: e.target.value})} />
                    </div>
                  </div>
                )}
                {form.jackpot_type === 'THRESHOLD' && (
                  <div className="col-span-1 md:col-span-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Unlock Threshold Amount</label>
                    <div className="relative">
                      <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                      <input type="number" placeholder="Pot must reach this amount before draw..." className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-2xl text-sm text-white outline-none focus:border-yellow-500 transition-all font-mono font-bold uppercase" value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-800">
                <button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all text-xs cursor-pointer">Launch Jackpot</button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-10 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl cursor-pointer transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NO PLAYERS MODAL */}
      {noPlayersModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-gray-900 border border-gray-800 p-10 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
              <div className="bg-yellow-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-yellow-500" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic leading-none">Raffle Cancelled</h3>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-tight leading-relaxed mb-8">
                The draw could not be completed because no players joined this pool. The jackpot has been marked as cancelled.
              </p>
              <button 
                onClick={() => setNoPlayersModal(false)} 
                className="w-full bg-white text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-[2px] cursor-pointer active:scale-95 transition-all shadow-xl"
              >
                Return to Manager
              </button>
           </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl overflow-hidden relative">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${confirmModal.type === 'draw' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {confirmModal.type === 'draw' ? <UserCheck size={32} /> : <AlertTriangle size={32} />}
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 leading-none italic">Confirm Action</h3>
              <p className="text-sm text-gray-400 font-bold mb-8 uppercase tracking-tight leading-relaxed">
                {confirmModal.type === 'draw' 
                  ? `Initiate draw for "${confirmModal.name}"? A random winner will be selected from participants.`
                  : `Terminate "${confirmModal.name}"? All participants will be automatically refunded.`
                }
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmModal.type === 'draw' ? executeDraw : executeCancel} className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 cursor-pointer ${confirmModal.type === 'draw' ? "bg-green-600 text-white shadow-green-900/20" : "bg-red-600 text-white shadow-red-900/20"}`}>
                  Yes, Execute
                </button>
                <button onClick={() => setConfirmModal({ open: false, type: "", id: null, name: "" })} className="w-full py-3 text-gray-500 font-black uppercase text-[9px] tracking-widest hover:text-white transition-colors cursor-pointer">
                  Nevermind, return
                </button>
              </div>
           </div>
        </div>
      )}

      {/* RESULT REPORT MODAL */}
      {resultModal.open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 animate-in fade-in duration-500">
           <div className="bg-gray-900 border-2 border-yellow-500 p-10 rounded-[3rem] max-w-md w-full text-center shadow-[0_0_80px_rgba(234,179,8,0.2)] relative">
              <Trophy size={64} className="text-yellow-500 mx-auto mb-6 " />
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-none">Winner Drawn!</h2>
              <div className="bg-black/40 border border-gray-800 rounded-3xl p-6 my-6 text-center shadow-inner">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Identity Confirmed</p>
                <p className="text-xl font-black text-white leading-none tracking-tight uppercase">{resultModal.data.winner_name}</p>
                <p className="text-[10px] text-yellow-500 font-bold mt-2 font-mono">{resultModal.data.winner_email}</p>
                <div className="h-px bg-gray-800 w-full my-5" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 font-black">Total Pot Awarded</p>
                <p className="text-4xl font-black text-green-400 font-mono tracking-tighter italic leading-none mt-2 uppercase italic">
                    {resultModal.data.currency_symbol}{resultModal.data.amount_won.toLocaleString()}
                </p>
                {/* Drawn At with Date & Time in Modal */}
                <p className="text-[8px] text-gray-600 font-bold uppercase mt-4">
                  Drawn: {new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <button onClick={() => setResultModal({ open: false, data: null })} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl uppercase tracking-widest shadow-xl shadow-yellow-500/10 cursor-pointer transition-transform active:scale-95 text-xs">
                Close Report
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminJackpots;