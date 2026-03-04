import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Users, Target, ChevronRight, Star, ArrowUpRight, ArrowDownRight, Bell, Search, Plus, Check, Clock, Send, FileText, Eye, MessageSquare, Zap, BarChart3, Layout, Briefcase, Home, Settings, LogOut, ChevronDown, X, Filter, ExternalLink, AlertTriangle, Award, Percent, Package, ArrowRight, Upload, Sparkles, ChevronLeft, Edit3, Trash2, GripVertical, Move, Save, MoreHorizontal, Calendar, Link, Hash } from "lucide-react";

// ==================== DESIGN TOKENS ====================
const C = {
  bg: "#0D0F0A", surface: "#151913", surfaceHover: "#1C211A",
  border: "#242B20", borderLight: "#2F382A",
  text: "#E8EDDF", textMuted: "#8A9178", textDim: "#5A6350",
  accent: "#A8C686", accentLight: "#C4DBA0", accentGlow: "rgba(168,198,134,0.15)",
  green: "#7EC87E", greenDim: "rgba(126,200,126,0.12)",
  red: "#E87070", redDim: "rgba(232,112,112,0.12)",
  orange: "#DEB866", orangeDim: "rgba(222,184,102,0.12)",
  blue: "#7EB5D6", blueDim: "rgba(126,181,214,0.12)",
};

const stageColors = {
  Contacted: { bg: C.blueDim, text: C.blue },
  Negotiating: { bg: C.orangeDim, text: C.orange },
  Closed: { bg: C.greenDim, text: C.green },
  Lost: { bg: C.redDim, text: C.red },
};

const stageOrder = ["Contacted", "Negotiating", "Closed", "Lost"];

// ==================== PRICING FORMULAS ====================
// Real-world CPM/engagement-based pricing model
function calculatePricing(platform, followers, engagementRate) {
  const f = parseInt(followers) || 0;
  const e = parseFloat(engagementRate) || 2.0;
  if (f === 0) return [];

  // Base CPM rates by platform (industry ranges)
  const rates = {
    Instagram: { reel: { base: 18, label: "Instagram Reel" }, story: { base: 6, label: "Instagram Story (set of 3)" }, post: { base: 12, label: "Instagram Static Post" }, carousel: { base: 14, label: "Instagram Carousel" } },
    TikTok: { video: { base: 15, label: "TikTok Video" }, series: { base: 40, label: "TikTok 3-Part Series" } },
    YouTube: { integration: { base: 22, label: "YouTube Integration (60s)" }, dedicated: { base: 45, label: "YouTube Dedicated Video" }, short: { base: 8, label: "YouTube Short" } },
    "Twitter/X": { thread: { base: 5, label: "Twitter/X Thread" }, post: { base: 3, label: "Twitter/X Post" } },
  };

  const platformRates = rates[platform];
  if (!platformRates) return [];

  // Engagement multiplier: higher engagement = premium pricing
  const engMultiplier = e > 6 ? 2.2 : e > 4 ? 1.7 : e > 3 ? 1.3 : e > 2 ? 1.0 : 0.8;
  // Follower tier multiplier
  const tierMultiplier = f > 1000000 ? 1.8 : f > 500000 ? 1.4 : f > 100000 ? 1.1 : f > 50000 ? 0.9 : f > 10000 ? 0.7 : 0.5;

  return Object.entries(platformRates).map(([key, { base, label }]) => {
    const recommended = Math.round((base * (f / 1000) * engMultiplier * tierMultiplier) / 10) * 10;
    const benchmark = Math.round(recommended * 0.85);
    return { type: label, recommended: Math.max(recommended, 50), benchmark: Math.max(benchmark, 40), platform };
  });
}

// ==================== BRAND DATABASE ====================
const BRAND_DB = [
  { id: 1, name: "Nike Training", logo: "N", categories: ["Fitness", "Sports", "Athleisure"], minBudget: 15000, maxBudget: 25000, color: "#F97316", platforms: ["Instagram", "TikTok", "YouTube"], minFollowers: 100000, preferredEngagement: 3.5 },
  { id: 2, name: "Liquid IV", logo: "L", categories: ["Health & Wellness", "Fitness", "Sports"], minBudget: 8000, maxBudget: 15000, color: "#22D3EE", platforms: ["Instagram", "TikTok"], minFollowers: 50000, preferredEngagement: 3.0 },
  { id: 3, name: "Gymshark", logo: "G", categories: ["Fitness", "Athleisure", "Fashion"], minBudget: 10000, maxBudget: 20000, color: "#A78BFA", platforms: ["Instagram", "TikTok", "YouTube"], minFollowers: 75000, preferredEngagement: 3.5 },
  { id: 4, name: "Athletic Greens", logo: "A", categories: ["Health & Wellness", "Fitness", "Supplements"], minBudget: 5000, maxBudget: 12000, color: "#34D399", platforms: ["Instagram", "YouTube"], minFollowers: 50000, preferredEngagement: 2.5 },
  { id: 5, name: "Beats by Dre", logo: "B", categories: ["Tech", "Music", "Sports", "Fashion"], minBudget: 12000, maxBudget: 30000, color: "#F472B6", platforms: ["Instagram", "TikTok", "YouTube"], minFollowers: 200000, preferredEngagement: 2.0 },
  { id: 6, name: "Celsius Energy", logo: "C", categories: ["Fitness", "Health & Wellness", "Sports"], minBudget: 3000, maxBudget: 10000, color: "#FB923C", platforms: ["Instagram", "TikTok"], minFollowers: 25000, preferredEngagement: 3.0 },
  { id: 7, name: "Lululemon", logo: "L", categories: ["Fitness", "Athleisure", "Fashion"], minBudget: 10000, maxBudget: 25000, color: "#EC4899", platforms: ["Instagram", "YouTube"], minFollowers: 100000, preferredEngagement: 3.0 },
  { id: 8, name: "WHOOP", logo: "W", categories: ["Fitness", "Tech", "Sports", "Health & Wellness"], minBudget: 8000, maxBudget: 36000, color: "#6EE7B7", platforms: ["Instagram", "YouTube", "TikTok"], minFollowers: 50000, preferredEngagement: 3.0 },
  { id: 9, name: "Alo Yoga", logo: "A", categories: ["Fitness", "Fashion", "Health & Wellness"], minBudget: 5000, maxBudget: 15000, color: "#FCD34D", platforms: ["Instagram", "TikTok"], minFollowers: 50000, preferredEngagement: 3.5 },
  { id: 10, name: "Notion", logo: "N", categories: ["Tech", "Education", "Productivity"], minBudget: 5000, maxBudget: 15000, color: "#94A3B8", platforms: ["YouTube", "Twitter/X", "TikTok"], minFollowers: 30000, preferredEngagement: 2.5 },
  { id: 11, name: "Skillshare", logo: "S", categories: ["Education", "Creative", "Tech"], minBudget: 3000, maxBudget: 10000, color: "#4ADE80", platforms: ["YouTube", "Instagram"], minFollowers: 25000, preferredEngagement: 2.0 },
  { id: 12, name: "HelloFresh", logo: "H", categories: ["Food", "Health & Wellness", "Lifestyle"], minBudget: 4000, maxBudget: 12000, color: "#4ADE80", platforms: ["Instagram", "TikTok", "YouTube"], minFollowers: 30000, preferredEngagement: 2.5 },
  { id: 13, name: "Fabletics", logo: "F", categories: ["Fitness", "Athleisure", "Fashion"], minBudget: 5000, maxBudget: 15000, color: "#818CF8", platforms: ["Instagram", "TikTok"], minFollowers: 50000, preferredEngagement: 3.0 },
  { id: 14, name: "Bang Energy", logo: "B", categories: ["Fitness", "Sports", "Lifestyle"], minBudget: 2000, maxBudget: 8000, color: "#F87171", platforms: ["Instagram", "TikTok"], minFollowers: 20000, preferredEngagement: 2.5 },
  { id: 15, name: "Adobe Creative", logo: "A", categories: ["Tech", "Creative", "Education"], minBudget: 8000, maxBudget: 20000, color: "#FF6363", platforms: ["YouTube", "Instagram", "TikTok"], minFollowers: 50000, preferredEngagement: 2.0 },
];

function calculateBrandFit(brand, profile) {
  if (!profile.platforms || profile.platforms.length === 0) return 0;
  // Category overlap
  const catOverlap = brand.categories.filter(c => profile.categories?.includes(c)).length;
  const catScore = (catOverlap / Math.max(brand.categories.length, 1)) * 40;
  // Platform overlap
  const platOverlap = brand.platforms.filter(p => profile.platforms.some(up => up.name === p)).length;
  const platScore = (platOverlap / Math.max(brand.platforms.length, 1)) * 25;
  // Follower threshold
  const maxFollowers = Math.max(...profile.platforms.map(p => parseInt(p.followers) || 0));
  const followerScore = maxFollowers >= brand.minFollowers ? 20 : (maxFollowers / brand.minFollowers) * 20;
  // Engagement
  const avgEngagement = profile.platforms.reduce((s, p) => s + (parseFloat(p.engagement) || 0), 0) / profile.platforms.length;
  const engScore = avgEngagement >= brand.preferredEngagement ? 15 : (avgEngagement / brand.preferredEngagement) * 15;

  return Math.min(Math.round(catScore + platScore + followerScore + engScore), 99);
}

// ==================== SHARED UI COMPONENTS ====================

function StatCard({ icon: Icon, label, value, change, changeLabel, accent = false }) {
  const isPositive = change > 0;
  return (
    <div style={{ background: accent ? `linear-gradient(135deg, ${C.accent}22, ${C.surface})` : C.surface, border: `1px solid ${accent ? C.accent + "44" : C.border}`, borderRadius: 16, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
      {accent && <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: C.accent + "10" }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accent ? C.accent + "30" : C.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={accent ? C.accentLight : C.textMuted} />
        </div>
        <span style={{ color: C.textMuted, fontSize: 13, fontWeight: 500, letterSpacing: 0.3 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif", letterSpacing: -0.5 }}>{value}</div>
      {change !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
          {isPositive ? <ArrowUpRight size={14} color={C.green} /> : <ArrowDownRight size={14} color={C.red} />}
          <span style={{ fontSize: 12, fontWeight: 600, color: isPositive ? C.green : C.red }}>{isPositive ? "+" : ""}{change}%</span>
          <span style={{ fontSize: 12, color: C.textDim }}>{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 12, border: "none", background: active ? C.accent + "18" : "transparent", cursor: "pointer", width: "100%", position: "relative", transition: "all 0.2s" }}>
      <Icon size={19} color={active ? C.accentLight : C.textMuted} />
      <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? C.text : C.textMuted }}>{label}</span>
      {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 4, background: C.accent }} />}
      {badge && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#0D0F0A", background: C.accent, borderRadius: 10, padding: "2px 8px" }}>{badge}</span>}
    </button>
  );
}

function Modal({ title, onClose, children, width = 500 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: width, maxHeight: "85vh", overflowY: "auto", animation: "modalIn 0.2s ease" }}>
        <style>{`@keyframes modalIn { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }`}</style>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: C.border, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} color={C.textMuted} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", prefix, suffix }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</label>}
      <div style={{ display: "flex", alignItems: "center", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
        {prefix && <span style={{ padding: "0 0 0 12px", fontSize: 14, color: C.textDim }}>{prefix}</span>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, background: "transparent", border: "none", padding: "12px 14px", fontSize: 14, color: C.text, outline: "none", fontFamily: "inherit", width: "100%" }} />
        {suffix && <span style={{ padding: "0 12px 0 0", fontSize: 13, color: C.textDim }}>{suffix}</span>}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 14, color: C.text, outline: "none", fontFamily: "inherit", appearance: "none" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>{typeof o === "string" ? o : o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", full = false, small = false, disabled = false, icon: Icon }) {
  const styles = {
    primary: { background: C.accent, color: "#0D0F0A" },
    secondary: { background: C.border, color: C.text },
    danger: { background: C.redDim, color: C.red },
    success: { background: C.greenDim, color: C.green },
    ghost: { background: "transparent", color: C.textMuted, border: `1px solid ${C.border}` },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...s, border: s.border || "none", borderRadius: small ? 8 : 10, padding: small ? "6px 12px" : "10px 18px", fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 6, width: full ? "100%" : "auto", justifyContent: "center", transition: "all 0.15s", fontFamily: "inherit" }}>
      {Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  );
}

// ==================== ONBOARDING FLOW ====================

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: "", type: "", platforms: [], categories: [], pastDeals: "" });
  const [platformDetails, setPlatformDetails] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  const creatorTypes = ["Content Creator", "Athlete", "Musician", "Fitness Creator", "Lifestyle Creator", "Gaming Creator"];
  const platformOptions = [
    { name: "Instagram", icon: "IG", color: "#E1306C" },
    { name: "TikTok", icon: "TT", color: "#00F2EA" },
    { name: "YouTube", icon: "YT", color: "#FF0000" },
    { name: "Twitter/X", icon: "X", color: "#7A7F9A" },
  ];
  const categoryOptions = ["Fitness", "Health & Wellness", "Fashion", "Beauty", "Tech", "Gaming", "Food", "Travel", "Sports", "Music", "Comedy", "Education"];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setAnalyzeProgress(0);
    const steps = [15, 35, 55, 75, 90, 100];
    let i = 0;
    const run = () => {
      if (i < steps.length) {
        setTimeout(() => { setAnalyzeProgress(steps[i]); i++; run(); }, 400 + Math.random() * 400);
      } else {
        const profile = {
          name: formData.name,
          type: formData.type,
          categories: formData.categories,
          pastDeals: formData.pastDeals,
          platforms: formData.platforms.map(pName => ({
            name: pName,
            followers: platformDetails[pName]?.followers || "50000",
            engagement: platformDetails[pName]?.engagement || "3.0",
            handle: platformDetails[pName]?.handle || "",
          })),
        };
        setTimeout(() => onComplete(profile), 600);
      }
    };
    run();
  };

  const analyzeLabels = ["Connecting platforms...", "Pulling engagement data...", "Analyzing audience demographics...", "Benchmarking against similar creators...", "Generating pricing recommendations...", "Building your revenue profile..."];

  if (analyzing) {
    const labelIndex = Math.min(Math.floor(analyzeProgress / 18), analyzeLabels.length - 1);
    return (
      <div style={{ height: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/cabinet-grotesk" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${C.accent}30, ${C.green}30)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", animation: "pulse 1.5s ease infinite" }}>
            <Sparkles size={28} color={C.accentLight} />
          </div>
          <style>{`@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.8; } }`}</style>
          <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif", color: C.text, marginBottom: 8 }}>Analyzing your profile</h2>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 32 }}>{analyzeLabels[labelIndex]}</p>
          <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg, #6B8F4E, ${C.accentLight})`, borderRadius: 3, width: `${analyzeProgress}%`, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 12, color: C.textDim }}>{analyzeProgress}%</div>
        </div>
      </div>
    );
  }

  const progressDots = [0, 1, 2];

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
            <img src="./Nuvus.png" alt="Nuvus" style={{ width: 72, height: 72, borderRadius: 20, objectFit: "cover", margin: "0 auto 28px" }} />
            <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif", marginBottom: 12, background: `linear-gradient(135deg, ${C.text}, ${C.accentLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Welcome to Nuvus</h1>
            <p style={{ fontSize: 16, color: C.textMuted, marginBottom: 40, lineHeight: 1.6 }}>Let's build your revenue profile. This takes about 2 minutes and unlocks personalized pricing, brand matches, and revenue insights.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
              <input placeholder="Your name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", fontSize: 15, color: C.text, outline: "none", width: "100%", fontFamily: "inherit" }} />
              <div style={{ fontSize: 13, color: C.textMuted, textAlign: "left", marginBottom: -4, marginTop: 4 }}>I am a...</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {creatorTypes.map(type => (
                  <button key={type} onClick={() => setFormData({ ...formData, type })} style={{ background: formData.type === type ? C.accent + "25" : C.surface, border: `1px solid ${formData.type === type ? C.accent + "60" : C.border}`, borderRadius: 10, padding: "12px 8px", fontSize: 13, color: formData.type === type ? C.accentLight : C.textMuted, cursor: "pointer", fontWeight: formData.type === type ? 600 : 400, transition: "all 0.15s" }}>{type}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(1)} disabled={!formData.name || !formData.type} style={{ background: formData.name && formData.type ? C.accent : C.border, color: formData.name && formData.type ? "#0D0F0A" : C.textDim, border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 15, fontWeight: 600, cursor: formData.name && formData.type ? "pointer" : "default" }}>Continue <ArrowRight size={16} style={{ verticalAlign: "middle", marginLeft: 6 }} /></button>
          </div>
        );

      case 1:
        return (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif", marginBottom: 8 }}>Connect your platforms</h2>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 28 }}>Select platforms, then enter your metrics. This powers your pricing engine.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {platformOptions.map(p => {
                const selected = formData.platforms.includes(p.name);
                const details = platformDetails[p.name] || {};
                return (
                  <div key={p.name}>
                    <button onClick={() => {
                      const platforms = selected ? formData.platforms.filter(x => x !== p.name) : [...formData.platforms, p.name];
                      setFormData({ ...formData, platforms });
                    }} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: selected ? "14px 14px 0 0" : 14, cursor: "pointer", background: selected ? C.surface : C.bg, border: `1px solid ${selected ? p.color + "50" : C.border}`, borderBottom: selected ? "none" : undefined, transition: "all 0.15s", width: "100%", textAlign: "left" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: p.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: p.color }}>{p.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: C.textDim }}>{selected ? "Click to remove" : "Click to add"}</div>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${selected ? C.green : C.border}`, background: selected ? C.greenDim : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {selected && <Check size={14} color={C.green} />}
                      </div>
                    </button>
                    {selected && (
                      <div style={{ background: C.surface, border: `1px solid ${p.color}50`, borderTop: "none", borderRadius: "0 0 14px 14px", padding: "12px 20px 16px", display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>Handle</label>
                          <input placeholder="@username" value={details.handle || ""} onChange={e => setPlatformDetails({ ...platformDetails, [p.name]: { ...details, handle: e.target.value } })} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>Followers</label>
                          <input placeholder="e.g. 150000" type="number" value={details.followers || ""} onChange={e => setPlatformDetails({ ...platformDetails, [p.name]: { ...details, followers: e.target.value } })} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit" }} />
                        </div>
                        <div style={{ width: 100 }}>
                          <label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>Eng. Rate %</label>
                          <input placeholder="e.g. 4.5" type="number" step="0.1" value={details.engagement || ""} onChange={e => setPlatformDetails({ ...platformDetails, [p.name]: { ...details, engagement: e.target.value } })} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit" }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ background: C.border, color: C.textMuted, border: "none", borderRadius: 12, padding: "14px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}><ChevronLeft size={16} style={{ verticalAlign: "middle" }} /> Back</button>
              <button onClick={() => setStep(2)} disabled={formData.platforms.length === 0} style={{ flex: 1, background: formData.platforms.length > 0 ? C.accent : C.border, color: formData.platforms.length > 0 ? "#0D0F0A" : C.textDim, border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 600, cursor: formData.platforms.length > 0 ? "pointer" : "default" }}>Continue</button>
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif", marginBottom: 8 }}>What categories do you work in?</h2>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 28 }}>Pick the verticals that match your content. This powers brand matching.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 28 }}>
              {categoryOptions.map(cat => {
                const selected = formData.categories.includes(cat);
                return (
                  <button key={cat} onClick={() => {
                    const categories = selected ? formData.categories.filter(x => x !== cat) : [...formData.categories, cat];
                    setFormData({ ...formData, categories });
                  }} style={{ background: selected ? C.accent + "20" : C.surface, border: `1px solid ${selected ? C.accent + "50" : C.border}`, borderRadius: 10, padding: "12px 8px", fontSize: 13, color: selected ? C.accentLight : C.textMuted, cursor: "pointer", fontWeight: selected ? 600 : 400, transition: "all 0.15s" }}>{cat}</button>
                );
              })}
            </div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>Past brand deals (optional)</div>
              <select value={formData.pastDeals} onChange={e => setFormData({ ...formData, pastDeals: e.target.value })} style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", fontSize: 14, color: C.text, outline: "none", fontFamily: "inherit", appearance: "none" }}>
                <option value="">Select range...</option>
                <option value="0">No brand deals yet</option>
                <option value="1-5">1–5 deals</option>
                <option value="6-15">6–15 deals</option>
                <option value="15+">15+ deals</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ background: C.border, color: C.textMuted, border: "none", borderRadius: 12, padding: "14px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}><ChevronLeft size={16} style={{ verticalAlign: "middle" }} /> Back</button>
              <button onClick={handleAnalyze} disabled={formData.categories.length === 0} style={{ flex: 1, background: formData.categories.length > 0 ? `linear-gradient(135deg, #6B8F4E, ${C.accentLight})` : C.border, color: formData.categories.length > 0 ? "#0D0F0A" : C.textDim, border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 600, cursor: formData.categories.length > 0 ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Sparkles size={18} /> Build My Revenue Profile
              </button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Sans', sans-serif", padding: 40, color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/cabinet-grotesk" rel="stylesheet" />
      <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
        {progressDots.map(i => (
          <div key={i} style={{ width: i === step ? 32 : 10, height: 6, borderRadius: 3, background: i <= step ? C.accent : C.border, transition: "all 0.3s" }} />
        ))}
      </div>
      {stepContent()}
    </div>
  );
}

// ==================== BEFORE/AFTER ====================

function BeforeAfterView({ onContinue }) {
  const [showAfter, setShowAfter] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowAfter(true), 2500); return () => clearTimeout(t); }, []);

  const beforeItems = [
    { icon: "📱", label: "Brand DM on Instagram", detail: "Nike reached out 3 weeks ago — buried in DMs" },
    { icon: "📝", label: "Notes app pricing", detail: '"I think I charged $800 last time??"' },
    { icon: "📧", label: "Gmail thread #47", detail: "Contract somewhere in attachments..." },
    { icon: "📊", label: "Random spreadsheet", detail: "Last updated 4 months ago" },
    { icon: "🤷", label: "No idea what to charge", detail: "Accepted $1,200... benchmark was $2,100" },
    { icon: "💸", label: "Revenue?", detail: '"I think I made like... $40K this year?"' },
  ];

  return (
    <div style={{ height: "100vh", background: C.bg, fontFamily: "'Instrument Sans', sans-serif", color: C.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/cabinet-grotesk" rel="stylesheet" />
      <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif", marginBottom: 8 }}>{showAfter ? "After Nuvus" : "Before Nuvus"}</h1>
      <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 36 }}>{showAfter ? "Everything in one place. Priced right. Deals tracked. Revenue clear." : "This is how most creators manage their brand deals today."}</p>

      {!showAfter ? (
        <div style={{ maxWidth: 520, width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <style>{`@keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }`}</style>
          {beforeItems.map((item, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.red}20`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, animation: `fadeUp 0.4s ease ${i * 0.1}s both` }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.label}</div>
                <div style={{ fontSize: 12, color: C.red, opacity: 0.8, fontStyle: "italic" }}>{item.detail}</div>
              </div>
              <X size={16} color={C.red} opacity={0.4} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ maxWidth: 600, width: "100%", animation: "fadeUp 0.6s ease" }}>
          <style>{`@keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }`}</style>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[{ icon: DollarSign, label: "Smart Pricing", desc: "Know your worth per deliverable", color: C.green }, { icon: Target, label: "Brand Matches", desc: "Curated brands that fit you", color: C.accent }, { icon: Briefcase, label: "Deal Tracking", desc: "Pipeline, contracts, payments", color: C.blue }].map((item, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${item.color}30`, borderRadius: 14, padding: 18, textAlign: "center", animation: `fadeUp 0.4s ease ${i * 0.15}s both` }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: item.color + "18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}><item.icon size={20} color={item.color} /></div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={onContinue} style={{ background: `linear-gradient(135deg, #6B8F4E, ${C.accentLight})`, color: "#0D0F0A", border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>Enter your dashboard <ArrowRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== FUNCTIONAL PRICING ENGINE ====================

function PricingEngine({ profile, userPrices, setUserPrices }) {
  const allPricing = useMemo(() => {
    if (!profile?.platforms) return [];
    const results = [];
    profile.platforms.forEach(p => {
      const items = calculatePricing(p.name, p.followers, p.engagement);
      results.push(...items);
    });
    return results;
  }, [profile]);

  const [showAll, setShowAll] = useState(false);
  const items = showAll ? allPricing : allPricing.slice(0, 5);

  const totalRecommended = allPricing.reduce((s, p) => s + p.recommended, 0);
  const totalCurrent = allPricing.reduce((s, p) => s + (userPrices[p.type] || Math.round(p.recommended * 0.65)), 0);
  const uplift = totalCurrent > 0 ? Math.round(((totalRecommended - totalCurrent) / totalCurrent) * 100) : 0;
  const moneyOnTable = totalRecommended - totalCurrent;

  if (allPricing.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: C.textMuted }}>
        <Zap size={40} color={C.textDim} style={{ marginBottom: 16 }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>No platform data yet</div>
        <div style={{ fontSize: 14 }}>Add platforms with follower counts in your profile to generate pricing.</div>
      </div>
    );
  }

  return (
    <div>
      {moneyOnTable > 0 && (
        <div style={{ background: `linear-gradient(135deg, ${C.accent}15, ${C.green}08)`, border: `1px solid ${C.accent}30`, borderRadius: 16, padding: 24, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: C.accent + "25", display: "flex", alignItems: "center", justifyContent: "center" }}><Zap size={24} color={C.accentLight} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4 }}>You're leaving ~${moneyOnTable.toLocaleString()} on the table</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>Based on your metrics, you could earn <strong style={{ color: C.green }}>{uplift}% more</strong> per campaign cycle.</div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => {
          const currentPrice = userPrices[item.type] || Math.round(item.recommended * 0.65);
          const gap = item.recommended - currentPrice;
          const pct = Math.round((gap / Math.max(currentPrice, 1)) * 100);
          const underpriced = gap > 0;
          return (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{item.type}</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>{item.platform}</div>
                  {underpriced && <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}><AlertTriangle size={12} color={C.orange} /><span style={{ fontSize: 11, color: C.orange, fontWeight: 500 }}>Underpriced by {pct}%</span></div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 2 }}>Recommended</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.green, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif" }}>${item.recommended.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: C.textDim }}>Your price:</span>
                  <div style={{ display: "flex", alignItems: "center", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
                    <span style={{ padding: "4px 6px", color: C.textDim, fontSize: 12 }}>$</span>
                    <input type="number" value={currentPrice} onChange={e => setUserPrices({ ...userPrices, [item.type]: parseInt(e.target.value) || 0 })} style={{ width: 70, background: "transparent", border: "none", padding: "4px 6px", fontSize: 13, color: underpriced ? C.red : C.green, fontWeight: 600, outline: "none", fontFamily: "inherit" }} />
                  </div>
                </div>
                <div><span style={{ color: C.textDim }}>Benchmark: </span><span style={{ color: C.textMuted, fontWeight: 600 }}>${item.benchmark.toLocaleString()}</span></div>
                <div style={{ marginLeft: "auto" }}><span style={{ color: underpriced ? C.green : C.textDim, fontWeight: 600 }}>{underpriced ? "+" : ""}${gap.toLocaleString()}</span></div>
              </div>
              <div style={{ marginTop: 10, height: 6, background: C.border, borderRadius: 3, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", height: "100%", background: C.green, borderRadius: 3, width: "100%", opacity: 0.15 }} />
                <div style={{ position: "absolute", height: "100%", background: underpriced ? C.red + "80" : C.green + "80", borderRadius: 3, width: `${Math.min((currentPrice / item.recommended) * 100, 100)}%`, transition: "width 0.3s" }} />
                <div style={{ position: "absolute", height: "100%", width: `${(item.benchmark / item.recommended) * 100}%`, borderRight: `2px dashed ${C.textDim}` }} />
              </div>
            </div>
          );
        })}
      </div>
      {!showAll && allPricing.length > 5 && (
        <button onClick={() => setShowAll(true)} style={{ width: "100%", marginTop: 12, padding: "10px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, color: C.textMuted, fontSize: 13, cursor: "pointer" }}>Show all {allPricing.length} deliverables</button>
      )}
    </div>
  );
}

// ==================== FUNCTIONAL DEAL CRM ====================

function DealWorkspace({ deals, setDeals }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [newDeal, setNewDeal] = useState({ brand: "", type: "", value: "", stage: "Contacted", notes: "" });

  const addDeal = () => {
    if (!newDeal.brand || !newDeal.value) return;
    const deal = { ...newDeal, id: Date.now(), value: parseInt(newDeal.value) || 0, daysInStage: 0, deliverables: [], createdAt: new Date().toISOString() };
    setDeals([...deals, deal]);
    setNewDeal({ brand: "", type: "", value: "", stage: "Contacted", notes: "" });
    setShowAddModal(false);
  };

  const updateDeal = () => {
    if (!editDeal) return;
    setDeals(deals.map(d => d.id === editDeal.id ? { ...editDeal, value: parseInt(editDeal.value) || 0 } : d));
    setEditDeal(null);
  };

  const deleteDeal = (id) => {
    setDeals(deals.filter(d => d.id !== id));
    if (selectedDeal?.id === id) setSelectedDeal(null);
  };

  const moveDeal = (id, newStage) => {
    setDeals(deals.map(d => d.id === id ? { ...d, stage: newStage, daysInStage: 0 } : d));
  };

  const totalPipeline = deals.filter(d => d.stage !== "Lost").reduce((s, d) => s + (parseInt(d.value) || 0), 0);
  const closedRevenue = deals.filter(d => d.stage === "Closed").reduce((s, d) => s + (parseInt(d.value) || 0), 0);

  const DealForm = ({ data, setData, onSubmit, submitLabel }) => (
    <div>
      <InputField label="Brand name" value={data.brand} onChange={v => setData({ ...data, brand: v })} placeholder="e.g. Nike, Gymshark" />
      <InputField label="Deal type" value={data.type} onChange={v => setData({ ...data, type: v })} placeholder="e.g. 3-Post Bundle, Monthly Partnership" />
      <InputField label="Deal value" value={data.value} onChange={v => setData({ ...data, value: v })} placeholder="e.g. 15000" prefix="$" type="number" />
      <SelectField label="Stage" value={data.stage} onChange={v => setData({ ...data, stage: v })} options={stageOrder} />
      <InputField label="Notes (optional)" value={data.notes || ""} onChange={v => setData({ ...data, notes: v })} placeholder="Any details about this deal..." />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Btn onClick={onSubmit} full disabled={!data.brand || !data.value}>{submitLabel}</Btn>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 14 }}>
          <StatCard icon={Briefcase} label="Active Deals" value={String(deals.filter(d => d.stage !== "Lost").length)} />
          <StatCard icon={DollarSign} label="Pipeline Value" value={`$${(totalPipeline / 1000).toFixed(0)}K`} />
          <StatCard icon={TrendingUp} label="Closed Revenue" value={`$${(closedRevenue / 1000).toFixed(0)}K`} />
        </div>
        <Btn onClick={() => setShowAddModal(true)} icon={Plus}>New Deal</Btn>
      </div>

      {/* Pipeline columns */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${stageOrder.length}, 1fr)`, gap: 14 }}>
        {stageOrder.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const stageTotal = stageDeals.reduce((s, d) => s + (parseInt(d.value) || 0), 0);
          return (
            <div key={stage}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: stageColors[stage].text }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{stage}</span>
                  <span style={{ fontSize: 12, color: C.textDim, background: C.border, borderRadius: 8, padding: "1px 8px" }}>{stageDeals.length}</span>
                </div>
                <span style={{ fontSize: 12, color: C.textMuted }}>${(stageTotal / 1000).toFixed(0)}K</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 100, background: C.bg + "80", borderRadius: 12, padding: 8 }}>
                {stageDeals.map(deal => (
                  <div key={deal.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{deal.brand}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.green, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif" }}>${(parseInt(deal.value) / 1000).toFixed(0)}K</span>
                    </div>
                    {deal.type && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{deal.type}</div>}
                    {deal.notes && <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8, fontStyle: "italic" }}>{deal.notes}</div>}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {stageOrder.filter(s => s !== stage).map(s => (
                        <button key={s} onClick={() => moveDeal(deal.id, s)} style={{ background: stageColors[s].bg, color: stageColors[s].text, border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>→ {s}</button>
                      ))}
                      <button onClick={() => setEditDeal({ ...deal, value: String(deal.value) })} style={{ background: C.border, color: C.textMuted, border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>Edit</button>
                      <button onClick={() => deleteDeal(deal.id)} style={{ background: C.redDim, color: C.red, border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 10, cursor: "pointer" }}>Delete</button>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: C.textDim }}>No deals</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <Modal title="Add New Deal" onClose={() => setShowAddModal(false)}>
          <DealForm data={newDeal} setData={setNewDeal} onSubmit={addDeal} submitLabel="Add Deal" />
        </Modal>
      )}

      {/* Edit Deal Modal */}
      {editDeal && (
        <Modal title="Edit Deal" onClose={() => setEditDeal(null)}>
          <DealForm data={editDeal} setData={setEditDeal} onSubmit={updateDeal} submitLabel="Save Changes" />
          <div style={{ marginTop: 12 }}>
            <Btn variant="danger" full onClick={() => { deleteDeal(editDeal.id); setEditDeal(null); }} icon={Trash2}>Delete Deal</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ==================== FUNCTIONAL BRAND MATCHING ====================

function BrandMatching({ profile, deals, setDeals, brandStatuses, setBrandStatuses }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy, setSortBy] = useState("fit");

  const matches = useMemo(() => {
    return BRAND_DB.map(brand => ({
      ...brand,
      fit: calculateBrandFit(brand, profile),
    })).filter(b => b.fit > 20).sort((a, b) => sortBy === "fit" ? b.fit - a.fit : b.maxBudget - a.maxBudget);
  }, [profile, sortBy]);

  const filtered = filterCat === "All" ? matches : matches.filter(b => b.categories.includes(filterCat));
  const allCats = [...new Set(BRAND_DB.flatMap(b => b.categories))];

  const setStatus = (brandId, status) => {
    setBrandStatuses({ ...brandStatuses, [brandId]: status });
  };

  const createDealFromBrand = (brand) => {
    const newDeal = { id: Date.now(), brand: brand.name, type: "Brand Partnership", value: Math.round((brand.minBudget + brand.maxBudget) / 2), stage: "Contacted", daysInStage: 0, notes: `Auto-created from brand match (${brand.fit}% fit)`, createdAt: new Date().toISOString() };
    setDeals(prev => [...prev, newDeal]);
    setStatus(brand.id, "outreach_sent");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {["All", ...allCats].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} style={{ background: filterCat === cat ? C.accent + "20" : C.border, border: `1px solid ${filterCat === cat ? C.accent + "40" : C.border}`, color: filterCat === cat ? C.accentLight : C.textMuted, borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{cat}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={() => setSortBy("fit")} style={{ background: sortBy === "fit" ? C.accent + "15" : "transparent", border: `1px solid ${sortBy === "fit" ? C.accent + "40" : C.border}`, color: sortBy === "fit" ? C.accentLight : C.textDim, borderRadius: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Sort by Fit</button>
        <button onClick={() => setSortBy("budget")} style={{ background: sortBy === "budget" ? C.accent + "15" : "transparent", border: `1px solid ${sortBy === "budget" ? C.accent + "40" : C.border}`, color: sortBy === "budget" ? C.accentLight : C.textDim, borderRadius: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>Sort by Budget</button>
        <span style={{ fontSize: 12, color: C.textDim, alignSelf: "center", marginLeft: 8 }}>{filtered.length} matches found</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(brand => {
          const status = brandStatuses[brand.id];
          return (
            <div key={brand.id} style={{ background: C.surface, border: `1px solid ${expandedId === brand.id ? C.accent + "40" : C.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.2s" }}>
              <button onClick={() => setExpandedId(expandedId === brand.id ? null : brand.id)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: brand.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: brand.color, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif", flexShrink: 0 }}>{brand.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{brand.name}</span>
                    {status && <span style={{ fontSize: 10, fontWeight: 600, color: status === "outreach_sent" ? C.blue : status === "interested" ? C.green : C.textDim, background: status === "outreach_sent" ? C.blueDim : status === "interested" ? C.greenDim : C.border, padding: "2px 8px", borderRadius: 6 }}>{status === "outreach_sent" ? "Outreach Sent" : status === "interested" ? "Interested" : "Not Now"}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{brand.categories.join(" • ")} • ${(brand.minBudget / 1000).toFixed(0)}K–${(brand.maxBudget / 1000).toFixed(0)}K</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: brand.fit >= 80 ? C.green : brand.fit >= 60 ? C.accentLight : C.orange, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif" }}>{brand.fit}%</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>Fit Score</div>
                </div>
                <ChevronDown size={16} color={C.textDim} style={{ transform: expandedId === brand.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }} />
              </button>
              {expandedId === brand.id && (
                <div style={{ padding: "0 22px 18px", borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <div style={{ background: C.bg, borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Platforms</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{brand.platforms.join(", ")}</div>
                    </div>
                    <div style={{ background: C.bg, borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Min Followers</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{(brand.minFollowers / 1000).toFixed(0)}K</div>
                    </div>
                    <div style={{ background: C.bg, borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Budget Range</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>${(brand.minBudget / 1000).toFixed(0)}K–${(brand.maxBudget / 1000).toFixed(0)}K</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!status && (
                      <>
                        <Btn onClick={() => createDealFromBrand(brand)} icon={Send}>Start Outreach & Create Deal</Btn>
                        <Btn variant="secondary" onClick={() => setStatus(brand.id, "interested")} icon={Star}>Mark Interested</Btn>
                        <Btn variant="ghost" onClick={() => setStatus(brand.id, "not_now")} small>Not Now</Btn>
                      </>
                    )}
                    {status === "outreach_sent" && <Btn variant="success" icon={Check}>Outreach Sent — Deal Created</Btn>}
                    {status === "interested" && <Btn onClick={() => createDealFromBrand(brand)} icon={Send}>Start Outreach & Create Deal</Btn>}
                    {status === "not_now" && <Btn variant="ghost" onClick={() => setStatus(brand.id, "interested")}>Reconsider</Btn>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: C.textMuted }}>No brands match this filter. Try broadening your categories.</div>
      )}
    </div>
  );
}

// ==================== FUNCTIONAL REVENUE DASHBOARD ====================

function RevenueDashboard({ deals, profile }) {
  const closedDeals = deals.filter(d => d.stage === "Closed");
  const totalRevenue = closedDeals.reduce((s, d) => s + (parseInt(d.value) || 0), 0);
  const pipelineValue = deals.filter(d => d.stage !== "Lost" && d.stage !== "Closed").reduce((s, d) => s + (parseInt(d.value) || 0), 0);
  const avgDealSize = closedDeals.length > 0 ? Math.round(totalRevenue / closedDeals.length) : 0;

  // Build brand revenue breakdown from closed deals
  const brandRevenue = closedDeals.reduce((acc, d) => {
    const existing = acc.find(x => x.brand === d.brand);
    if (existing) existing.revenue += parseInt(d.value) || 0;
    else acc.push({ brand: d.brand, revenue: parseInt(d.value) || 0 });
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  // Platform distribution from profile
  const platformData = (profile?.platforms || []).map((p, i) => {
    const colors = ["#E1306C", "#00F2EA", "#FF0000", "#7A7F9A"];
    return { name: p.name, value: Math.round(100 / (profile?.platforms?.length || 1)), color: colors[i % colors.length] };
  });

  // Simulated monthly trend based on deals
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const trend = monthNames.map((m, i) => ({
    month: m,
    revenue: Math.round((totalRevenue / 6) * (0.5 + (i * 0.2)) + Math.random() * 2000),
  }));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 28 }}>
        <StatCard icon={DollarSign} label="Closed Revenue" value={`$${totalRevenue.toLocaleString()}`} accent />
        <StatCard icon={TrendingUp} label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} />
        <StatCard icon={Briefcase} label="Active Deals" value={String(deals.filter(d => d.stage !== "Lost").length)} />
        <StatCard icon={Target} label="Avg. Deal Size" value={avgDealSize > 0 ? `$${avgDealSize.toLocaleString()}` : "—"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Revenue Trend</div>
          {totalRevenue > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend}>
                <defs><linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity={0.3} /><stop offset="100%" stopColor={C.accent} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="month" tick={{ fill: C.textDim, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textDim, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13 }} formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke={C.accent} strokeWidth={2.5} fill="url(#revGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 14 }}>Close some deals to see your revenue trend</div>
          )}
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Platforms</div>
          {platformData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart><Pie data={platformData} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">{platformData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie></PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {platformData.map(p => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                    <span style={{ color: C.textMuted, flex: 1 }}>{p.name}</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>{p.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 13 }}>Add platforms in your profile</div>
          )}
        </div>
      </div>

      {brandRevenue.length > 0 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Revenue by Brand</div>
          <ResponsiveContainer width="100%" height={Math.max(brandRevenue.length * 40, 100)}>
            <BarChart data={brandRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="brand" tick={{ fill: C.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} width={120} />
              <Bar dataKey="revenue" fill={C.accent} radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {deals.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: C.textMuted }}>
          <BarChart3 size={40} color={C.textDim} style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>No deals yet</div>
          <div style={{ fontSize: 14 }}>Add deals in the Deal Workspace or start outreach from Brand Matches to see your revenue here.</div>
        </div>
      )}
    </div>
  );
}

// ==================== CREATOR PROFILE (EDITABLE) ====================

function CreatorProfile({ profile, setProfile }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(profile);

  const save = () => {
    setProfile(editData);
    setEditing(false);
  };

  const maxFollowers = Math.max(...(profile.platforms || []).map(p => parseInt(p.followers) || 0), 0);
  const avgEngagement = profile.platforms?.length > 0 ? (profile.platforms.reduce((s, p) => s + (parseFloat(p.engagement) || 0), 0) / profile.platforms.length).toFixed(1) : "0";
  const monetizationScore = Math.min(Math.round((maxFollowers / 20000) + (parseFloat(avgEngagement) * 8) + ((profile.categories?.length || 0) * 3) + ((profile.platforms?.length || 0) * 5)), 99);

  const formatFollowers = (n) => {
    const num = parseInt(n) || 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return String(num);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 28, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, #6B8F4E, ${C.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#0D0F0A", fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif", flexShrink: 0 }}>
          {(profile.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif" }}>{profile.name}</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8 }}>{profile.type}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(profile.categories || []).map(c => (
              <span key={c} style={{ fontSize: 11, color: C.accentLight, background: C.accent + "15", border: `1px solid ${C.accent}30`, borderRadius: 6, padding: "3px 10px" }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Monetization Score</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: C.green, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif" }}>{monetizationScore}</div>
        </div>
        <Btn variant="secondary" onClick={() => { setEditData({ ...profile }); setEditing(true); }} icon={Edit3} small>Edit</Btn>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>Connected Platforms</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {(profile.platforms || []).map(p => {
          const colors = { Instagram: "#E1306C", TikTok: "#00F2EA", YouTube: "#FF0000", "Twitter/X": "#7A7F9A" };
          return (
            <div key={p.name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[p.name] || C.accent }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</span>
                {p.handle && <span style={{ fontSize: 11, color: C.textDim, marginLeft: "auto" }}>{p.handle}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif" }}>{formatFollowers(p.followers)}</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>Followers</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.green, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif" }}>{p.engagement}%</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>Engagement</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(profile.platforms?.length || 0) > 0 && (
        <div style={{ background: `linear-gradient(135deg, ${C.green}10, ${C.accent}10)`, border: `1px solid ${C.green}25`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><Award size={18} color={C.green} /><span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Revenue Opportunity Insights</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: C.textMuted }}>
            {parseFloat(avgEngagement) > 4 && <div style={{ display: "flex", alignItems: "start", gap: 8 }}><ChevronRight size={14} color={C.green} style={{ marginTop: 2, flexShrink: 0 }} /><span>Your engagement rate ({avgEngagement}%) is above average — brands pay a premium for this.</span></div>}
            {(profile.platforms?.length || 0) > 1 && <div style={{ display: "flex", alignItems: "start", gap: 8 }}><ChevronRight size={14} color={C.green} style={{ marginTop: 2, flexShrink: 0 }} /><span>Cross-platform bundles ({profile.platforms.map(p => p.name).join(" + ")}) can increase deal value by 40–60%.</span></div>}
            {maxFollowers > 100000 && <div style={{ display: "flex", alignItems: "start", gap: 8 }}><ChevronRight size={14} color={C.green} style={{ marginTop: 2, flexShrink: 0 }} /><span>With {formatFollowers(maxFollowers)}+ followers, you qualify for mid-tier to premium brand campaigns.</span></div>}
            {(profile.categories?.length || 0) > 0 && <div style={{ display: "flex", alignItems: "start", gap: 8 }}><ChevronRight size={14} color={C.green} style={{ marginTop: 2, flexShrink: 0 }} /><span>Your categories ({profile.categories.slice(0, 3).join(", ")}) are among the most active for brand partnerships.</span></div>}
          </div>
        </div>
      )}

      {editing && (
        <Modal title="Edit Profile" onClose={() => setEditing(false)} width={550}>
          <InputField label="Name" value={editData.name} onChange={v => setEditData({ ...editData, name: v })} />
          <SelectField label="Creator Type" value={editData.type} onChange={v => setEditData({ ...editData, type: v })} options={["Content Creator", "Athlete", "Musician", "Fitness Creator", "Lifestyle Creator", "Gaming Creator"]} />
          <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 8, fontWeight: 500 }}>Platforms</div>
          {(editData.platforms || []).map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "end" }}>
              <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: C.textDim }}>Platform</label><input value={p.name} readOnly style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: C.textDim, fontFamily: "inherit" }} /></div>
              <div style={{ flex: 1 }}><label style={{ fontSize: 11, color: C.textDim }}>Followers</label><input type="number" value={p.followers} onChange={e => { const plats = [...editData.platforms]; plats[i] = { ...plats[i], followers: e.target.value }; setEditData({ ...editData, platforms: plats }); }} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit" }} /></div>
              <div style={{ width: 80 }}><label style={{ fontSize: 11, color: C.textDim }}>Eng %</label><input type="number" step="0.1" value={p.engagement} onChange={e => { const plats = [...editData.platforms]; plats[i] = { ...plats[i], engagement: e.target.value }; setEditData({ ...editData, platforms: plats }); }} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: C.text, outline: "none", fontFamily: "inherit" }} /></div>
            </div>
          ))}
          <div style={{ marginTop: 16 }}><Btn onClick={save} full icon={Save}>Save Profile</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ==================== MAIN APP ====================

export default function NuvusMVP() {
  const [appState, setAppState] = useState("onboarding");
  const [profile, setProfile] = useState({ name: "", type: "", platforms: [], categories: [] });
  const [deals, setDeals] = useState([]);
  const [userPrices, setUserPrices] = useState({});
  const [brandStatuses, setBrandStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifs, setShowNotifs] = useState(false);

  const notifications = useMemo(() => {
    const n = [];
    deals.filter(d => d.stage === "Negotiating").forEach(d => n.push({ text: `${d.brand} deal in negotiation`, time: "Active", type: "deal" }));
    const topMatch = BRAND_DB.map(b => ({ ...b, fit: calculateBrandFit(b, profile) })).sort((a, b) => b.fit - a.fit)[0];
    if (topMatch && topMatch.fit > 50) n.push({ text: `New match: ${topMatch.name} (${topMatch.fit}% fit)`, time: "Just now", type: "match" });
    return n;
  }, [deals, profile]);

  const handleOnboardingComplete = (profileData) => {
    setProfile(profileData);
    setAppState("beforeAfter");
  };

  if (appState === "onboarding") return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  if (appState === "beforeAfter") return <BeforeAfterView onContinue={() => setAppState("app")} />;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "profile", label: "Revenue Profile", icon: Users },
    { id: "pricing", label: "Pricing Engine", icon: Zap },
    { id: "brands", label: "Brand Matches", icon: Target, badge: String(BRAND_DB.map(b => calculateBrandFit(b, profile)).filter(f => f > 50).length) },
    { id: "deals", label: "Deal Workspace", icon: Briefcase, badge: deals.length > 0 ? String(deals.length) : undefined },
    { id: "revenue", label: "Revenue", icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <RevenueDashboard deals={deals} profile={profile} />;
      case "profile": return <CreatorProfile profile={profile} setProfile={setProfile} />;
      case "pricing": return <PricingEngine profile={profile} userPrices={userPrices} setUserPrices={setUserPrices} />;
      case "brands": return <BrandMatching profile={profile} deals={deals} setDeals={setDeals} brandStatuses={brandStatuses} setBrandStatuses={setBrandStatuses} />;
      case "deals": return <DealWorkspace deals={deals} setDeals={setDeals} />;
      case "revenue": return <RevenueDashboard deals={deals} profile={profile} />;
      default: return <RevenueDashboard deals={deals} profile={profile} />;
    }
  };

  const pageTitle = tabs.find(t => t.id === activeTab)?.label || "Dashboard";

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'Instrument Sans', -apple-system, sans-serif", color: C.text, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.cdnfonts.com/css/cabinet-grotesk" rel="stylesheet" />

      <div style={{ width: 240, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", padding: "24px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 36 }}>
          <img src="./Nuvus.png" alt="Nuvus" style={{ height: 32, borderRadius: 8 }} />
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif", letterSpacing: -0.5, color: C.text }}>Nuvus</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {tabs.map(tab => <NavItem key={tab.id} icon={tab.icon} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} badge={tab.badge} />)}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
          <NavItem icon={Settings} label="Settings" onClick={() => {}} />
          <NavItem icon={LogOut} label="Log out" onClick={() => setAppState("onboarding")} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: 64, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Cabinet Grotesk', 'Instrument Sans', sans-serif" }}>{pageTitle}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotifs(!showNotifs)} style={{ width: 38, height: 38, borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <Bell size={17} color={C.textMuted} />
                {notifications.length > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: C.accent }} />}
              </button>
              {showNotifs && (
                <div style={{ position: "absolute", top: 46, right: 0, width: 300, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 8, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                  {notifications.length > 0 ? notifications.map((n, i) => (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 8, display: "flex", gap: 10, alignItems: "start" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, marginTop: 5, flexShrink: 0 }} />
                      <div><div style={{ fontSize: 13, color: C.text }}>{n.text}</div><div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{n.time}</div></div>
                    </div>
                  )) : <div style={{ padding: 16, textAlign: "center", fontSize: 13, color: C.textDim }}>No notifications</div>}
                </div>
              )}
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, #6B8F4E, ${C.accentLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#0D0F0A", cursor: "pointer" }}>
              {(profile.name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 28, scrollbarWidth: "thin", scrollbarColor: `${C.border} transparent` }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
