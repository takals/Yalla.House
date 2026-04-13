import { useState } from "react";
import {
  Home, Target, Users, Zap, Calendar, ChevronRight, ChevronDown,
  CheckCircle2, Circle, Clock, AlertTriangle, Rocket, Globe,
  Building2, TrendingUp, Shield, Layers, MessageSquare, BarChart3,
  ArrowRight, Star, Lock, Wifi, Download, FileText, Handshake,
  Map, DollarSign, UserCheck, Mail, Database, Palette, Code,
  Search, Filter, Eye, PieChart
} from "lucide-react";

const BRAND = "#D4764E";
const BRAND_LIGHT = "#FDEEE8";
const BRAND_DARK = "#BF6840";
const DARK = "#0F1117";
const SURFACE = "#FFFFFF";
const BG = "#F5F6FA";
const BORDER = "#E5E7EB";
const TEXT = "#111827";
const TEXT_SEC = "#6B7280";
const GREEN = "#059669";
const GREEN_BG = "#DCFCE7";
const YELLOW = "#D97706";
const YELLOW_BG = "#FEF3C7";
const BLUE = "#2563EB";
const BLUE_BG = "#DBEAFE";
const RED = "#DC2626";
const RED_BG = "#FEE2E2";
const GRAY_BG = "#F3F4F6";

// ─── DATA ────────────────────────────────────────────
const PHASES = [
  { id: "sprint-zero", name: "Sprint Zero", subtitle: "2-Week Experiment", status: "active", target: "May 2026",
    goal: "10 owner sign-ups + 5 agent responses",
    tasks: [
      { text: "Apply for Reapit Foundations developer access", status: "todo" },
      { text: "Owner Dashboard + Owner Brief flow", status: "in-progress" },
      { text: "Agent proposal response system", status: "done" },
      { text: "Onboard 5–10 Redbridge agents", status: "todo" },
      { text: "Letter-drop owners create dashboards", status: "todo" },
      { text: "Agent live listing page (anonymous view)", status: "done" },
      { text: "Partner Agreement signing flow", status: "done" },
      { text: "CRM integration API (CSV + JSON)", status: "done" },
      { text: "Account-gated contact forms", status: "done" },
      { text: "Owner proposal comparison page", status: "done" },
    ]
  },
  { id: "phase-1", name: "Phase 1", subtitle: "Early Traction", status: "upcoming", target: "Jul 2026",
    goal: "50 hunters + 30 agents active",
    tasks: [
      { text: "Hunter search profiles + agent matching", status: "todo" },
      { text: "LLM email parsing for hunter inbox", status: "todo" },
      { text: "Token economics implementation", status: "todo" },
      { text: "Online viewing calendar (agent + buyer)", status: "todo" },
      { text: "Structured chat (threaded per listing)", status: "todo" },
      { text: "Pipeline view (drag-and-drop stages)", status: "todo" },
    ]
  },
  { id: "phase-2", name: "Phase 2", subtitle: "First Revenue", status: "upcoming", target: "Oct 2026",
    goal: "200 hunters + 100 agents + first revenue",
    tasks: [
      { text: "Agent SaaS tier — Pro £29/mo", status: "todo" },
      { text: "Stripe integration (company registration first)", status: "blocked" },
      { text: "Agent performance insights + reputation score", status: "todo" },
      { text: "Partner agency recruitment (Path 1 — portal listing)", status: "todo" },
      { text: "Hunter token purchasing flow", status: "todo" },
    ]
  },
  { id: "phase-3", name: "Phase 3", subtitle: "Scale", status: "upcoming", target: "Q1 2027",
    goal: "1,000 hunters + 500 agents + positive unit economics",
    tasks: [
      { text: "Agent Team tier — £79/mo (multi-agent, office analytics)", status: "todo" },
      { text: "Market intelligence reports", status: "todo" },
      { text: "Consider registering Yalla Properties Ltd (Path 2)", status: "todo" },
      { text: "Second market expansion planning", status: "todo" },
    ]
  },
];

const STRATEGY_THREADS = [
  { id: "flywheel", icon: Zap, color: BRAND, title: "Three-Sided Flywheel",
    summary: "Owners send briefs → Agents compete → Hunters get matched. Each side pulls in the other two.",
    details: [
      "Owner creates free dashboard → builds Owner Brief → selects local agents → agents compete with proposals",
      "Hunter creates search profile → agents add Yalla email to lists → LLM parses + matches → curated feed",
      "Agent gets leads from both sides → adopts dashboard → word-of-mouth → more owners",
      "Communication architecture: dedicated {ref}@mail.yalla.house emails, everything in writing on-platform",
    ]
  },
  { id: "dashboard-wedge", icon: Home, color: GREEN, title: "Dashboard Wedge (SaaS, Not Agency)",
    summary: "Yalla is a SaaS company, not an estate agent. The dashboard IS the product. No Ombudsman, no CMP, no portal fees.",
    details: [
      "Owner dashboard is free — organise property, get comparables, send structured briefs to local agents",
      "Agents pay for access to Owner Briefs (sell-side) + Hunter Briefs (buy-side)",
      "Rightmove/Zoopla listing is the agent's job — not ours",
      "Avoids: Property Ombudsman, Client Money Protection, Estate Agents Act, monthly portal subs (£1.5–3k/mo)",
    ]
  },
  { id: "agent-saas", icon: Building2, color: BLUE, title: "Agent SaaS Opportunity",
    summary: "Agents use dashboard for one Yalla listing, love it, want it for all 15 clients. Vertical CRM play.",
    details: [
      "Free tier: Yalla-assigned listings only (calendar, chat, pipeline, owner updates)",
      "Pro £29/mo: unlimited external listings, branded reports",
      "Team £79/mo: multi-agent access, office analytics",
      "Natural lock-in: viewing history, client notes, pipeline data accumulate — switching hurts",
      "Every external listing = one conversation from flat-fee conversion",
    ]
  },
  { id: "portal-listing", icon: Globe, color: YELLOW, title: "Portal Listing Strategy",
    summary: "3-phase approach to Rightmove/Zoopla without becoming a licensed agency.",
    details: [
      "Sprint Zero (Path 3): agents include portal listing in proposals — zero cost for Yalla",
      "Month 2–3 (Path 1): recruit partner agency, per-listing fee £50–100",
      "Month 6+ (Path 2): register 'Yalla Properties Ltd' if volume justifies — needs 15–20+ active/month",
      "Decision point: revisit after 3 months of Sprint data",
    ]
  },
  { id: "agent-flow", icon: Handshake, color: BRAND_DARK, title: "Agent Collaboration Model",
    summary: "No tier picker — all managed. Commission quote + service pitch. CRM is download-first, connect optional.",
    details: [
      "Agent sees anonymous listing → submits commission + service overview",
      "Owner compares proposals: Live Updates badge (CRM connected) vs Manual Updates",
      "CSV download first, CRM connection framed around owner analytics + zero extra work",
      "All contacts gated behind Yalla account — no anonymous enquiries",
      "Partner Agreement required before CRM API access",
    ]
  },
  { id: "token-economics", icon: DollarSign, color: GREEN, title: "Hunter Token Economics",
    summary: "Free tier = browse + filter. Tokens unlock actions: viewings, AI matches, priority, off-market.",
    details: [
      "Free: 5 tokens/mo | Active £4.99: 30/mo | Urgent £9.99: 100/mo | PAYG £0.50/token",
      "Request viewing (1), AI match analysis (1), push alerts (0.5), new agent batch (2)",
      "Off-market unlock (3), priority viewing (2)",
      "Agents can gift tokens → B2B revenue channel",
    ]
  },
  { id: "data-play", icon: Database, color: DARK, title: "Data Intelligence Play",
    summary: "Yalla emails passively ingest the UK property market's communication layer. Long-term moat.",
    details: [
      "Pre-portal listings, off-market properties, pricing data, agent activity patterns",
      "Market intelligence reports, agent benchmarking, valuation engine",
      "Invisible until unassailable — this is the long game",
    ]
  },
];

const WORKSTREAMS = [
  { id: "product", icon: Code, title: "Product & Engineering", color: BLUE,
    items: [
      { text: "Next.js 14 monorepo live on Vercel", status: "done" },
      { text: "Supabase auth (magic link OTP)", status: "done" },
      { text: "i18n (DE default, EN prefix) — next-intl v3", status: "done" },
      { text: "Country config system (GB + DE)", status: "done" },
      { text: "Owner dashboard shell + agent discovery (5 pages)", status: "done" },
      { text: "Agent listing page + proposal flow", status: "done" },
      { text: "CRM API (JSON + CSV export)", status: "done" },
      { text: "Partner Agreement + signing flow", status: "done" },
      { text: "Owner proposal comparison (Live Updates badge)", status: "done" },
      { text: "Contact forms gated behind accounts", status: "done" },
      { text: "Universal email templates (locale-aware)", status: "done" },
      { text: "Agent seed data (50 UK, 33 DE agencies)", status: "done" },
      { text: "Homepage owner/hunter toggle", status: "done" },
      { text: "Viewing calendar system", status: "todo" },
      { text: "Structured chat (per-listing threads)", status: "todo" },
      { text: "Pipeline drag-and-drop view", status: "todo" },
      { text: "Hunter search profiles + matching", status: "todo" },
      { text: "LLM email parsing engine", status: "todo" },
      { text: "Stripe integration", status: "blocked" },
    ]
  },
  { id: "design", icon: Palette, title: "Design & Brand", color: BRAND,
    items: [
      { text: "Brand shift: Yellow → Orange (#D4764E)", status: "done" },
      { text: "Dashfolio-inspired dark theme (public pages)", status: "done" },
      { text: "Light dashboards with orange accent", status: "done" },
      { text: "Figma workspace (admin@yalla.house)", status: "done" },
      { text: "Architecture diagrams in Figma", status: "done" },
      { text: "Dark glass header + footer", status: "in-progress" },
      { text: "Full component library in Figma", status: "todo" },
    ]
  },
  { id: "gtm", icon: Rocket, title: "Go-to-Market", color: GREEN,
    items: [
      { text: "GTM Hub structure in Notion", status: "done" },
      { text: "Agent Partnership Programme brief", status: "done" },
      { text: "Free & Low-Cost Channels brief", status: "done" },
      { text: "Sprint Zero experiment plan", status: "done" },
      { text: "Product Launch Roadmap", status: "done" },
      { text: "Homepage copy (EN + DE)", status: "done" },
      { text: "Street Team Hub", status: "done" },
      { text: "Seed 10-20 real listings (network)", status: "todo" },
      { text: "Agent outreach — Redbridge area", status: "todo" },
      { text: "Owner letter-drop campaign", status: "todo" },
    ]
  },
  { id: "ops", icon: Shield, title: "Operations & Legal", color: YELLOW,
    items: [
      { text: "Company registration (required for Stripe)", status: "blocked" },
      { text: "Domain: yalla.house purchased", status: "done" },
      { text: "Google Workspace (admin@yalla.house)", status: "done" },
      { text: "Vercel deployment pipeline", status: "done" },
      { text: "GitHub repo (takals/Yalla.House)", status: "done" },
      { text: "Notion workspace (email migration issue)", status: "blocked" },
      { text: "Terms / Privacy / GDPR compliance", status: "todo" },
      { text: "Trust & Safety policies", status: "todo" },
    ]
  },
];

const BLOCKERS = [
  { text: "Stripe: needs company registration before products/price IDs can be created", severity: "high", owner: "Tarek" },
  { text: "Notion: email switch broke auth — using Drive + Desktop until restored", severity: "medium", owner: "Tarek" },
  { text: "Reapit: need to apply for Foundations developer access on Sprint Zero Day 1", severity: "medium", owner: "Tarek" },
];

// ─── COMPONENTS ──────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    done: { bg: GREEN_BG, color: GREEN, label: "Done", Icon: CheckCircle2 },
    "in-progress": { bg: BLUE_BG, color: BLUE, label: "In Progress", Icon: Clock },
    todo: { bg: GRAY_BG, color: TEXT_SEC, label: "To Do", Icon: Circle },
    blocked: { bg: RED_BG, color: RED, label: "Blocked", Icon: AlertTriangle },
    active: { bg: GREEN_BG, color: GREEN, label: "Active", Icon: Zap },
    upcoming: { bg: GRAY_BG, color: TEXT_SEC, label: "Upcoming", Icon: Circle },
  };
  const s = map[status] || map.todo;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 100,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>
      <s.Icon size={12} /> {s.label}
    </span>
  );
}

function ProgressBar({ items }) {
  const done = items.filter(i => i.status === "done").length;
  const inProg = items.filter(i => i.status === "in-progress").length;
  const total = items.length;
  const pctDone = (done / total) * 100;
  const pctProg = (inProg / total) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#E5E7EB", overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${pctDone}%`, background: GREEN, transition: "width .3s" }} />
        <div style={{ width: `${pctProg}%`, background: BLUE, transition: "width .3s" }} />
      </div>
      <span style={{ fontSize: 12, color: TEXT_SEC, fontWeight: 600, whiteSpace: "nowrap" }}>{done}/{total}</span>
    </div>
  );
}

function PhaseCard({ phase, expanded, onToggle }) {
  return (
    <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${phase.status === "active" ? BRAND : BORDER}`,
      overflow: "hidden", boxShadow: phase.status === "active" ? `0 0 0 2px ${BRAND}33` : "none" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", cursor: "pointer" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: phase.status === "active" ? BRAND : GRAY_BG,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Rocket size={18} color={phase.status === "active" ? "#fff" : TEXT_SEC} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: TEXT }}>{phase.name}</span>
            <span style={{ fontSize: 13, color: TEXT_SEC }}>— {phase.subtitle}</span>
            <StatusBadge status={phase.status} />
          </div>
          <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>
            <Target size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            {phase.goal} · <Calendar size={12} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />{phase.target}
          </div>
        </div>
        <ProgressBar items={phase.tasks} />
        {expanded ? <ChevronDown size={18} color={TEXT_SEC} /> : <ChevronRight size={18} color={TEXT_SEC} />}
      </div>
      {expanded && (
        <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
            {phase.tasks.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                {t.status === "done" ? <CheckCircle2 size={16} color={GREEN} /> :
                 t.status === "in-progress" ? <Clock size={16} color={BLUE} /> :
                 t.status === "blocked" ? <AlertTriangle size={16} color={RED} /> :
                 <Circle size={16} color="#D1D5DB" />}
                <span style={{ fontSize: 13, color: t.status === "done" ? TEXT_SEC : TEXT,
                  textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StrategyCard({ thread, expanded, onToggle }) {
  const Icon = thread.icon;
  return (
    <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 20px", cursor: "pointer" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${thread.color}15`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          <Icon size={18} color={thread.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: TEXT }}>{thread.title}</div>
          <div style={{ fontSize: 13, color: TEXT_SEC, marginTop: 4, lineHeight: 1.5 }}>{thread.summary}</div>
        </div>
        {expanded ? <ChevronDown size={18} color={TEXT_SEC} style={{ flexShrink: 0, marginTop: 4 }} /> : <ChevronRight size={18} color={TEXT_SEC} style={{ flexShrink: 0, marginTop: 4 }} />}
      </div>
      {expanded && (
        <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {thread.details.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <ArrowRight size={14} color={thread.color} style={{ flexShrink: 0, marginTop: 3 }} />
                <span style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkstreamCard({ ws, expanded, onToggle }) {
  const Icon = ws.icon;
  return (
    <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", cursor: "pointer" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${ws.color}15`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={18} color={ws.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: TEXT }}>{ws.title}</div>
        </div>
        <ProgressBar items={ws.items} />
        {expanded ? <ChevronDown size={18} color={TEXT_SEC} /> : <ChevronRight size={18} color={TEXT_SEC} />}
      </div>
      {expanded && (
        <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "grid", gap: 4, marginTop: 12 }}>
            {ws.items.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                {item.status === "done" ? <CheckCircle2 size={15} color={GREEN} /> :
                 item.status === "in-progress" ? <Clock size={15} color={BLUE} /> :
                 item.status === "blocked" ? <AlertTriangle size={15} color={RED} /> :
                 <Circle size={15} color="#D1D5DB" />}
                <span style={{ fontSize: 13, color: item.status === "done" ? TEXT_SEC : TEXT,
                  textDecoration: item.status === "done" ? "line-through" : "none" }}>{item.text}</span>
                {item.status === "blocked" && <StatusBadge status="blocked" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STATS ───────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "16px 20px", flex: "1 1 0" }}>
      <div style={{ fontSize: 12, color: TEXT_SEC, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || TEXT, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ─── TABS ────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", Icon: Home },
  { id: "roadmap", label: "Roadmap", Icon: Map },
  { id: "strategy", label: "Strategy", Icon: Target },
  { id: "workstreams", label: "Workstreams", Icon: Layers },
  { id: "blockers", label: "Blockers", Icon: AlertTriangle },
];

// ─── MAIN ────────────────────────────────────────────
export default function CommandCentre() {
  const [tab, setTab] = useState("overview");
  const [expandedPhases, setExpandedPhases] = useState({ "sprint-zero": true });
  const [expandedStrategies, setExpandedStrategies] = useState({});
  const [expandedWorkstreams, setExpandedWorkstreams] = useState({});

  const togglePhase = (id) => setExpandedPhases(p => ({ ...p, [id]: !p[id] }));
  const toggleStrategy = (id) => setExpandedStrategies(p => ({ ...p, [id]: !p[id] }));
  const toggleWorkstream = (id) => setExpandedWorkstreams(p => ({ ...p, [id]: !p[id] }));

  const allTasks = WORKSTREAMS.flatMap(w => w.items);
  const totalDone = allTasks.filter(t => t.status === "done").length;
  const totalInProg = allTasks.filter(t => t.status === "in-progress").length;
  const totalBlocked = allTasks.filter(t => t.status === "blocked").length;
  const totalTasks = allTasks.length;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: DARK, padding: "24px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: BRAND, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Home size={16} color="#fff" />
              </div>
              <span style={{ color: "#fff", fontSize: 20, fontWeight: 800, letterSpacing: "-.02em" }}>Yalla.House</span>
              <span style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>Command Centre</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "rgba(255,255,255,.5)", fontSize: 12 }}>Last updated: Apr 12, 2026</span>
            <StatusBadge status="active" />
          </div>
        </div>
        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", border: "none", cursor: "pointer",
                background: tab === t.id ? SURFACE : "transparent", color: tab === t.id ? TEXT : "rgba(255,255,255,.6)",
                borderRadius: "8px 8px 0 0", fontSize: 13, fontWeight: 600, transition: "all .15s" }}>
              <t.Icon size={14} /> {t.label}
              {t.id === "blockers" && totalBlocked > 0 && (
                <span style={{ background: RED, color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 100 }}>{totalBlocked}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 32px", maxWidth: 1000, margin: "0 auto" }}>
        {/* OVERVIEW */}
        {tab === "overview" && (
          <div style={{ display: "grid", gap: 20 }}>
            {/* Stats Row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatCard label="Total Tasks" value={totalTasks} sub="across all workstreams" />
              <StatCard label="Completed" value={totalDone} sub={`${Math.round((totalDone/totalTasks)*100)}% done`} color={GREEN} />
              <StatCard label="In Progress" value={totalInProg} sub="currently active" color={BLUE} />
              <StatCard label="Blocked" value={totalBlocked} sub="needs attention" color={RED} />
            </div>

            {/* Current Phase */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Current Phase</div>
              <PhaseCard phase={PHASES[0]} expanded={true} onToggle={() => {}} />
            </div>

            {/* Key Strategy Threads */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Key Strategy Threads</div>
              <div style={{ display: "grid", gap: 8 }}>
                {STRATEGY_THREADS.slice(0, 3).map(t => (
                  <StrategyCard key={t.id} thread={t} expanded={expandedStrategies[t.id]} onToggle={() => toggleStrategy(t.id)} />
                ))}
              </div>
            </div>

            {/* Blockers */}
            {BLOCKERS.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: RED, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>
                  <AlertTriangle size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />Blockers
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {BLOCKERS.map((b, i) => (
                    <div key={i} style={{ background: SURFACE, borderRadius: 10, border: `1px solid ${b.severity === "high" ? RED : YELLOW}33`,
                      padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderLeft: `3px solid ${b.severity === "high" ? RED : YELLOW}` }}>
                      <AlertTriangle size={16} color={b.severity === "high" ? RED : YELLOW} />
                      <span style={{ fontSize: 13, color: TEXT, flex: 1 }}>{b.text}</span>
                      <span style={{ fontSize: 11, color: TEXT_SEC, fontWeight: 600 }}>{b.owner}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Model */}
            <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_SEC, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>Revenue Streams</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ background: BRAND_LIGHT, borderRadius: 10, padding: 16, textAlign: "center" }}>
                  <DollarSign size={20} color={BRAND} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>Agent SaaS</div>
                  <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>£29–79/mo per agent</div>
                </div>
                <div style={{ background: GREEN_BG, borderRadius: 10, padding: 16, textAlign: "center" }}>
                  <Users size={20} color={GREEN} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>Hunter Tokens</div>
                  <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>£4.99–9.99/mo or PAYG</div>
                </div>
                <div style={{ background: BLUE_BG, borderRadius: 10, padding: 16, textAlign: "center" }}>
                  <BarChart3 size={20} color={BLUE} style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>Data Intelligence</div>
                  <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>Market reports (Phase 3+)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROADMAP */}
        {tab === "roadmap" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 4 }}>Click any phase to expand tasks and progress.</div>
            {PHASES.map(p => (
              <PhaseCard key={p.id} phase={p} expanded={!!expandedPhases[p.id]} onToggle={() => togglePhase(p.id)} />
            ))}
          </div>
        )}

        {/* STRATEGY */}
        {tab === "strategy" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 4 }}>
              All strategic threads driving Yalla.House. Click to expand details.
            </div>
            {STRATEGY_THREADS.map(t => (
              <StrategyCard key={t.id} thread={t} expanded={!!expandedStrategies[t.id]} onToggle={() => toggleStrategy(t.id)} />
            ))}
          </div>
        )}

        {/* WORKSTREAMS */}
        {tab === "workstreams" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 4 }}>
              All active workstreams with task-level tracking.
            </div>
            {WORKSTREAMS.map(ws => (
              <WorkstreamCard key={ws.id} ws={ws} expanded={!!expandedWorkstreams[ws.id]} onToggle={() => toggleWorkstream(ws.id)} />
            ))}
          </div>
        )}

        {/* BLOCKERS */}
        {tab === "blockers" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 4 }}>
              Items blocking progress that need resolution.
            </div>
            {BLOCKERS.map((b, i) => (
              <div key={i} style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${b.severity === "high" ? RED : YELLOW}33`,
                padding: "20px 24px", borderLeft: `4px solid ${b.severity === "high" ? RED : YELLOW}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={18} color={b.severity === "high" ? RED : YELLOW} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: b.severity === "high" ? RED : YELLOW }}>
                    {b.severity} severity
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: TEXT_SEC }}>Owner: {b.owner}</span>
                </div>
                <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>{b.text}</div>
              </div>
            ))}
            {BLOCKERS.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: GREEN }}>
                <CheckCircle2 size={32} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 600 }}>No active blockers</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
