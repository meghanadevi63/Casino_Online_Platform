import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { sendPartnerRequest } from "../api/inquiry.api";
import {
  Gamepad2, Users, ShieldCheck, Zap, ArrowRight, Dices,
  Globe, BarChart3, Mail, CheckCircle2, MessageSquare, Send,
  Wallet, Fingerprint, LayoutGrid, Menu, X 
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loadingUser } = useContext(AuthContext);

  // Responsive Navbar State
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  // B2B Form State
  const [inquiry, setInquiry] = useState({ name: "", email: "", company: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loadingUser && isAuthenticated && user) {
      navigate("/post-login");
    }
  }, [user, isAuthenticated, loadingUser, navigate]);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendPartnerRequest(inquiry);
      setSent(true);
      setInquiry({ name: "", email: "", company: "", message: "" });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to send request.");
    } finally {
      setSending(false);
    }
  };

  if (loadingUser) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-bold">Initializing...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500 selection:text-black">

      {/* 1. RESPONSIVE NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] bg-black/90 border-b border-white/5 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Dices className="text-yellow-500" size={30} />
            <span className="text-xl font-bold tracking-tight uppercase">Golden<span className="text-yellow-500">Platform</span></span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <a href="#players" className="hover:text-white transition-colors cursor-pointer">Players</a>
            <a href="#operators" className="hover:text-yellow-500 transition-colors cursor-pointer">Become a Partner</a>
            <a href="#contact" className="hover:text-white transition-colors cursor-pointer">Contact</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-xs font-bold text-gray-400 hover:text-white cursor-pointer px-4">Login</button>
            <button onClick={() => navigate("/register")} className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold text-xs uppercase cursor-pointer hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-500/10">
              Join Now
            </button>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            className="md:hidden text-white cursor-pointer" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-20 bg-black z-50 flex flex-col p-6 space-y-8 animate-in fade-in slide-in-from-top-5 md:hidden">
            <div className="flex flex-col space-y-6 text-sm font-black uppercase tracking-[2px]">
              <a href="#players" onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white">Players</a>
              <a href="#operators" onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-yellow-500">Become a Partner</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white">Contact</a>
            </div>
            <div className="flex flex-col gap-4 border-t border-white/10 pt-8">
              <button onClick={() => navigate("/login")} className="w-full py-4 text-center text-gray-400 font-bold uppercase tracking-widest">Login</button>
              <button onClick={() => navigate("/register")} className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black uppercase tracking-widest">Join Now</button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION - Animations Removed */}
      <section className="relative pt-48 pb-24 px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-[3px] mb-8">
            <Globe size={12} fill="currentColor" /> Premier Multi-Casino Network
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 uppercase leading-[0.9]">
            Discover Your<br />
            <span className="text-yellow-500">Perfect Arena.</span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl mb-12 font-medium leading-relaxed">
            Access a curated network of elite digital casinos. Select your preferred brand, establish your dedicated account, and enjoy an isolated gaming environment with localized wallets and exclusive game catalogs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("/register")} className="w-full sm:w-auto bg-white text-black px-10 py-4 rounded-xl font-black text-sm uppercase cursor-pointer hover:bg-yellow-500 transition-all shadow-2xl">
              Player Sign Up
            </button>
            <button onClick={() => navigate("/login")} className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-4 rounded-xl font-black text-sm uppercase cursor-pointer hover:bg-white/10 transition-all">
              Player Login
            </button>
          </div>
        </div>

        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      </section>

      {/* 3. CORE CONCEPTS FOR PLAYERS */}

      <section id="players" className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">Player Experience</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Personalized Gaming Ecosystems</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard
            icon={<Fingerprint size={32} />}
            title="Dedicated KYC"
            desc="Verify your identity securely within each casino instance. Your compliance is handled locally by the specific brand to ensure the highest regulatory standards."
          />
          <FeatureCard
            icon={<Users size={32} />}
            title="Individual Accounts"
            desc="Establish unique profiles with any casino brand on our network. Manage separate, secure accounts tailored to your preferences at each brand."
          />
          <FeatureCard
            icon={<LayoutGrid size={32} />}
            title="Tenant Game Library"
            desc="Explore a premium catalog of games curated specifically for your registered casino. Enjoy a seamless gaming environment optimized for your brand instance."
          />
        </div>
      </section>

      {/* 4. FOR OPERATORS (B2B SECTION) */}
      <section id="operators" className="bg-white text-black py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.95]">
              Launch Your Brand<br /><span className="text-yellow-600">On Our Tech.</span>
            </h2>
            <p className="text-gray-600 text-xl font-medium leading-relaxed max-w-lg">
              Focus on marketing and growth. We provide the licensing, multi-currency wallets, and certified game catalog out of the box.
            </p>
            <div className="space-y-4">
              <Benefit text="Multi-Tenant Brand Isolation" />
              <Benefit text="Real-time Admin Reporting" />
              <Benefit text="Integrated Payment Simulations" />
              <Benefit text="Instant Player Onboarding" />
            </div>
          </div>

          {/* 5. B2B PARTNERSHIP FORM */}
          <div id="contact" className="flex-1 w-full">
            <div className="bg-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-black/5 relative overflow-hidden">
              {sent ? (
                <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-600" size={40} />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic">Request Logged</h3>
                  <p className="text-gray-500 text-sm mt-2 font-medium">Our Super Admin has been notified. We will reach out shortly.</p>
                  <button onClick={() => setSent(false)} className="mt-8 text-yellow-600 font-black uppercase tracking-widest text-xs hover:underline cursor-pointer">Submit another inquiry</button>
                </div>
              ) : (
                <form onSubmit={handleInquiry} className="space-y-5">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold">
                      <MessageSquare className="text-yellow-600" size={24} /> Become a Partner
                    </h3>
                    <p className="text-gray-500 text-xs font-bold uppercase mt-1">Submit your details to the platform owner</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputGroup label="Full Name" placeholder="John Doe" value={inquiry.name} onChange={v => setInquiry({ ...inquiry, name: v })} />
                    <InputGroup label="Business Email" type="email" placeholder="john@company.com" value={inquiry.email} onChange={v => setInquiry({ ...inquiry, email: v })} />
                  </div>

                  <InputGroup label="Proposed Company Name" placeholder="Grand Royal Casino" value={inquiry.company} onChange={v => setInquiry({ ...inquiry, company: v })} />

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                    <textarea
                      className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-sm focus:border-yellow-500 outline-none h-32 transition-all"
                      placeholder="Tell us about your brand goals..."
                      value={inquiry.message}
                      onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    disabled={sending}
                    className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[3px] flex items-center justify-center gap-3 hover:bg-gray-800 transition-all cursor-pointer shadow-xl disabled:opacity-50"
                  >
                    {sending ? "TRANSMITTING..." : <>SUBMIT REQUEST <Send size={16} /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-20 px-6 border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16 text-gray-500">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
              <Dices className="text-yellow-500" size={28} />
              <span className="text-xl font-bold uppercase tracking-tighter">Golden Platform</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed font-medium">
              Powering the next generation of digital casinos with a focus on identity security and financial transparency.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-16 md:gap-24 text-[10px] font-black uppercase tracking-[2px]">
            <div className="space-y-4 flex flex-col">
              <span className="text-white border-b border-yellow-500 w-fit pb-1">Platform</span>
              <a className="hover:text-yellow-500 cursor-pointer transition-colors">Security Core</a>
              <a className="hover:text-yellow-500 cursor-pointer transition-colors">B2B Licensing</a>
              <a className="hover:text-yellow-500 cursor-pointer transition-colors">API Docs</a>
            </div>
            <div className="space-y-4 flex flex-col">
              <span className="text-white border-b border-yellow-500 w-fit pb-1">Legal</span>
              <a className="hover:text-yellow-500 cursor-pointer transition-colors">Privacy Policy</a>
              <a className="hover:text-yellow-500 cursor-pointer transition-colors">AML Compliance</a>
              <a className="hover:text-yellow-500 cursor-pointer transition-colors">Responsible Gaming</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 text-center text-gray-700 text-[9px] font-bold uppercase tracking-[4px]">
          © 2026 Golden Platform Infrastructure. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

// Reusable Components
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-gray-900/40 border border-gray-800 p-10 rounded-[2.5rem] space-y-5 hover:border-yellow-500/30 transition-all group">
    <div className="text-yellow-500 bg-yellow-500/10 w-fit p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500">{icon}</div>
    <h3 className="text-2xl font-bold">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

const Benefit = ({ text }) => (
  <div className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest text-gray-700">
    <CheckCircle2 size={18} className="text-yellow-600" /> {text}
  </div>
);

const InputGroup = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="space-y-1 w-full">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-gray-300 rounded-2xl p-4 text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-gray-300"
      required
    />
  </div>
);

export default Home;