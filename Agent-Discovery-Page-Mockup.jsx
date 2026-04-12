import { useState } from "react";
import { Search, X, MapPin, Shield, Home, Building2, TreePine, HardHat, Users, ChevronRight, Star, Phone, Globe, CheckCircle2 } from "lucide-react";

const BRAND = "#D4764E";
const BRAND_HOVER = "#C06842";
const BG_DARK = "#0A0B0F";
const SURFACE_DARK = "#13151B";
const BORDER_DARK = "rgba(255,255,255,0.08)";
const BORDER_HOVER = "rgba(255,255,255,0.14)";
const TEXT_WHITE = "#FFFFFF";
const TEXT_SECONDARY = "rgba(255,255,255,0.55)";
const TEXT_MUTED = "rgba(255,255,255,0.35)";

const LONDON_AREAS = [
  { prefix: "E", label: "East London", range: "E1–E20", count: 47 },
  { prefix: "N", label: "North London", range: "N1–N22", count: 38 },
  { prefix: "SE", label: "South East London", range: "SE1–SE28", count: 52 },
  { prefix: "SW", label: "South West London", range: "SW1–SW20", count: 61 },
  { prefix: "W", label: "West London", range: "W1–W14", count: 44 },
  { prefix: "NW", label: "North West London", range: "NW1–NW11", count: 33 },
  { prefix: "EC", label: "Central London", range: "EC, WC", count: 29 },
];

const SAMPLE_AGENTS = [
  {
    id: 1, agency: "Foxtons", verified: true, focus: "Sales & Lettings",
    areas: ["Hackney", "Islington", "Shoreditch"], types: ["residential", "new_build"],
    rating: 4.3, reviews: 187,
  },
  {
    id: 2, agency: "Dexters", verified: true, focus: "Sales",
    areas: ["Dalston", "Stoke Newington"], types: ["residential"],
    rating: 4.6, reviews: 94,
  },
  {
    id: 3, agency: "Marsh & Parsons", verified: false, focus: "Sales & Lettings",
    areas: ["Hackney", "Bethnal Green", "Mile End"], types: ["residential", "commercial"],
    rating: 4.1, reviews: 62,
  },
  {
    id: 4, agency: "Savills", verified: true, focus: "Sales",
    areas: ["City of London", "Hackney"], types: ["residential", "commercial", "land"],
    rating: 4.8, reviews: 312,
  },
  {
    id: 5, agency: "Hunters", verified: false, focus: "Sales & Lettings",
    areas: ["Hackney Wick", "Homerton"], types: ["residential"],
    rating: 4.0, reviews: 41,
  },
  {
    id: 6, agency: "Chestertons", verified: true, focus: "Sales",
    areas: ["Shoreditch", "Hoxton", "Old Street"], types: ["residential", "new_build"],
    rating: 4.5, reviews: 156,
  },
];

const typeIcon = (type) => {
  const map = { residential: Home, commercial: Building2, land: TreePine, new_build: HardHat, multi_unit: Users };
  const Icon = map[type] || Home;
  return <Icon size={14} />;
};

const typeLabel = (type) => {
  const map = { residential: "Residential", commercial: "Commercial", land: "Land", new_build: "New Build", multi_unit: "Multi-Unit" };
  return map[type] || type;
};

export default function AgentDiscoveryMockup() {
  const [view, setView] = useState("browse"); // "browse" | "results"
  const [postcode, setPostcode] = useState("");
  const [hoveredArea, setHoveredArea] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (postcode.trim()) setView("results");
  };

  const handleAreaClick = (prefix) => {
    setPostcode(prefix);
    setView("results");
  };

  const handleClear = () => {
    setPostcode("");
    setView("browse");
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: BG_DARK, minHeight: "100vh", color: TEXT_WHITE }}>

      {/* ═══ STICKY NAV ═══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,11,15,0.88)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${BORDER_DARK}`, padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
            <span style={{ color: BRAND }}>Yalla</span><span style={{ color: TEXT_WHITE }}>.House</span>
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            {["Services & Pricing", "Agents", "About"].map((item) => (
              <span key={item} style={{
                fontSize: 14, fontWeight: 600,
                color: item === "Agents" ? BRAND : TEXT_SECONDARY,
                cursor: "pointer", position: "relative",
                borderBottom: item === "Agents" ? `2px solid ${BRAND}` : "none",
                paddingBottom: 2,
              }}>{item}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: BRAND, color: TEXT_WHITE, border: "none", cursor: "pointer",
          }}>List Your Place</button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ paddingTop: 100, paddingBottom: 64, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Glow */}
        <div style={{
          position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
          width: 700, height: 500, borderRadius: "50%", opacity: 0.08,
          background: `radial-gradient(circle, ${BRAND} 0%, transparent 70%)`, pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 100,
            background: `${BRAND}15`, border: `1px solid ${BRAND}30`,
            marginBottom: 24, fontSize: 13, fontWeight: 600, color: BRAND,
          }}>
            <MapPin size={14} /> Find Your Local Agent
          </div>

          <h1 style={{
            fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 800,
            letterSpacing: "-0.035em", lineHeight: 1.1, marginBottom: 20,
          }}>
            Local Agents,<br />
            <span style={{ color: BRAND }}>Zero Commission</span>
          </h1>

          <p style={{ fontSize: 17, color: TEXT_SECONDARY, lineHeight: 1.65, maxWidth: 520, margin: "0 auto 40px" }}>
            Search verified estate agents in your area. Send your property brief directly — no middlemen, no fees.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED, pointerEvents: "none" }} />
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="Enter your postcode (e.g. E8 1HN)"
                  style={{
                    width: "100%", background: SURFACE_DARK, border: `1px solid ${BORDER_DARK}`,
                    borderRadius: 12, padding: "14px 44px 14px 48px", fontSize: 15,
                    color: TEXT_WHITE, outline: "none", boxSizing: "border-box",
                  }}
                />
                {postcode && (
                  <button type="button" onClick={handleClear} style={{
                    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED, padding: 0,
                  }}>
                    <X size={18} />
                  </button>
                )}
              </div>
              <button type="submit" style={{
                padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                background: BRAND, color: TEXT_WHITE, border: "none", cursor: "pointer",
                whiteSpace: "nowrap", transition: "background 0.2s",
              }}>
                Search Agents
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ═══ BROWSE BY AREA (default view) ═══ */}
      {view === "browse" && (
        <section style={{ paddingBottom: 80, padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
                Browse by Area
              </h2>
              <p style={{ color: TEXT_SECONDARY, fontSize: 15 }}>Select your area to see available agents</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {LONDON_AREAS.map((area) => (
                <div
                  key={area.prefix}
                  onClick={() => handleAreaClick(area.prefix)}
                  onMouseEnter={() => setHoveredArea(area.prefix)}
                  onMouseLeave={() => setHoveredArea(null)}
                  style={{
                    background: SURFACE_DARK, borderRadius: 16,
                    border: `1px solid ${hoveredArea === area.prefix ? `${BRAND}60` : BORDER_DARK}`,
                    padding: 28, cursor: "pointer",
                    transition: "border-color 0.2s, transform 0.2s",
                    transform: hoveredArea === area.prefix ? "translateY(-2px)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: hoveredArea === area.prefix ? `${BRAND}25` : `${BRAND}12`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "background 0.2s",
                    }}>
                      <MapPin size={20} style={{ color: BRAND }} />
                    </div>
                    <ChevronRight size={18} style={{
                      color: hoveredArea === area.prefix ? BRAND : TEXT_MUTED,
                      transition: "color 0.2s, transform 0.2s",
                      transform: hoveredArea === area.prefix ? "translateX(3px)" : "none",
                    }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{area.label}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: TEXT_MUTED }}>{area.range}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: BRAND }}>{area.count} agents</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SEARCH RESULTS ═══ */}
      {view === "results" && (
        <section style={{ paddingBottom: 80, padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ marginBottom: 32, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>
                  {SAMPLE_AGENTS.length} Agents near <span style={{ color: BRAND }}>{postcode.toUpperCase() || "E8"}</span>
                </h2>
                <p style={{ color: TEXT_SECONDARY, fontSize: 14 }}>Sorted by relevance · Verified agents shown first</p>
              </div>
              <button onClick={handleClear} style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: "transparent", color: TEXT_SECONDARY, border: `1px solid ${BORDER_DARK}`,
                cursor: "pointer",
              }}>
                ← Browse areas
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {SAMPLE_AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  onMouseEnter={() => setHoveredCard(agent.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: SURFACE_DARK, borderRadius: 16, overflow: "hidden",
                    border: `1px solid ${hoveredCard === agent.id ? BORDER_HOVER : BORDER_DARK}`,
                    transition: "border-color 0.2s, transform 0.2s",
                    transform: hoveredCard === agent.id ? "translateY(-3px)" : "none",
                    display: "flex", flexDirection: "column",
                  }}
                >
                  {/* Card Header */}
                  <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER_DARK}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{agent.agency}</h3>
                        <span style={{ fontSize: 13, color: TEXT_MUTED }}>{agent.focus}</span>
                      </div>
                      {agent.verified && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "4px 10px", borderRadius: 100,
                          background: `${BRAND}15`, flexShrink: 0,
                        }}>
                          <Shield size={13} style={{ color: BRAND }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: BRAND }}>Verified</span>
                        </div>
                      )}
                    </div>
                    {/* Rating */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex", gap: 1 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} fill={i < Math.floor(agent.rating) ? "#F59E0B" : "none"} stroke={i < Math.floor(agent.rating) ? "#F59E0B" : TEXT_MUTED} />
                        ))}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_SECONDARY }}>{agent.rating}</span>
                      <span style={{ fontSize: 12, color: TEXT_MUTED }}>({agent.reviews})</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "20px 24px", flex: 1 }}>
                    {/* Coverage */}
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Coverage</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {agent.areas.map((area) => (
                          <span key={area} style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 100,
                            background: `${BRAND}10`, fontSize: 12, fontWeight: 500,
                            color: TEXT_SECONDARY,
                          }}>
                            <MapPin size={11} style={{ color: BRAND }} /> {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Property Types */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Properties</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {agent.types.map((type) => (
                          <span key={type} style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 100,
                            background: "rgba(255,255,255,0.05)", fontSize: 12, fontWeight: 500,
                            color: TEXT_SECONDARY,
                          }}>
                            {typeIcon(type)} {typeLabel(type)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER_DARK}` }}>
                    <button style={{
                      width: "100%", padding: "11px 0", borderRadius: 10,
                      fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
                      background: hoveredCard === agent.id ? BRAND : `${BRAND}18`,
                      color: hoveredCard === agent.id ? TEXT_WHITE : BRAND,
                      transition: "all 0.25s",
                    }}>
                      Send Brief
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ STATS BAR ═══ */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{
            background: SURFACE_DARK, borderRadius: 20,
            border: `1px solid ${BORDER_DARK}`, padding: "40px 32px",
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32,
          }}>
            {[
              { value: "500+", label: "Verified agents across the UK" },
              { value: "25+", label: "Areas covered nationwide" },
              { value: "£0", label: "Always free for sellers" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: BRAND, marginBottom: 8, letterSpacing: "-0.02em" }}>
                  {stat.value}
                </div>
                <p style={{ fontSize: 14, color: TEXT_SECONDARY }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AGENT CTA ═══ */}
      <section style={{ padding: "0 24px 100px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 800, height: 800, borderRadius: "50%", opacity: 0.08, pointerEvents: "none",
          background: `radial-gradient(circle, ${BRAND} 0%, transparent 70%)`,
        }} />
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 24px",
            background: `${BRAND}15`, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Users size={28} style={{ color: BRAND }} />
          </div>
          <h2 style={{ fontSize: "clamp(1.625rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 }}>
            Are You an Agent?<br />
            <span style={{ color: BRAND }}>Join Yalla.House</span>
          </h2>
          <p style={{ color: TEXT_SECONDARY, fontSize: 16, lineHeight: 1.65, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            Receive qualified property briefs directly from sellers in your area. No subscription, no listing fees — just real leads.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16, marginBottom: 36 }}>
            {["Free to join", "Verified badge", "Direct seller briefs", "No commission"].map((perk) => (
              <div key={perk} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: TEXT_SECONDARY }}>
                <CheckCircle2 size={16} style={{ color: "#10B981" }} />
                {perk}
              </div>
            ))}
          </div>

          <button style={{
            padding: "16px 40px", borderRadius: 100, fontSize: 16, fontWeight: 700,
            background: BRAND, color: TEXT_WHITE, border: "none", cursor: "pointer",
            boxShadow: `0 0 40px ${BRAND}30`,
          }}>
            Register as an Agent
          </button>
        </div>
      </section>

      {/* ═══ FOOTER HINT ═══ */}
      <div style={{ padding: "24px 0", textAlign: "center", borderTop: `1px solid ${BORDER_DARK}` }}>
        <p style={{ fontSize: 12, color: TEXT_MUTED }}>
          Yalla.House · UK Flat-Fee Property Platform · No Commission, No Agent
        </p>
      </div>
    </div>
  );
}