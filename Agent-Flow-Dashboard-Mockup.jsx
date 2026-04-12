import { useState } from "react";
import {
  Home, Search, MapPin, Shield, Star, Users, Send, CheckCircle2, ChevronRight,
  ArrowRight, FileText, Building2, TreePine, HardHat, Mail, Eye, MousePointerClick,
  Clock, Globe, Phone, ExternalLink, Sparkles, ArrowLeft, Filter, SlidersHorizontal,
  CircleDot, Check, X, Inbox, Bell, User, Settings, LogOut, BarChart3, Briefcase,
  MessageSquare, Heart, Zap, TrendingUp, AlertCircle
} from "lucide-react";

/* ── DESIGN TOKENS (Dashboard / Light) ── */
const BRAND = "#D4764E";
const BRAND_HOVER = "#C06842";
const BRAND_LIGHT = "rgba(212,118,78,0.08)";
const BRAND_LIGHT2 = "rgba(212,118,78,0.14)";
const BG = "#EDEEF2";
const BG_SOFT = "#E6E8EE";
const SURFACE = "#FFFFFF";
const BORDER = "#D8DBE5";
const BORDER_LIGHT = "#E2E4EB";
const TEXT_PRIMARY = "#000000";
const TEXT_SECONDARY = "#656565";
const TEXT_MUTED = "#999999";
const SIDEBAR_DARK = "#0F1117";
const GREEN = "#059669";
const GREEN_BG = "#DCFCE7";
const GREEN_TEXT = "#166534";
const BLUE_BG = "#DBEAFE";
const BLUE_TEXT = "#1E40AF";
const YELLOW_BG = "#FFF7E0";
const YELLOW_TEXT = "#7A5F00";
const RED_BG = "#FEE2E2";
const RED_TEXT = "#991B1B";

/* ── SAMPLE DATA ── */
const AGENTS = [
  { id: 1, name: "Foxtons", agent: "Sarah Mitchell", verified: true, focus: "Sales & Lettings", areas: ["Hackney", "Islington", "Shoreditch"], types: ["Residential", "New Build"], rating: 4.3, reviews: 187, responseTime: "< 2 hours", fee: "1.2%", match: 96 },
  { id: 2, name: "Savills", agent: "James Cooper", verified: true, focus: "Sales", areas: ["City of London", "Hackney"], types: ["Residential", "Commercial"], rating: 4.8, reviews: 312, responseTime: "< 4 hours", fee: "1.5%", match: 91 },
  { id: 3, name: "Dexters", agent: "Priya Sharma", verified: true, focus: "Sales & Lettings", areas: ["Dalston", "Stoke Newington"], types: ["Residential"], rating: 4.6, reviews: 94, responseTime: "< 1 hour", fee: "1.0%", match: 88 },
  { id: 4, name: "Marsh & Parsons", agent: null, verified: false, focus: "Sales & Lettings", areas: ["Hackney", "Bethnal Green", "Mile End"], types: ["Residential", "Commercial"], rating: 4.1, reviews: 62, responseTime: "< 6 hours", fee: "1.3%", match: 82 },
  { id: 5, name: "Chestertons", agent: "David Kim", verified: true, focus: "Sales", areas: ["Shoreditch", "Hoxton", "Old Street"], types: ["Residential", "New Build"], rating: 4.5, reviews: 156, responseTime: "< 3 hours", fee: "1.4%", match: 79 },
  { id: 6, name: "Hunters", agent: null, verified: false, focus: "Lettings", areas: ["Hackney Wick", "Homerton"], types: ["Residential"], rating: 4.0, reviews: 41, responseTime: "< 8 hours", fee: "0.9%", match: 73 },
];

const AREAS = [
  { prefix: "E", label: "East London", count: 47 },
  { prefix: "N", label: "North London", count: 38 },
  { prefix: "SE", label: "South East", count: 52 },
  { prefix: "SW", label: "South West", count: 61 },
  { prefix: "W", label: "West London", count: 44 },
  { prefix: "NW", label: "North West", count: 33 },
  { prefix: "EC/WC", label: "Central", count: 29 },
  { prefix: "All", label: "All Areas", count: 304 },
];

/* ── SCREENS ── */
const SCREENS = {
  FLOW: "flow",           // The journey overview
  FIND_AGENTS: "find",    // Search & browse agents
  AGENT_DETAIL: "detail", // Single agent profile
  SEND_BRIEF: "send",     // Send brief to agents
  EMAIL_PREVIEW: "email", // What the agent receives
  TRACKING: "tracking",   // Track your sent briefs
};

export default function AgentFlowDashboard() {
  const [screen, setScreen] = useState(SCREENS.FLOW);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [activeArea, setActiveArea] = useState(null);
  const [briefSent, setBriefSent] = useState(false);

  const toggleAgent = (id) => {
    setSelectedAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  /* ── SIDEBAR ── */
  const Sidebar = () => (
    <div style={{
      width: 240, background: SIDEBAR_DARK, height: "100vh", position: "fixed",
      left: 0, top: 0, padding: "20px 0", display: "flex", flexDirection: "column",
      zIndex: 100,
    }}>
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
          <span style={{ color: BRAND }}>Yalla</span><span style={{ color: "#fff" }}>.House</span>
        </span>
      </div>

      <div style={{ padding: "16px 12px", flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 8 }}>Owner Dashboard</p>
        {[
          { icon: Home, label: "Overview", active: false },
          { icon: FileText, label: "My Listings", active: false },
          { icon: Users, label: "Find Agents", active: true, badge: "New" },
          { icon: Send, label: "Sent Briefs", active: false },
          { icon: Inbox, label: "Proposals", active: false, badge: "3" },
          { icon: BarChart3, label: "Analytics", active: false },
          { icon: Settings, label: "Settings", active: false },
        ].map(item => (
          <div key={item.label} onClick={() => {
            if (item.label === "Find Agents") setScreen(SCREENS.FLOW);
            if (item.label === "Sent Briefs") setScreen(SCREENS.TRACKING);
          }} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            borderRadius: 8, marginBottom: 2, cursor: "pointer",
            background: item.active ? BRAND_LIGHT2 : "transparent",
            color: item.active ? BRAND : "rgba(255,255,255,0.55)",
            transition: "all 0.15s",
          }}>
            <item.icon size={16} />
            <span style={{ fontSize: 14, fontWeight: item.active ? 600 : 500, flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100,
                background: item.badge === "New" ? BRAND : "rgba(255,255,255,0.12)",
                color: item.badge === "New" ? "#fff" : "rgba(255,255,255,0.7)",
              }}>{item.badge}</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: BRAND_LIGHT2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} style={{ color: BRAND }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>Tarek</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>Owner</p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── HEADER ── */
  const Header = ({ title, subtitle, backTo, actions }) => (
    <div style={{
      padding: "24px 32px", background: SURFACE, borderBottom: `1px solid ${BORDER_LIGHT}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {backTo && (
          <button onClick={() => setScreen(backTo)} style={{
            width: 36, height: 36, borderRadius: 8, border: `1px solid ${BORDER}`,
            background: "transparent", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <ArrowLeft size={16} style={{ color: TEXT_SECONDARY }} />
          </button>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: TEXT_PRIMARY }}>{title}</h1>
          {subtitle && <p style={{ margin: "2px 0 0", fontSize: 14, color: TEXT_SECONDARY }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );

  /* ── BADGE ── */
  const Badge = ({ text, color = "green" }) => {
    const colors = { green: [GREEN_BG, GREEN_TEXT], blue: [BLUE_BG, BLUE_TEXT], yellow: [YELLOW_BG, YELLOW_TEXT], red: [RED_BG, RED_TEXT], gray: [BG_SOFT, TEXT_SECONDARY] };
    const [bg, fg] = colors[color] || colors.green;
    return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: bg, color: fg, textTransform: "uppercase", letterSpacing: "0.04em" }}>{text}</span>;
  };

  /* ══════════════════════════════════════════════════════════════════════════════
     SCREEN 1: JOURNEY FLOW — "Your path to finding an agent"
     ══════════════════════════════════════════════════════════════════════════════ */
  const FlowScreen = () => {
    const steps = [
      {
        num: 1, title: "Create Your Listing", desc: "Add your property details — type, location, price, photos. This becomes your Owner Brief.",
        icon: Home, status: "complete", action: "View Listing",
      },
      {
        num: 2, title: "Find Local Agents", desc: "Search agents by postcode or browse by area. See ratings, response times, and coverage.",
        icon: Search, status: "current", action: "Find Agents",
      },
      {
        num: 3, title: "Send Your Brief", desc: "Select agents and send your brief in one click. They receive a professional email with your property summary.",
        icon: Send, status: "upcoming", action: null,
      },
      {
        num: 4, title: "Compare Proposals", desc: "Agents respond with their fee, strategy, and timeline. Compare side by side and pick the best fit.",
        icon: BarChart3, status: "upcoming", action: null,
      },
    ];

    return (
      <div style={{ padding: 32 }}>
        {/* Progress Banner */}
        <div style={{
          background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`,
          padding: 32, marginBottom: 32,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={22} style={{ color: BRAND }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Your Agent Journey</h2>
              <p style={{ margin: 0, fontSize: 14, color: TEXT_SECONDARY }}>List your property, find agents, get competing proposals</p>
            </div>
          </div>

          {/* Step Flow */}
          <div style={{ display: "flex", gap: 0, position: "relative" }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div style={{
                    position: "absolute", top: 22, left: "50%", width: "100%", height: 2,
                    background: step.status === "complete" ? GREEN : BORDER_LIGHT, zIndex: 0,
                  }} />
                )}

                {/* Circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: step.status === "complete" ? GREEN_BG : step.status === "current" ? BRAND : BG_SOFT,
                  border: `2px solid ${step.status === "complete" ? GREEN : step.status === "current" ? BRAND : BORDER}`,
                  zIndex: 1, position: "relative",
                }}>
                  {step.status === "complete" ? (
                    <Check size={20} style={{ color: GREEN }} />
                  ) : (
                    <step.icon size={20} style={{ color: step.status === "current" ? "#fff" : TEXT_MUTED }} />
                  )}
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: step.status === "upcoming" ? TEXT_MUTED : TEXT_PRIMARY, marginTop: 12, textAlign: "center" }}>
                  {step.title}
                </p>
                <p style={{ fontSize: 12, color: TEXT_SECONDARY, textAlign: "center", maxWidth: 180, lineHeight: 1.5, margin: "4px 0 0" }}>
                  {step.desc}
                </p>

                {step.action && (
                  <button onClick={() => step.num === 2 && setScreen(SCREENS.FIND_AGENTS)} style={{
                    marginTop: 12, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: step.status === "current" ? BRAND : "transparent",
                    color: step.status === "current" ? "#fff" : BRAND,
                    border: step.status === "current" ? "none" : `1px solid ${BRAND}`,
                    cursor: "pointer",
                  }}>
                    {step.action} <ArrowRight size={14} style={{ marginLeft: 4, verticalAlign: "middle" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { icon: Search, title: "Find Agents", desc: "Search by postcode or browse areas", action: () => setScreen(SCREENS.FIND_AGENTS), primary: true },
            { icon: Mail, title: "Preview Email", desc: "See what agents receive when you send", action: () => setScreen(SCREENS.EMAIL_PREVIEW), primary: false },
            { icon: Eye, title: "Track Briefs", desc: "See who opened, clicked & responded", action: () => setScreen(SCREENS.TRACKING), primary: false },
          ].map(card => (
            <div key={card.title}
              onClick={card.action}
              onMouseEnter={() => setHoveredCard(card.title)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: SURFACE, borderRadius: 14, border: `1px solid ${hoveredCard === card.title ? BRAND : BORDER_LIGHT}`,
                padding: 24, cursor: "pointer",
                transition: "all 0.2s", transform: hoveredCard === card.title ? "translateY(-2px)" : "none",
                boxShadow: hoveredCard === card.title ? "0 6px 20px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                background: card.primary ? BRAND : BRAND_LIGHT,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <card.icon size={22} style={{ color: card.primary ? "#fff" : BRAND }} />
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{card.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: TEXT_SECONDARY }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════════════════════════
     SCREEN 2: FIND AGENTS — Search + Browse + Agent cards
     ══════════════════════════════════════════════════════════════════════════════ */
  const FindAgentsScreen = () => (
    <div style={{ padding: 32 }}>
      {/* Search + Filter Bar */}
      <div style={{
        background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER_LIGHT}`,
        padding: 20, marginBottom: 24, display: "flex", gap: 12, alignItems: "center",
      }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED }} />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter postcode (e.g. E8 1HN, SW1A, M1)"
            style={{
              width: "100%", padding: "12px 12px 12px 42px", borderRadius: 10,
              border: `1px solid ${BORDER}`, fontSize: 14, color: TEXT_PRIMARY,
              background: BG, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <button style={{
          padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: BRAND, color: "#fff", border: "none", cursor: "pointer",
        }}>Search</button>
        <button style={{
          padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: BG, color: TEXT_SECONDARY, border: `1px solid ${BORDER}`, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {/* Area Chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {AREAS.map(area => (
          <button key={area.prefix} onClick={() => setActiveArea(activeArea === area.prefix ? null : area.prefix)} style={{
            padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600,
            background: activeArea === area.prefix ? BRAND : SURFACE,
            color: activeArea === area.prefix ? "#fff" : TEXT_SECONDARY,
            border: `1px solid ${activeArea === area.prefix ? BRAND : BORDER}`,
            cursor: "pointer", transition: "all 0.15s",
          }}>
            {area.label} <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{area.count}</span>
          </button>
        ))}
      </div>

      {/* Results header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 14, color: TEXT_SECONDARY }}>
          <strong style={{ color: TEXT_PRIMARY }}>{AGENTS.length} agents</strong> found {activeArea ? `in ${activeArea}` : "near E8"}
        </p>
        {selectedAgents.length > 0 && (
          <button onClick={() => setScreen(SCREENS.SEND_BRIEF)} style={{
            padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: BRAND, color: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Send size={16} /> Send Brief to {selectedAgents.length} Agent{selectedAgents.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Agent Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {AGENTS.map(agent => {
          const isSelected = selectedAgents.includes(agent.id);
          return (
            <div key={agent.id}
              onMouseEnter={() => setHoveredCard(agent.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: SURFACE, borderRadius: 14, overflow: "hidden",
                border: `1px solid ${isSelected ? BRAND : hoveredCard === agent.id ? BORDER : BORDER_LIGHT}`,
                transition: "all 0.2s",
                transform: hoveredCard === agent.id ? "translateY(-2px)" : "none",
                boxShadow: hoveredCard === agent.id ? "0 6px 20px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {/* Header */}
              <div style={{ padding: "18px 20px", borderBottom: `1px solid ${BORDER_LIGHT}`, display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{agent.name}</h3>
                    {agent.verified && (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 100, background: BRAND_LIGHT }}>
                        <Shield size={12} style={{ color: BRAND }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: BRAND }}>VERIFIED</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {agent.agent && <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>{agent.agent}</span>}
                    <span style={{ fontSize: 12, color: TEXT_MUTED }}>{agent.focus}</span>
                  </div>
                </div>

                {/* Match Score */}
                <div style={{ textAlign: "center", minWidth: 52 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: agent.match >= 90 ? GREEN : agent.match >= 80 ? BRAND : TEXT_SECONDARY }}>
                    {agent.match}%
                  </div>
                  <div style={{ fontSize: 10, color: TEXT_MUTED, fontWeight: 600 }}>MATCH</div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "16px 20px" }}>
                {/* Rating + Response */}
                <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill={i < Math.floor(agent.rating) ? "#F59E0B" : "none"} stroke={i < Math.floor(agent.rating) ? "#F59E0B" : TEXT_MUTED} />
                    ))}
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, marginLeft: 4 }}>{agent.rating}</span>
                    <span style={{ fontSize: 12, color: TEXT_MUTED }}>({agent.reviews})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={13} style={{ color: GREEN }} />
                    <span style={{ fontSize: 12, color: TEXT_SECONDARY }}>{agent.responseTime}</span>
                  </div>
                </div>

                {/* Coverage */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                  {agent.areas.map(area => (
                    <span key={area} style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 500,
                      background: BG_SOFT, color: TEXT_SECONDARY,
                    }}>
                      <MapPin size={11} style={{ color: BRAND }} /> {area}
                    </span>
                  ))}
                </div>

                {/* Types */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {agent.types.map(type => (
                    <span key={type} style={{
                      padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                      background: BG, color: TEXT_SECONDARY,
                    }}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${BORDER_LIGHT}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={() => { setSelectedAgent(agent); setScreen(SCREENS.AGENT_DETAIL); }} style={{
                  fontSize: 13, fontWeight: 600, color: BRAND, background: "none", border: "none", cursor: "pointer", padding: 0,
                }}>
                  View Profile <ChevronRight size={14} style={{ verticalAlign: "middle" }} />
                </button>
                <button onClick={() => toggleAgent(agent.id)} style={{
                  padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: isSelected ? BRAND : "transparent",
                  color: isSelected ? "#fff" : BRAND,
                  border: `1px solid ${isSelected ? BRAND : BRAND}`,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                }}>
                  {isSelected ? <><Check size={14} /> Selected</> : <><CircleDot size={14} /> Select</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════════
     SCREEN 3: SEND BRIEF — Confirm & preview before sending
     ══════════════════════════════════════════════════════════════════════════════ */
  const SendBriefScreen = () => {
    const selected = AGENTS.filter(a => selectedAgents.includes(a.id));

    return (
      <div style={{ padding: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
          {/* Left: Your brief */}
          <div>
            <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER_LIGHT}`, padding: 24, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Your Property Brief</h3>
              <div style={{ background: BG, borderRadius: 10, padding: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  {[
                    ["Property", "3-bed Victorian Terrace"],
                    ["Location", "E8 1HN, Hackney"],
                    ["Asking Price", "£650,000"],
                    ["Type", "For Sale"],
                    ["Bedrooms", "3"],
                    ["Status", "Ready to list"],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: "6px 0", fontSize: 14, color: TEXT_SECONDARY, width: 120 }}>{label}</td>
                      <td style={{ padding: "6px 0", fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>{value}</td>
                    </tr>
                  ))}
                </table>
              </div>
            </div>

            {/* What happens next */}
            <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER_LIGHT}`, padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>What happens next?</h3>
              {[
                { icon: Mail, text: "Each agent receives a professional email with your property summary" },
                { icon: Eye, text: "You'll see when they open, click, and respond" },
                { icon: FileText, text: "Agents submit proposals with their fee, strategy, and timeline" },
                { icon: BarChart3, text: "Compare proposals side by side in your dashboard" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "start", marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon size={16} style={{ color: BRAND }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: TEXT_SECONDARY, lineHeight: 1.5 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Selected agents + Send */}
          <div>
            <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER_LIGHT}`, padding: 24, position: "sticky", top: 100 }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Sending to {selected.length} Agent{selected.length !== 1 ? "s" : ""}</h3>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: TEXT_SECONDARY }}>They'll each receive your brief by email</p>

              {selected.map(agent => (
                <div key={agent.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={16} style={{ color: BRAND }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{agent.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>{agent.areas[0]}</p>
                  </div>
                  <button onClick={() => toggleAgent(agent.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <X size={16} style={{ color: TEXT_MUTED }} />
                  </button>
                </div>
              ))}

              <button onClick={() => setScreen(SCREENS.FIND_AGENTS)} style={{
                width: "100%", padding: 10, marginTop: 12, borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: "transparent", color: BRAND, border: `1px dashed ${BRAND}`,
                cursor: "pointer",
              }}>
                + Add More Agents
              </button>

              <div style={{ marginTop: 20, padding: "12px 0 0", borderTop: `1px solid ${BORDER_LIGHT}`, display: "flex", gap: 8 }}>
                <button onClick={() => setScreen(SCREENS.EMAIL_PREVIEW)} style={{
                  flex: 1, padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: BG, color: TEXT_SECONDARY, border: "none", cursor: "pointer",
                }}>
                  <Eye size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Preview Email
                </button>
                <button onClick={() => { setBriefSent(true); setScreen(SCREENS.TRACKING); }} style={{
                  flex: 1, padding: "12px 0", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: BRAND, color: "#fff", border: "none", cursor: "pointer",
                }}>
                  <Send size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Send Brief
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════════════════════════
     SCREEN 4: EMAIL PREVIEW — What the agent receives
     ══════════════════════════════════════════════════════════════════════════════ */
  const EmailPreviewScreen = () => (
    <div style={{ padding: 32 }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Email chrome */}
        <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER_LIGHT}`, overflow: "hidden" }}>
          {/* Email header bar */}
          <div style={{ padding: "14px 20px", background: BG, borderBottom: `1px solid ${BORDER_LIGHT}`, display: "flex", alignItems: "center", gap: 12 }}>
            <Mail size={18} style={{ color: TEXT_SECONDARY }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }}>Subject: New instruction opportunity — House in Hackney</p>
              <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>From: Yalla.House &lt;noreply@yalla.house&gt;</p>
            </div>
          </div>

          {/* Simulated email body */}
          <div style={{ background: BG, padding: 32 }}>
            <div style={{ maxWidth: 560, margin: "0 auto", background: SURFACE, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              {/* Brand header */}
              <div style={{ background: BRAND, padding: "20px 32px" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: SIDEBAR_DARK, letterSpacing: "-0.02em" }}>Yalla.House</span>
              </div>

              {/* Content */}
              <div style={{ padding: 32 }}>
                <p style={{ margin: "0 0 8px", fontSize: 16, color: SIDEBAR_DARK }}>Hi Sarah,</p>
                <p style={{ margin: "0 0 24px", fontSize: 15, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                  A property owner in <strong style={{ color: SIDEBAR_DARK }}>Hackney (E8 1HN)</strong> is looking for competing proposals from local agents.
                </p>

                {/* Property card */}
                <div style={{ background: BG, borderRadius: 10, padding: 20, marginBottom: 24 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    {[
                      ["Area", "Hackney, E8 1HN"],
                      ["Type", "House"],
                      ["Asking Price", "£650,000"],
                      ["Bedrooms", "3"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ padding: "5px 0", color: TEXT_SECONDARY, fontSize: 14 }}>{label}</td>
                        <td style={{ padding: "5px 0 5px 16px", fontSize: 14, fontWeight: 600 }}>{value}</td>
                      </tr>
                    ))}
                  </table>
                </div>

                <p style={{ margin: "0 0 16px", fontSize: 15, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                  <strong style={{ color: SIDEBAR_DARK }}>Yalla.House</strong> connects motivated sellers with local agents — no upfront fees, no lock-in. The owner reviews proposals side by side and picks the best fit.
                </p>

                {/* CTA Button */}
                <div style={{ marginTop: 24 }}>
                  <span style={{
                    display: "inline-block", padding: "12px 24px", borderRadius: 10,
                    background: BRAND, color: "#fff", fontWeight: 700, fontSize: 14,
                  }}>
                    View Brief & Submit Your Proposal
                  </span>
                </div>

                <p style={{ marginTop: 24, fontSize: 13, color: TEXT_MUTED }}>
                  You're receiving this because you're listed as an estate agent covering E8. If this isn't relevant, simply ignore this email.
                </p>
              </div>

              {/* Footer */}
              <div style={{ padding: "20px 32px", background: BG, borderTop: `1px solid ${BORDER_LIGHT}` }}>
                <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>Yalla.House — Sell your property. Keep every pound.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info below */}
        <div style={{ marginTop: 20, padding: 20, background: BLUE_BG, borderRadius: 12, display: "flex", gap: 12, alignItems: "start" }}>
          <AlertCircle size={20} style={{ color: BLUE_TEXT, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: BLUE_TEXT }}>Your contact details are not shared</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: BLUE_TEXT, opacity: 0.8 }}>
              Agents only see the property summary. Your name, email, and phone stay private until you choose to connect with an agent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════════
     SCREEN 5: TRACKING — Sent briefs, delivery, engagement
     ══════════════════════════════════════════════════════════════════════════════ */
  const TrackingScreen = () => {
    const trackData = [
      { agent: "Foxtons", contact: "Sarah Mitchell", sent: "2 min ago", delivered: true, opened: true, clicked: true, responded: true, fee: "1.2%", status: "proposal" },
      { agent: "Savills", contact: "James Cooper", sent: "2 min ago", delivered: true, opened: true, clicked: false, responded: false, fee: null, status: "opened" },
      { agent: "Dexters", contact: "Priya Sharma", sent: "2 min ago", delivered: true, opened: false, clicked: false, responded: false, fee: null, status: "delivered" },
    ];

    return (
      <div style={{ padding: 32 }}>
        {briefSent && (
          <div style={{ background: GREEN_BG, borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <CheckCircle2 size={20} style={{ color: GREEN }} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: GREEN_TEXT }}>Brief sent successfully!</p>
              <p style={{ margin: 0, fontSize: 13, color: GREEN_TEXT, opacity: 0.8 }}>Your property brief has been sent to {selectedAgents.length || 3} agents. You'll see updates here as they engage.</p>
            </div>
          </div>
        )}

        <div style={{ background: SURFACE, borderRadius: 14, border: `1px solid ${BORDER_LIGHT}`, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 100px", gap: 0, padding: "14px 20px", background: BG, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
            {["Agent", "Sent", "Delivered", "Opened", "Clicked", "Responded", "Status"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {trackData.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 100px",
              gap: 0, padding: "16px 20px", borderBottom: i < trackData.length - 1 ? `1px solid ${BORDER_LIGHT}` : "none",
              alignItems: "center",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{row.agent}</p>
                <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>{row.contact}</p>
              </div>
              <span style={{ fontSize: 13, color: TEXT_SECONDARY }}>{row.sent}</span>
              {[row.delivered, row.opened, row.clicked, row.responded].map((val, j) => (
                <div key={j}>
                  {val ? <CheckCircle2 size={18} style={{ color: GREEN }} /> : <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${BORDER}` }} />}
                </div>
              ))}
              <Badge text={row.status} color={row.status === "proposal" ? "green" : row.status === "opened" ? "blue" : "gray"} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── SCREEN MAP ── */
  const screenConfig = {
    [SCREENS.FLOW]: { title: "Find Agents", subtitle: "Send your brief to local agents and compare proposals", component: FlowScreen },
    [SCREENS.FIND_AGENTS]: { title: "Search Agents", subtitle: `${AGENTS.length} agents available · Select and send your brief`, component: FindAgentsScreen, backTo: SCREENS.FLOW, actions: selectedAgents.length > 0 && (
      <button onClick={() => setScreen(SCREENS.SEND_BRIEF)} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, background: BRAND, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <Send size={16} /> Send Brief ({selectedAgents.length})
      </button>
    ) },
    [SCREENS.SEND_BRIEF]: { title: "Send Brief", subtitle: "Review and confirm before sending", component: SendBriefScreen, backTo: SCREENS.FIND_AGENTS },
    [SCREENS.EMAIL_PREVIEW]: { title: "Email Preview", subtitle: "This is what agents see when you send your brief", component: EmailPreviewScreen, backTo: SCREENS.FLOW },
    [SCREENS.TRACKING]: { title: "Sent Briefs", subtitle: "Track delivery, opens, and responses", component: TrackingScreen, backTo: SCREENS.FLOW },
  };

  const current = screenConfig[screen];
  const ScreenComponent = current.component;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", background: BG, minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ marginLeft: 240 }}>
        <Header title={current.title} subtitle={current.subtitle} backTo={current.backTo} actions={current.actions} />
        <ScreenComponent />
      </div>
    </div>
  );
}