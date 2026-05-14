import { useState, useEffect, useRef, useCallback } from "react";

// ─── Brand tokens ───────────────────────────────────────────
const COLORS = {
  brand: "#D4764E",
  brandHover: "#BF6840",
  brandDeep: "#A85A36",
  brandLight: "rgba(212,118,78,0.10)",
  brandLight2: "rgba(212,118,78,0.16)",
  brandSolidBg: "#FFF4EF",
  bgDark: "#0D0D0D",
  bgSoft: "#141414",
  bgMuted: "#1A1A1A",
  bgSubtle: "#222222",
  surface: "#161616",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.62)",
  textMuted: "rgba(255,255,255,0.40)",
  borderLight: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.10)",
};

// Zone color palettes
const ZONES = {
  zone1: { bg: "#0D0D0D", surface: "#161616", border: "rgba(255,255,255,0.06)" },
  zone2: { bg: "#12100E", surface: "#1C1714", border: "rgba(212,118,78,0.12)" },
  zone3: { bg: "#080808", surface: "#111111", border: "rgba(255,255,255,0.04)" },
};

// ─── Shared Section Components ─────────────────────────────
function HeroSection({ zone }) {
  return (
    <div style={{ padding: "80px 40px 60px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}>
        <button style={{ background: COLORS.brand, color: "#fff", border: "none", padding: "8px 20px", borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          I'm selling
        </button>
        <button style={{ background: "rgba(255,255,255,0.08)", color: COLORS.textSecondary, border: "1px solid rgba(255,255,255,0.1)", padding: "8px 20px", borderRadius: 20, fontSize: 14, cursor: "pointer" }}>
          I'm searching
        </button>
      </div>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.022em" }}>
        Your property <span style={{ color: COLORS.brand }}>rental</span>,<br />under your control.
      </h1>
      <p style={{ color: COLORS.textSecondary, fontSize: 17, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.5 }}>
        Yalla.House is a property technology platform — not an estate agency. Get a free dashboard with market data, manage viewings, and sell your way.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, alignItems: "center" }}>
        <button style={{ background: COLORS.brand, color: "#fff", border: "none", padding: "14px 28px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
          Create your free dashboard →
        </button>
        <span style={{ color: COLORS.textMuted, fontSize: 14 }}>I'm an agent →</span>
      </div>
    </div>
  );
}

function StatsSection({ zone }) {
  const stats = [
    { value: "£5,000+", label: "Average agent commission on a UK property sale" },
    { value: "69%", label: "of owners want weekly updates but don't get them" },
    { value: "£0", label: "Cost of your Yalla owner dashboard — always free" },
    { value: "2 min", label: "to create your dashboard and see your market data" },
  ];
  return (
    <div style={{ padding: "40px 40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: zone.surface, border: `1px solid ${zone.border}`, borderRadius: 12, padding: "24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.brand, marginBottom: 8 }}>{s.value}</div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function HowItWorksSection({ zone }) {
  const steps = [
    { num: "01", title: "Create your dashboard", desc: "Enter your address and get a free owner dashboard with local market data, comparable sales, and a timeline for your sale." },
    { num: "02", title: "Sell your way", desc: "List privately and manage it yourself, or send your Owner Brief to competing agents. They respond with real proposals — you compare and choose." },
    { num: "03", title: "Stay in control", desc: "Track every viewing, offer, and update in real time. Whether you're selling privately or through an agent, your dashboard keeps everything in one place." },
  ];
  return (
    <div style={{ padding: "60px 40px" }}>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 12 }}>How it works</h2>
      <p style={{ color: COLORS.textSecondary, textAlign: "center", marginBottom: 40, fontSize: 15 }}>Three steps. No commission. Full control.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ background: zone.surface, border: `1px solid ${zone.border}`, borderRadius: 14, padding: "28px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.brandLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: COLORS.brand, fontSize: 13, fontWeight: 700 }}>⬡</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>STEP {s.num}</span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{s.title}</h3>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyYallaSection({ zone }) {
  const items = [
    { title: "You get a dashboard. Not a bill.", desc: "Every other platform charges you to list. We give you a free dashboard first — market data, comparable sales, a timeline for your sale." },
    { title: "Your data, always.", desc: "Track every viewing, every offer, every piece of feedback in one place. If you instruct an agent, they connect to your dashboard." },
    { title: "We're not agents. We're your tools.", desc: "Yalla is a technology platform, not an estate agency. We don't take commission. We give you the information and connections to make the best decision." },
  ];
  return (
    <div style={{ padding: "60px 40px" }}>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 48 }}>Why Yalla?</h2>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${COLORS.brand}`, paddingLeft: 24, marginBottom: 36 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{item.title}</h3>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreePathsSection({ zone }) {
  const paths = [
    { icon: "🏠", title: "For Owners", sub: "Free forever. No commission.", desc: "Get a free dashboard with market data and comparable sales. Sell entirely on your own, or invite agents to compete for your instruction." },
    { icon: "🔍", title: "For Home Hunters", sub: "Find your next home.", desc: "Create your Home Passport and we'll search Rightmove, Zoopla and other portals on your behalf. We match you with accredited local agents." },
    { icon: "📋", title: "For Agents", sub: "Win new instructions.", desc: "Receive Owner Briefs from motivated sellers in your area. Respond with your proposal and win the instruction — on merit, not marketing spend." },
  ];
  return (
    <div style={{ padding: "60px 40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {paths.map((p, i) => (
          <div key={i} style={{ background: zone.surface, border: `1px solid ${zone.border}`, borderRadius: 14, padding: "28px 24px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: COLORS.brandLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }}>{p.icon}</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{p.title}</h3>
            <p style={{ fontSize: 13, color: COLORS.brand, marginBottom: 12, fontWeight: 600 }}>{p.sub}</p>
            <p style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.5, margin: "0 0 16px" }}>{p.desc}</p>
            <span style={{ color: COLORS.brand, fontSize: 14, fontWeight: 600 }}>Get started →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTASection({ zone }) {
  return (
    <div style={{ padding: "80px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,118,78,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16, position: "relative" }}>Ready to take control<br />of your sale?</h2>
      <p style={{ color: COLORS.textSecondary, fontSize: 15, marginBottom: 32, position: "relative" }}>Create your free dashboard in under two minutes.</p>
      <button style={{ background: COLORS.brand, color: "#fff", border: "none", padding: "14px 28px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", position: "relative" }}>
        Create your free dashboard →
      </button>
    </div>
  );
}

// ─── Gradient Divider ───────────────────────────────────────
function GradientDivider({ style: customStyle }) {
  return (
    <div style={{
      height: 3,
      background: `linear-gradient(90deg, transparent 0%, ${COLORS.brandDeep} 15%, ${COLORS.brand} 35%, #E8A87C 50%, ${COLORS.brand} 65%, ${COLORS.brandDeep} 85%, transparent 100%)`,
      opacity: 0.7,
      ...customStyle,
    }} />
  );
}

// ═══════════════════════════════════════════════════════════
// STYLE A: Gradient Line + Background Shift
// ═══════════════════════════════════════════════════════════
function StyleA() {
  const [activeZone, setActiveZone] = useState(0);
  const zone1Ref = useRef(null);
  const zone2Ref = useRef(null);
  const zone3Ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            if (entry.target === zone1Ref.current) setActiveZone(0);
            else if (entry.target === zone2Ref.current) setActiveZone(1);
            else if (entry.target === zone3Ref.current) setActiveZone(2);
          }
        });
      },
      { threshold: [0.3] }
    );
    [zone1Ref, zone2Ref, zone3Ref].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  const zoneColors = [ZONES.zone1.bg, ZONES.zone2.bg, ZONES.zone3.bg];

  return (
    <div style={{
      background: zoneColors[activeZone],
      transition: "background-color 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      minHeight: "100%",
    }}>
      {/* ZONE 1: Dark — Hero + Stats + How It Works */}
      <div ref={zone1Ref}>
        <HeroSection zone={ZONES.zone1} />
        <StatsSection zone={ZONES.zone1} />
        <HowItWorksSection zone={ZONES.zone1} />
      </div>

      {/* ─── Gradient Divider ─── */}
      <GradientDivider />

      {/* ZONE 2: Warm/Brand-Tinted — Why Yalla + Three Paths */}
      <div ref={zone2Ref}>
        <WhyYallaSection zone={ZONES.zone2} />
        <ThreePathsSection zone={ZONES.zone2} />
      </div>

      {/* ─── Gradient Divider ─── */}
      <GradientDivider />

      {/* ZONE 3: Deep Dark — CTA */}
      <div ref={zone3Ref}>
        <CTASection zone={ZONES.zone3} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLE B: Smooth Background Shift Only (No Divider)
// ═══════════════════════════════════════════════════════════
function StyleB() {
  const [activeZone, setActiveZone] = useState(0);
  const zone1Ref = useRef(null);
  const zone2Ref = useRef(null);
  const zone3Ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            if (entry.target === zone1Ref.current) setActiveZone(0);
            else if (entry.target === zone2Ref.current) setActiveZone(1);
            else if (entry.target === zone3Ref.current) setActiveZone(2);
          }
        });
      },
      { threshold: [0.3] }
    );
    [zone1Ref, zone2Ref, zone3Ref].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  }, []);

  const zoneColors = [ZONES.zone1.bg, ZONES.zone2.bg, ZONES.zone3.bg];

  return (
    <div style={{
      background: zoneColors[activeZone],
      transition: "background-color 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
      minHeight: "100%",
    }}>
      {/* ZONE 1 */}
      <div ref={zone1Ref}>
        <HeroSection zone={ZONES.zone1} />
        <StatsSection zone={ZONES.zone1} />
        <HowItWorksSection zone={ZONES.zone1} />
      </div>

      {/* Soft spacer instead of divider */}
      <div style={{ height: 60 }} />

      {/* ZONE 2 */}
      <div ref={zone2Ref}>
        <WhyYallaSection zone={ZONES.zone2} />
        <ThreePathsSection zone={ZONES.zone2} />
      </div>

      {/* Soft spacer */}
      <div style={{ height: 60 }} />

      {/* ZONE 3 */}
      <div ref={zone3Ref}>
        <CTASection zone={ZONES.zone3} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLE C: Scroll-Driven (Continuous Gradient)
// ═══════════════════════════════════════════════════════════
function StyleC() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Interpolate between zone colors based on scroll
  const r1 = 13, g1 = 13, b1 = 13;     // zone1: #0D0D0D
  const r2 = 18, g2 = 16, b2 = 14;     // zone2: #12100E
  const r3 = 8, g3 = 8, b3 = 8;        // zone3: #080808

  let r, g, b;
  if (scrollProgress < 0.5) {
    const t = scrollProgress / 0.5;
    r = Math.round(r1 + (r2 - r1) * t);
    g = Math.round(g1 + (g2 - g1) * t);
    b = Math.round(b1 + (b2 - b1) * t);
  } else {
    const t = (scrollProgress - 0.5) / 0.5;
    r = Math.round(r2 + (r3 - r2) * t);
    g = Math.round(g2 + (g3 - g2) * t);
    b = Math.round(b2 + (b3 - b2) * t);
  }

  // Also interpolate a subtle brand glow
  const glowOpacity = scrollProgress < 0.5
    ? scrollProgress / 0.5 * 0.06
    : (1 - (scrollProgress - 0.5) / 0.5) * 0.06;

  return (
    <div
      ref={containerRef}
      style={{
        background: `radial-gradient(ellipse at 50% ${30 + scrollProgress * 40}%, rgba(212,118,78,${glowOpacity}) 0%, rgb(${r},${g},${b}) 60%)`,
        minHeight: "100%",
        overflowY: "auto",
        maxHeight: 700,
      }}
    >
      <HeroSection zone={ZONES.zone1} />
      <StatsSection zone={ZONES.zone1} />
      <HowItWorksSection zone={ZONES.zone1} />
      <WhyYallaSection zone={ZONES.zone2} />
      <ThreePathsSection zone={ZONES.zone2} />
      <CTASection zone={ZONES.zone3} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main App — Tab Switcher
// ═══════════════════════════════════════════════════════════
export default function ZoneTransitionMockup() {
  const [activeStyle, setActiveStyle] = useState("A");

  const styles = [
    { id: "A", label: "Gradient Line + BG Shift", desc: "Netflix-style: gradient divider marks each zone boundary, background smoothly transitions" },
    { id: "B", label: "Smooth BG Shift Only", desc: "Minimal: no divider line, just background color gradually changes between zones" },
    { id: "C", label: "Scroll-Driven Continuous", desc: "Fluid: background color tied directly to scroll position with brand glow that follows" },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: "#000", minHeight: "100vh" }}>
      {/* Style Picker */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          <span style={{ color: COLORS.brand, fontWeight: 800, fontSize: 16, whiteSpace: "nowrap" }}>🏠 Zone Transitions</span>
          <div style={{ display: "flex", gap: 8, flex: 1 }}>
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStyle(s.id)}
                style={{
                  flex: 1,
                  background: activeStyle === s.id ? COLORS.brand : "rgba(255,255,255,0.06)",
                  color: activeStyle === s.id ? "#fff" : COLORS.textSecondary,
                  border: activeStyle === s.id ? "none" : "1px solid rgba(255,255,255,0.08)",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Style {s.id}: {s.label}</div>
                <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.3 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Legend */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 24px 0", display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: ZONES.zone1.bg, border: "1px solid rgba(255,255,255,0.2)" }} />
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>Zone 1: Dark (#0D0D0D) — Hero + Stats + How It Works</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: ZONES.zone2.bg, border: "1px solid rgba(212,118,78,0.3)" }} />
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>Zone 2: Warm (#12100E) — Why Yalla + Three Paths</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: ZONES.zone3.bg, border: "1px solid rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>Zone 3: Deep (#080808) — CTA</span>
        </div>
      </div>

      {/* Viewport */}
      <div style={{ maxWidth: 1100, margin: "16px auto 0", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", maxHeight: 700, overflowY: activeStyle === "C" ? "hidden" : "auto" }}>
        {activeStyle === "A" && <StyleA />}
        {activeStyle === "B" && <StyleB />}
        {activeStyle === "C" && <StyleC />}
      </div>

      {/* Scroll hint */}
      <div style={{ textAlign: "center", padding: "16px 0 32px", color: COLORS.textMuted, fontSize: 12 }}>
        ↕ Scroll inside the preview to see the zone transitions in action
      </div>
    </div>
  );
}
