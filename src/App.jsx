import { useState, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Users, Target, ChevronRight, Star, ArrowUpRight, ArrowDownRight, Bell, Search, Plus, Check, Clock, Send, FileText, Eye, MessageSquare, Zap, BarChart3, Layout, Briefcase, Home, Settings, LogOut, ChevronDown, X, Filter, ExternalLink, AlertTriangle, Award, Percent, Package } from "lucide-react";

const COLORS = {
  bg: "#0A0B0F",
  surface: "#12131A",
  surfaceHover: "#1A1B24",
  border: "#1E2030",
  borderLight: "#2A2D42",
  text: "#E8E9F0",
  textMuted: "#7A7F9A",
  textDim: "#4A4F6A",
  accent: "#6C5CE7",
  accentLight: "#A29BFE",
  accentGlow: "rgba(108,92,231,0.15)",
  green: "#00D68F",
  greenDim: "rgba(0,214,143,0.12)",
  red: "#FF6B6B",
  redDim: "rgba(255,107,107,0.12)",
  orange: "#FDCB6E",
  orangeDim: "rgba(253,203,110,0.12)",
  blue: "#74B9FF",
  blueDim: "rgba(116,185,255,0.12)",
};

const monthlyRevenue = [
  { month: "Sep", revenue: 4200, deals: 3 },
  { month: "Oct", revenue: 6800, deals: 5 },
  { month: "Nov", revenue: 8100, deals: 4 },
  { month: "Dec", revenue: 12400, deals: 7 },
  { month: "Jan", revenue: 15200, deals: 8 },
  { month: "Feb", revenue: 18600, deals: 9 },
  { month: "Mar", revenue: 22100, deals: 11 },
];

const platformRevenue = [
  { name: "Instagram", value: 42, color: "#E1306C" },
  { name: "TikTok", value: 28, color: "#00F2EA" },
  { name: "YouTube", value: 22, color: "#FF0000" },
  { name: "Twitter/X", value: 8, color: "#7A7F9A" },
];

const brandMatches = [
  { id: 1, name: "Nike Training", logo: "N", fit: 94, category: "Fitness", budget: "$15K–$25K", status: "High Match", color: "#F97316" },
  { id: 2, name: "Liquid IV", logo: "L", fit: 91, category: "Health & Wellness", budget: "$8K–$15K", status: "High Match", color: "#22D3EE" },
  { id: 3, name: "Gymshark", logo: "G", fit: 87, category: "Apparel", budget: "$10K–$20K", status: "Strong Match", color: "#A78BFA" },
  { id: 4, name: "Athletic Greens", logo: "A", fit: 84, category: "Supplements", budget: "$5K–$12K", status: "Strong Match", color: "#34D399" },
  { id: 5, name: "Beats by Dre", logo: "B", fit: 79, category: "Tech / Audio", budget: "$12K–$30K", status: "Good Match", color: "#F472B6" },
];

const deals = [
  { id: 1, brand: "Nike Training", type: "3-Post Bundle + Story", value: 22000, stage: "Negotiating", daysInStage: 4, deliverables: 4, completed: 0 },
  { id: 2, brand: "Liquid IV", type: "Monthly Partnership", value: 12000, stage: "Contacted", daysInStage: 2, deliverables: 6, completed: 0 },
  { id: 3, brand: "Gymshark", type: "Reel + Story Series", value: 15000, stage: "Closed", daysInStage: 0, deliverables: 5, completed: 3 },
  { id: 4, brand: "Athletic Greens", type: "Single Post", value: 5000, stage: "Closed", daysInStage: 0, deliverables: 1, completed: 1 },
  { id: 5, brand: "WHOOP", type: "Long-term Ambassador", value: 36000, stage: "Negotiating", daysInStage: 7, deliverables: 12, completed: 0 },
];

const pricingData = [
  { type: "Instagram Reel", current: 1200, recommended: 2100, benchmark: 1800, underpriced: true },
  { type: "Instagram Story (set of 3)", current: 600, recommended: 950, benchmark: 800, underpriced: true },
  { type: "TikTok Video", current: 1500, recommended: 1900, benchmark: 1700, underpriced: true },
  { type: "YouTube Integration (60s)", current: 3500, recommended: 4200, benchmark: 3800, underpriced: false },
  { type: "Instagram Static Post", current: 800, recommended: 1400, benchmark: 1100, underpriced: true },
  { type: "Twitter/X Thread", current: 400, recommended: 650, benchmark: 550, underpriced: true },
];

const notifications = [
  { text: "Nike Training viewed your profile", time: "2h ago", type: "view" },
  { text: "Gymshark deliverable due tomorrow", time: "5h ago", type: "deadline" },
  { text: "New brand match: Celsius Energy", time: "1d ago", type: "match" },
];

const stageColors = {
  Contacted: { bg: COLORS.blueDim, text: COLORS.blue },
  Negotiating: { bg: COLORS.orangeDim, text: COLORS.orange },
  Closed: { bg: COLORS.greenDim, text: COLORS.green },
  Lost: { bg: COLORS.redDim, text: COLORS.red },
};

function StatCard({ icon: Icon, label, value, change, changeLabel, accent = false }) {
  const isPositive = change > 0;
  return (
    <div style={{
      background: accent ? `linear-gradient(135deg, ${COLORS.accent}22, ${COLORS.surface})` : COLORS.surface,
      border: `1px solid ${accent ? COLORS.accent + "44" : COLORS.border}`,
      borderRadius: 16, padding: "22px 24px", position: "relative", overflow: "hidden",
    }}>
      {accent && <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: COLORS.accent + "10" }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accent ? COLORS.accent + "30" : COLORS.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={accent ? COLORS.accentLight : COLORS.textMuted} />
        </div>
        <span style={{ color: COLORS.textMuted, fontSize: 13, fontWeight: 500, letterSpacing: 0.3 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, fontFamily: "'Outfit', sans-serif", letterSpacing: -0.5 }}>{value}</div>
      {change !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
          {isPositive ? <ArrowUpRight size={14} color={COLORS.green} /> : <ArrowDownRight size={14} color={COLORS.red} />}
          <span style={{ fontSize: 12, fontWeight: 600, color: isPositive ? COLORS.green : COLORS.red }}>{isPositive ? "+" : ""}{change}%</span>
          <span style={{ fontSize: 12, color: COLORS.textDim }}>{changeLabel}</span>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 12, border: "none",
      background: active ? COLORS.accent + "18" : "transparent", cursor: "pointer", width: "100%", position: "relative",
      transition: "all 0.2s",
    }}>
      <Icon size={19} color={active ? COLORS.accentLight : COLORS.textMuted} />
      <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? COLORS.text : COLORS.textMuted }}>{label}</span>
      {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 4, background: COLORS.accent }} />}
      {badge && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: COLORS.bg, background: COLORS.accent, borderRadius: 10, padding: "2px 8px" }}>{badge}</span>}
    </button>
  );
}

function DealPipeline({ onDealClick }) {
  const stages = ["Contacted", "Negotiating", "Closed"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
      {stages.map(stage => {
        const stageDeals = deals.filter(d => d.stage === stage);
        const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
        return (
          <div key={stage}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stageColors[stage].text }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{stage}</span>
                <span style={{ fontSize: 12, color: COLORS.textDim, background: COLORS.border, borderRadius: 8, padding: "1px 8px" }}>{stageDeals.length}</span>
              </div>
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>${(stageTotal / 1000).toFixed(0)}K</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stageDeals.map(deal => (
                <button key={deal.id} onClick={() => onDealClick(deal)} style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, cursor: "pointer",
                  textAlign: "left", transition: "all 0.2s", width: "100%",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{deal.brand}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.green, fontFamily: "'Outfit', sans-serif" }}>${(deal.value / 1000).toFixed(0)}K</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}>{deal.type}</div>
                  {stage === "Closed" && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>Deliverables</span>
                        <span style={{ fontSize: 11, color: COLORS.textMuted }}>{deal.completed}/{deal.deliverables}</span>
                      </div>
                      <div style={{ height: 4, background: COLORS.border, borderRadius: 2 }}>
                        <div style={{ height: 4, background: COLORS.green, borderRadius: 2, width: `${(deal.completed / deal.deliverables) * 100}%`, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  )}
                  {stage !== "Closed" && deal.daysInStage > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} color={COLORS.textDim} />
                      <span style={{ fontSize: 11, color: COLORS.textDim }}>{deal.daysInStage}d in stage</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DealDetail({ deal, onClose }) {
  if (!deal) return null;
  const milestones = [
    { label: "Outreach sent", done: true },
    { label: "Response received", done: deal.stage !== "Contacted" },
    { label: "Terms negotiated", done: deal.stage === "Closed" },
    { label: "Contract signed", done: deal.stage === "Closed" },
    { label: "Deliverables complete", done: deal.stage === "Closed" && deal.completed === deal.deliverables },
    { label: "Payment received", done: false },
  ];
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 440, height: "100vh", background: COLORS.surface, borderLeft: `1px solid ${COLORS.border}`, zIndex: 100, overflowY: "auto", padding: 28, animation: "slideIn 0.25s ease" }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, margin: 0, fontFamily: "'Outfit', sans-serif" }}>{deal.brand}</h3>
        <button onClick={onClose} style={{ background: COLORS.border, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={16} color={COLORS.textMuted} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <span style={{ background: stageColors[deal.stage].bg, color: stageColors[deal.stage].text, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 8 }}>{deal.stage}</span>
        <span style={{ background: COLORS.border, color: COLORS.textMuted, fontSize: 12, padding: "4px 12px", borderRadius: 8 }}>{deal.type}</span>
      </div>
      <div style={{ background: COLORS.bg, borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Deal Value</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.green, fontFamily: "'Outfit', sans-serif" }}>${deal.value.toLocaleString()}</div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 14 }}>Deal Progress</div>
        {milestones.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${m.done ? COLORS.green : COLORS.border}`, background: m.done ? COLORS.greenDim : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {m.done && <Check size={12} color={COLORS.green} />}
            </div>
            <span style={{ fontSize: 13, color: m.done ? COLORS.text : COLORS.textDim }}>{m.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button style={{ background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Send Follow-up</button>
        <button style={{ background: COLORS.border, color: COLORS.text, border: "none", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Upload Contract</button>
      </div>
    </div>
  );
}

function PricingEngine() {
  const [showAll, setShowAll] = useState(false);
  const items = showAll ? pricingData : pricingData.slice(0, 4);
  const totalCurrent = pricingData.reduce((s, p) => s + p.current, 0);
  const totalRecommended = pricingData.reduce((s, p) => s + p.recommended, 0);
  const uplift = Math.round(((totalRecommended - totalCurrent) / totalCurrent) * 100);

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${COLORS.accent}15, ${COLORS.green}08)`, border: `1px solid ${COLORS.accent}30`, borderRadius: 16, padding: 24, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: COLORS.accent + "25", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={24} color={COLORS.accentLight} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>You're leaving ~${(totalRecommended - totalCurrent).toLocaleString()} on the table</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>Based on your audience size, engagement, and category benchmarks, you could earn <strong style={{ color: COLORS.green }}>{uplift}% more</strong> per campaign cycle.</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => {
          const gap = item.recommended - item.current;
          const pct = Math.round((gap / item.current) * 100);
          return (
            <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{item.type}</div>
                  {item.underpriced && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertTriangle size={12} color={COLORS.orange} />
                      <span style={{ fontSize: 11, color: COLORS.orange, fontWeight: 500 }}>Underpriced by {pct}%</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 2 }}>Recommended</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.green, fontFamily: "'Outfit', sans-serif" }}>${item.recommended.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                <div>
                  <span style={{ color: COLORS.textDim }}>Your price: </span>
                  <span style={{ color: item.underpriced ? COLORS.red : COLORS.text, fontWeight: 600 }}>${item.current.toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: COLORS.textDim }}>Benchmark: </span>
                  <span style={{ color: COLORS.textMuted, fontWeight: 600 }}>${item.benchmark.toLocaleString()}</span>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span style={{ color: COLORS.green, fontWeight: 600 }}>+${gap.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ marginTop: 10, height: 6, background: COLORS.border, borderRadius: 3, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", height: "100%", background: COLORS.red + "80", borderRadius: 3, width: `${(item.current / item.recommended) * 100}%` }} />
                <div style={{ position: "absolute", height: "100%", borderRadius: 3, width: `${(item.benchmark / item.recommended) * 100}%`, borderRight: `2px dashed ${COLORS.textDim}` }} />
                <div style={{ position: "absolute", height: "100%", background: COLORS.green, borderRadius: 3, width: "100%" , opacity: 0.25}} />
              </div>
            </div>
          );
        })}
      </div>
      {!showAll && (
        <button onClick={() => setShowAll(true)} style={{ width: "100%", marginTop: 12, padding: "10px 0", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 13, cursor: "pointer" }}>Show all {pricingData.length} deliverables</button>
      )}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Package size={16} color={COLORS.accentLight} />
          Suggested Packages
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { name: "Starter Bundle", items: "1 Reel + 3 Stories", price: "$2,800", save: "8%" },
            { name: "Campaign Pack", items: "3 Reels + 6 Stories + 1 Post", price: "$7,500", save: "12%" },
          ].map((pkg, i) => (
            <div key={i} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{pkg.name}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}>{pkg.items}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.accentLight, fontFamily: "'Outfit', sans-serif" }}>{pkg.price}</span>
                <span style={{ fontSize: 11, color: COLORS.green, background: COLORS.greenDim, padding: "2px 8px", borderRadius: 6 }}>Save {pkg.save}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandMatching() {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["All Matches", "Fitness", "Health", "Apparel", "Tech"].map((cat, i) => (
          <button key={cat} style={{ background: i === 0 ? COLORS.accent + "20" : COLORS.border, border: i === 0 ? `1px solid ${COLORS.accent}40` : `1px solid ${COLORS.border}`, color: i === 0 ? COLORS.accentLight : COLORS.textMuted, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{cat}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {brandMatches.map(brand => (
          <div key={brand.id} style={{ background: COLORS.surface, border: `1px solid ${expandedId === brand.id ? COLORS.accent + "40" : COLORS.border}`, borderRadius: 14, overflow: "hidden", transition: "all 0.2s" }}>
            <button onClick={() => setExpandedId(expandedId === brand.id ? null : brand.id)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: brand.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: brand.color, fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>{brand.logo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{brand.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{brand.category} • {brand.budget}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: brand.fit >= 90 ? COLORS.green : brand.fit >= 80 ? COLORS.accentLight : COLORS.textMuted, fontFamily: "'Outfit', sans-serif" }}>{brand.fit}%</div>
                <div style={{ fontSize: 11, color: COLORS.textDim }}>Fit Score</div>
              </div>
              <ChevronDown size={16} color={COLORS.textDim} style={{ transform: expandedId === brand.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }} />
            </button>
            {expandedId === brand.id && (
              <div style={{ padding: "0 22px 18px", borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: COLORS.bg, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 4 }}>Audience Overlap</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{brand.fit - 5}%</div>
                  </div>
                  <div style={{ background: COLORS.bg, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 4 }}>Content Fit</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{brand.fit + 2}%</div>
                  </div>
                  <div style={{ background: COLORS.bg, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 4 }}>Est. Deal Size</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.green }}>{brand.budget.split("–")[1]}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ flex: 1, background: COLORS.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Send size={14} /> Request Intro
                  </button>
                  <button style={{ flex: 1, background: COLORS.border, color: COLORS.text, border: "none", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <FileText size={14} /> Use Pitch Template
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CreatorProfile() {
  const platforms = [
    { name: "Instagram", handle: "@jess.fits", followers: "487K", engagement: "4.8%", color: "#E1306C" },
    { name: "TikTok", handle: "@jessfits", followers: "1.2M", engagement: "6.2%", color: "#00F2EA" },
    { name: "YouTube", handle: "Jess Fitness", followers: "215K", engagement: "3.1%", color: "#FF0000" },
    { name: "Twitter/X", handle: "@jess_fits", followers: "89K", engagement: "2.4%", color: "#7A7F9A" },
  ];
  const categories = ["Fitness", "Health & Wellness", "Athleisure", "Supplements", "Sports"];
  const demographics = [
    { label: "18-24", pct: 35 }, { label: "25-34", pct: 42 }, { label: "35-44", pct: 15 }, { label: "45+", pct: 8 },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 28, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>JF</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "'Outfit', sans-serif" }}>Jess Flores</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>Fitness Creator & Former D1 Athlete</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map(c => (
              <span key={c} style={{ fontSize: 11, color: COLORS.accentLight, background: COLORS.accent + "15", border: `1px solid ${COLORS.accent}30`, borderRadius: 6, padding: "3px 10px" }}>{c}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 4 }}>Monetization Score</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.green, fontFamily: "'Outfit', sans-serif" }}>87</div>
          <div style={{ fontSize: 11, color: COLORS.green }}>Top 15% in category</div>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>Connected Platforms</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {platforms.map(p => (
          <div key={p.name} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{p.name}</span>
              <span style={{ fontSize: 11, color: COLORS.textDim, marginLeft: "auto" }}>{p.handle}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, fontFamily: "'Outfit', sans-serif" }}>{p.followers}</div>
                <div style={{ fontSize: 11, color: COLORS.textDim }}>Followers</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.green, fontFamily: "'Outfit', sans-serif" }}>{p.engagement}</div>
                <div style={{ fontSize: 11, color: COLORS.textDim }}>Engagement</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>Audience Demographics</div>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "end", height: 120 }}>
          {demographics.map(d => (
            <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{d.pct}%</span>
              <div style={{ width: "100%", background: COLORS.accent + "30", borderRadius: 6, height: `${d.pct * 2}px`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, width: "100%", height: "100%", background: `linear-gradient(to top, ${COLORS.accent}, ${COLORS.accent}60)`, borderRadius: 6 }} />
              </div>
              <span style={{ fontSize: 11, color: COLORS.textDim }}>{d.label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", padding: "12px 0 0", borderTop: `1px solid ${COLORS.border}` }}>
          <div><span style={{ fontSize: 11, color: COLORS.textDim }}>Primary: </span><span style={{ fontSize: 12, color: COLORS.text, fontWeight: 600 }}>Female 72%</span></div>
          <div><span style={{ fontSize: 11, color: COLORS.textDim }}>Top Geo: </span><span style={{ fontSize: 12, color: COLORS.text, fontWeight: 600 }}>US 68%</span></div>
          <div><span style={{ fontSize: 11, color: COLORS.textDim }}>Interest: </span><span style={{ fontSize: 12, color: COLORS.text, fontWeight: 600 }}>Fitness & Health</span></div>
        </div>
      </div>

      <div style={{ background: `linear-gradient(135deg, ${COLORS.green}10, ${COLORS.accent}10)`, border: `1px solid ${COLORS.green}25`, borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Award size={18} color={COLORS.green} />
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>Revenue Opportunity Insights</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: COLORS.textMuted }}>
          <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
            <ChevronRight size={14} color={COLORS.green} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>Your TikTok engagement rate (6.2%) puts you in the top 10% — brands pay 2–3x premium for this.</span>
          </div>
          <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
            <ChevronRight size={14} color={COLORS.green} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>Cross-platform bundles (IG + TikTok) can increase deal value by 40–60%.</span>
          </div>
          <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
            <ChevronRight size={14} color={COLORS.green} style={{ marginTop: 2, flexShrink: 0 }} />
            <span>Your audience demo is ideal for supplement, athleisure, and wellness brands — the highest-paying categories in fitness.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueDashboard() {
  const brandRevenue = [
    { brand: "Gymshark", revenue: 15000 },
    { brand: "Athletic Greens", revenue: 5000 },
    { brand: "Alo Yoga", revenue: 8400 },
    { brand: "WHOOP", revenue: 12600 },
    { brand: "Liquid IV", revenue: 7200 },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 28 }}>
        <StatCard icon={DollarSign} label="Total Revenue" value="$87,500" change={34} changeLabel="vs last quarter" accent />
        <StatCard icon={TrendingUp} label="Pipeline Value" value="$90,000" change={22} changeLabel="active deals" />
        <StatCard icon={Briefcase} label="Active Deals" value="5" change={25} changeLabel="vs last month" />
        <StatCard icon={Target} label="Avg. Deal Size" value="$18,000" change={15} changeLabel="vs benchmark" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>Revenue Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" tick={{ fill: COLORS.textDim, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: COLORS.textDim, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
              <Tooltip contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 13 }} formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke={COLORS.accent} strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>Revenue by Platform</div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={platformRevenue} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                {platformRevenue.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {platformRevenue.map(p => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                <span style={{ color: COLORS.textMuted, flex: 1 }}>{p.name}</span>
                <span style={{ color: COLORS.text, fontWeight: 600 }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>Revenue by Brand</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={brandRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
              <YAxis type="category" dataKey="brand" tick={{ fill: COLORS.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
              <Bar dataKey="revenue" fill={COLORS.accent} radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>Forecasted Revenue</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "This Month", value: "$22,100", status: "On track", color: COLORS.green },
              { label: "Next Month (Est.)", value: "$26,400", status: "Pipeline strong", color: COLORS.accent },
              { label: "Q2 Forecast", value: "$78,000", status: "+42% vs Q1", color: COLORS.green },
            ].map((f, i) => (
              <div key={i} style={{ background: COLORS.bg, borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, fontFamily: "'Outfit', sans-serif" }}>{f.value}</div>
                </div>
                <span style={{ fontSize: 11, color: f.color, background: f.color + "15", padding: "4px 10px", borderRadius: 6, fontWeight: 500 }}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NuvusMVP() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "profile", label: "Revenue Profile", icon: Users },
    { id: "pricing", label: "Pricing Engine", icon: Zap, badge: "3" },
    { id: "brands", label: "Brand Matches", icon: Target, badge: "5" },
    { id: "deals", label: "Deal Workspace", icon: Briefcase },
    { id: "revenue", label: "Revenue", icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <RevenueDashboard />;
      case "profile": return <CreatorProfile />;
      case "pricing": return <PricingEngine />;
      case "brands": return <BrandMatching />;
      case "deals": return (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
            <StatCard icon={Briefcase} label="Active Deals" value="5" />
            <StatCard icon={DollarSign} label="Pipeline Value" value="$90K" />
            <StatCard icon={Clock} label="Avg. Close Time" value="12 days" />
          </div>
          <DealPipeline onDealClick={setSelectedDeal} />
        </div>
      );
      case "revenue": return <RevenueDashboard />;
      default: return <RevenueDashboard />;
    }
  };

  const pageTitle = tabs.find(t => t.id === activeTab)?.label || "Dashboard";

  return (
    <div style={{ display: "flex", height: "100vh", background: COLORS.bg, fontFamily: "'DM Sans', -apple-system, sans-serif", color: COLORS.text, overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: 240, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", padding: "24px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 36 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: -0.5, background: `linear-gradient(135deg, ${COLORS.text}, ${COLORS.accentLight})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nuvus</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {tabs.map(tab => (
            <NavItem key={tab.id} icon={tab.icon} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} badge={tab.badge} />
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
          <NavItem icon={Settings} label="Settings" onClick={() => {}} />
          <NavItem icon={LogOut} label="Log out" onClick={() => {}} />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ height: 64, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Outfit', sans-serif" }}>{pageTitle}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotifs(!showNotifs)} style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <Bell size={17} color={COLORS.textMuted} />
                <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: COLORS.accent }} />
              </button>
              {showNotifs && (
                <div style={{ position: "absolute", top: 46, right: 0, width: 300, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 8, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                  {notifications.map((n, i) => (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 8, cursor: "pointer", display: "flex", gap: 10, alignItems: "start" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, color: COLORS.text }}>{n.text}</div>
                        <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>JF</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28, scrollbarWidth: "thin", scrollbarColor: `${COLORS.border} transparent` }}>
          {renderContent()}
        </div>
      </div>

      {/* Deal Detail Drawer */}
      {selectedDeal && <DealDetail deal={selectedDeal} onClose={() => setSelectedDeal(null)} />}
    </div>
  );
}
