import { useState } from "react";
import {
  Home, MapPin, Bed, Bath, Maximize, Calendar, PoundSterling, Shield,
  Camera, FileText, CheckCircle2, ChevronRight, ArrowRight, Building2,
  Thermometer, Car, TreePine, Wifi, Dog, Eye, Clock, Star, Send,
  User, Settings, Inbox, BarChart3, Users, Sparkles, LogOut,
  ChevronLeft, Heart, Share2, Flag, Zap, TrendingUp, Lock,
  Phone, Mail, Globe, Award, MessageSquare, AlertCircle, Info
} from "lucide-react";

const BRAND = "#D4764E";
const BRAND_LIGHT = "rgba(212,118,78,0.08)";
const BRAND_LIGHT2 = "rgba(212,118,78,0.14)";
const BG = "#EDEEF2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8DBE5";
const BORDER_LIGHT = "#E2E4EB";
const TEXT = "#0F1117";
const TEXT_SEC = "#5E6278";
const TEXT_MUTED = "#999999";
const SIDEBAR = "#0F1117";
const GREEN = "#059669";
const GREEN_BG = "#DCFCE7";
const GREEN_TEXT = "#166534";
const BLUE_BG = "#DBEAFE";
const BLUE_TEXT = "#1E40AF";
const YELLOW_BG = "#FFF7E0";
const YELLOW_TEXT = "#7A5F00";

const PHOTOS = [
  { id: 1, label: "Living Room", color: "#E8D5C8" },
  { id: 2, label: "Kitchen", color: "#D5C8B8" },
  { id: 3, label: "Master Bedroom", color: "#C8D5D8" },
  { id: 4, label: "Garden", color: "#C8E0C8" },
  { id: 5, label: "Bathroom", color: "#D8D5E8" },
  { id: 6, label: "Exterior", color: "#E0D8C8" },
];

const FEATURES = [
  { icon: Bed, label: "3 Bedrooms" },
  { icon: Bath, label: "2 Bathrooms" },
  { icon: Maximize, label: "1,450 sq ft" },
  { icon: Car, label: "Off-street Parking" },
  { icon: TreePine, label: "South-facing Garden" },
  { icon: Thermometer, label: "EPC Rating C" },
];

export default function OwnerBriefToAgentMockup() {
  const [view, setView] = useState("owner");
  const [activePhoto, setActivePhoto] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const Sidebar = ({ role }) => (
    <div style={{
      width: 240, background: SIDEBAR, height: "100vh", position: "fixed",
      left: 0, top: 0, padding: "20px 0", display: "flex", flexDirection: "column", zIndex: 100,
    }}>
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
          <span style={{ color: BRAND }}>Yalla</span><span style={{ color: "#fff" }}>.House</span>
        </span>
      </div>

      <div style={{ padding: "16px 12px", flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 8 }}>
          {role === "owner" ? "Owner Dashboard" : "Agent Dashboard"}
        </p>

        {role === "owner" ? (
          [
            { icon: Home, label: "Overview" },
            { icon: FileText, label: "My Listings", active: true },
            { icon: Users, label: "Find Agents" },
            { icon: Send, label: "Sent Briefs" },
            { icon: Inbox, label: "Proposals", badge: "3" },
            { icon: BarChart3, label: "Analytics" },
            { icon: Settings, label: "Settings" },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, marginBottom: 2, cursor: "pointer",
              background: item.active ? BRAND_LIGHT2 : "transparent",
              color: item.active ? BRAND : "rgba(255,255,255,0.55)",
            }}>
              <item.icon size={16} />
              <span style={{ fontSize: 14, fontWeight: item.active ? 600 : 500, flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>{item.badge}</span>}
            </div>
          ))
        ) : (
          [
            { icon: Home, label: "Overview" },
            { icon: Inbox, label: "Incoming Briefs", active: true, badge: "New" },
            { icon: FileText, label: "My Proposals" },
            { icon: Users, label: "My Hunters" },
            { icon: MessageSquare, label: "Messages" },
            { icon: User, label: "Profile" },
            { icon: Settings, label: "Settings" },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, marginBottom: 2, cursor: "pointer",
              background: item.active ? BRAND_LIGHT2 : "transparent",
              color: item.active ? BRAND : "rgba(255,255,255,0.55)",
            }}>
              <item.icon size={16} />
              <span style={{ fontSize: 14, fontWeight: item.active ? 600 : 500, flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 100, background: BRAND, color: "#fff" }}>{item.badge}</span>}
            </div>
          ))
        )}
      </div>

      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: BRAND_LIGHT2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} style={{ color: BRAND }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{role === "owner" ? "Tarek" : "Sarah Mitchell"}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>{role === "owner" ? "Owner" : "Foxtons"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══ VIEW SWITCHER TAB BAR ═══ */
  const ViewSwitcher = () => (
    <div style={{
      position: "fixed", top: 0, left: 240, right: 0, zIndex: 50,
      background: SURFACE, borderBottom: `1px solid ${BORDER_LIGHT}`,
      padding: "0 32px", display: "flex", alignItems: "center", height: 52,
    }}>
      <div style={{ display: "flex", gap: 0, background: BG, borderRadius: 10, padding: 3 }}>
        {[
          { id: "owner", label: "Owner sees this", icon: Home },
          { id: "agent", label: "Agent receives this", icon: Users },
          { id: "email", label: "Email notification", icon: Mail },
        ].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 18px",
            borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
            background: view === tab.id ? SURFACE : "transparent",
            color: view === tab.id ? TEXT : TEXT_MUTED,
            boxShadow: view === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.15s",
          }}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: TEXT_MUTED }}>
        <Info size={14} />
        Click the tabs to see each perspective
      </div>
    </div>
  );

  /* ═══ OWNER VIEW: My Listing (completed) ═══ */
  const OwnerView = () => (
    <div style={{ padding: "84px 32px 32px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 13, color: TEXT_MUTED }}>
        <span style={{ cursor: "pointer" }}>My Listings</span>
        <ChevronRight size={14} />
        <span style={{ color: TEXT, fontWeight: 600 }}>42 Victoria Park Road</span>
      </div>

      {/* Status Banner */}
      <div style={{ background: GREEN_BG, borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
        <CheckCircle2 size={18} style={{ color: GREEN }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: GREEN_TEXT }}>Listing complete — ready to send to agents</span>
        <button onClick={() => setView("agent")} style={{
          marginLeft: "auto", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
          background: BRAND, color: "#fff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Send size={14} /> Send to Agents
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Left: Property Details */}
        <div>
          {/* Photo Gallery */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, overflow: "hidden", marginBottom: 20 }}>
            <div style={{
              height: 280, background: PHOTOS[activePhoto].color,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <Camera size={48} style={{ color: "rgba(0,0,0,0.15)" }} />
              <span style={{ position: "absolute", bottom: 12, left: 16, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                {PHOTOS[activePhoto].label}
              </span>
              <span style={{ position: "absolute", bottom: 12, right: 16, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                {activePhoto + 1} / {PHOTOS.length}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4, padding: 8 }}>
              {PHOTOS.map((photo, i) => (
                <div key={i} onClick={() => setActivePhoto(i)} style={{
                  flex: 1, height: 52, borderRadius: 8, background: photo.color, cursor: "pointer",
                  border: activePhoto === i ? `2px solid ${BRAND}` : "2px solid transparent",
                  opacity: activePhoto === i ? 1 : 0.6, transition: "all 0.15s",
                }} />
              ))}
            </div>
          </div>

          {/* Property Title + Address */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>42 Victoria Park Road</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_SEC, fontSize: 14 }}>
                  <MapPin size={14} style={{ color: BRAND }} />
                  London E9 7BT, Hackney
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: BRAND }}>£650,000</div>
                <div style={{ fontSize: 12, color: TEXT_MUTED }}>Asking price</div>
              </div>
            </div>

            {/* Feature Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {FEATURES.map((feat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: BG, borderRadius: 10 }}>
                  <feat.icon size={16} style={{ color: BRAND }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{feat.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700 }}>Description</h3>
            <p style={{ margin: 0, fontSize: 14, color: TEXT_SEC, lineHeight: 1.65 }}>
              A beautifully maintained three-bedroom Victorian terrace in the heart of Hackney, just minutes from Victoria Park. Recently renovated kitchen and bathrooms, original period features throughout, south-facing garden, and excellent transport links. Chain-free sale.
            </p>
          </div>

          {/* Key Details Table */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Property Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {[
                ["Property Type", "Terraced House"],
                ["Ownership", "Freehold"],
                ["Council Tax Band", "D"],
                ["Year Built", "c. 1890"],
                ["Condition", "Good — recently renovated"],
                ["Heating", "Gas central heating"],
                ["Internet", "Fibre available (80Mbps)"],
                ["Parking", "Off-street (1 space)"],
                ["Garden", "South-facing, 30ft"],
                ["Chain Status", "Chain-free"],
                ["Available From", "Immediate"],
                ["Reason for Sale", "Relocating"],
              ].map(([label, value], i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${BORDER_LIGHT}`, display: "flex", justifyContent: "space-between", paddingRight: i % 2 === 0 ? 20 : 0, paddingLeft: i % 2 === 1 ? 20 : 0 }}>
                  <span style={{ fontSize: 13, color: TEXT_MUTED }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Summary Card */}
        <div>
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, padding: 24, position: "sticky", top: 84 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Listing Summary</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                { icon: CheckCircle2, label: "Photos uploaded", count: "6 photos", color: GREEN },
                { icon: CheckCircle2, label: "Details complete", count: "All fields", color: GREEN },
                { icon: CheckCircle2, label: "Description written", count: "142 words", color: GREEN },
                { icon: CheckCircle2, label: "Price set", count: "£650,000", color: GREEN },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <item.icon size={16} style={{ color: item.color }} />
                  <span style={{ fontSize: 13, color: TEXT, flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: TEXT_MUTED }}>{item.count}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${BORDER_LIGHT}`, paddingTop: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: TEXT_MUTED }}>Status</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 100, background: GREEN_BG, color: GREEN_TEXT }}>READY</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: TEXT_MUTED }}>Created</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>11 April 2026</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: TEXT_MUTED }}>Briefs sent</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>0 agents</span>
              </div>
            </div>

            <button onClick={() => setView("agent")} style={{
              width: "100%", padding: "13px 0", borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: BRAND, color: "#fff", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginBottom: 8,
            }}>
              <Send size={16} /> Send to Agents
            </button>

            <button onClick={() => setView("email")} style={{
              width: "100%", padding: "11px 0", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "transparent", color: TEXT_SEC, border: `1px solid ${BORDER}`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Eye size={14} /> Preview what agents see
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══ AGENT VIEW: Incoming Brief (what the agent sees in their dashboard) ═══ */
  const AgentView = () => (
    <div style={{ padding: "84px 32px 32px" }}>
      {/* New Brief Alert */}
      <div style={{ background: `${BRAND}10`, borderRadius: 12, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, border: `1px solid ${BRAND}30` }}>
        <Zap size={18} style={{ color: BRAND }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>New Owner Brief — respond within 48 hours for priority placement</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: TEXT_MUTED }}>Received 2 min ago</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        {/* Left: Property Brief */}
        <div>
          {/* Photo Gallery (agent sees same photos) */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, overflow: "hidden", marginBottom: 20 }}>
            <div style={{
              height: 240, background: PHOTOS[activePhoto].color,
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              <Camera size={48} style={{ color: "rgba(0,0,0,0.15)" }} />
              <span style={{ position: "absolute", bottom: 12, left: 16, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                {PHOTOS[activePhoto].label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4, padding: 8 }}>
              {PHOTOS.map((photo, i) => (
                <div key={i} onClick={() => setActivePhoto(i)} style={{
                  flex: 1, height: 44, borderRadius: 6, background: photo.color, cursor: "pointer",
                  border: activePhoto === i ? `2px solid ${BRAND}` : "2px solid transparent",
                  opacity: activePhoto === i ? 1 : 0.6,
                }} />
              ))}
            </div>
          </div>

          {/* Brief Header */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: BRAND_LIGHT2, color: BRAND, textTransform: "uppercase", letterSpacing: "0.04em" }}>Owner Brief</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: GREEN_BG, color: GREEN_TEXT, textTransform: "uppercase", letterSpacing: "0.04em" }}>For Sale</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: BLUE_BG, color: BLUE_TEXT, textTransform: "uppercase", letterSpacing: "0.04em" }}>Chain Free</span>
            </div>

            <h1 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>3-Bed Victorian Terrace — Hackney, E9</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_SEC, fontSize: 14, marginBottom: 16 }}>
              <MapPin size={14} style={{ color: BRAND }} /> London E9 7BT
            </div>

            <div style={{ fontSize: 28, fontWeight: 800, color: BRAND, marginBottom: 20 }}>£650,000</div>

            {/* Feature Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
              {FEATURES.map((feat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: BG, borderRadius: 10 }}>
                  <feat.icon size={15} style={{ color: BRAND }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>{feat.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <p style={{ margin: 0, fontSize: 14, color: TEXT_SEC, lineHeight: 1.65 }}>
              A beautifully maintained three-bedroom Victorian terrace in the heart of Hackney, just minutes from Victoria Park. Recently renovated kitchen and bathrooms, original period features throughout, south-facing garden, and excellent transport links. Chain-free sale.
            </p>
          </div>

          {/* Full Details */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Property Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {[
                ["Property Type", "Terraced House"],
                ["Ownership", "Freehold"],
                ["Council Tax Band", "D"],
                ["Condition", "Recently renovated"],
                ["Heating", "Gas central heating"],
                ["Garden", "South-facing, 30ft"],
                ["Parking", "Off-street (1 space)"],
                ["Chain Status", "Chain-free"],
                ["Available", "Immediate"],
                ["EPC Rating", "C"],
              ].map(([label, value], i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: `1px solid ${BORDER_LIGHT}`, display: "flex", justifyContent: "space-between", paddingRight: i % 2 === 0 ? 20 : 0, paddingLeft: i % 2 === 1 ? 20 : 0 }}>
                  <span style={{ fontSize: 13, color: TEXT_MUTED }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Agent Response Panel */}
        <div>
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, padding: 24, position: "sticky", top: 84 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Submit Your Proposal</h3>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: TEXT_SEC }}>The owner will compare proposals side by side</p>

            {/* Form Fields */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT_SEC, marginBottom: 6 }}>Your Proposed Fee</label>
              <div style={{ position: "relative" }}>
                <input placeholder="e.g. 1.2%" style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
                  fontSize: 14, color: TEXT, background: BG, outline: "none", boxSizing: "border-box",
                }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT_SEC, marginBottom: 6 }}>Your Valuation</label>
              <input placeholder="£650,000 – £680,000" style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
                fontSize: 14, color: TEXT, background: BG, outline: "none", boxSizing: "border-box",
              }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT_SEC, marginBottom: 6 }}>Sales Strategy</label>
              <textarea placeholder="Describe your approach to selling this property..." rows={4} style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
                fontSize: 14, color: TEXT, background: BG, outline: "none", boxSizing: "border-box",
                resize: "vertical", fontFamily: "inherit",
              }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT_SEC, marginBottom: 6 }}>Estimated Timeline</label>
              <input placeholder="e.g. 6–8 weeks to offer" style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${BORDER}`,
                fontSize: 14, color: TEXT, background: BG, outline: "none", boxSizing: "border-box",
              }} />
            </div>

            <button style={{
              width: "100%", padding: "13px 0", borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: BRAND, color: "#fff", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginBottom: 12,
            }}>
              <Send size={16} /> Submit Proposal
            </button>

            <div style={{ background: YELLOW_BG, borderRadius: 10, padding: 14, display: "flex", gap: 10, alignItems: "start" }}>
              <Clock size={16} style={{ color: YELLOW_TEXT, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: YELLOW_TEXT }}>Respond within 48 hours</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: YELLOW_TEXT, opacity: 0.8 }}>Early responses get priority placement with the owner</p>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER_LIGHT}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Lock size={14} style={{ color: TEXT_MUTED }} />
                <span style={{ fontSize: 12, color: TEXT_MUTED }}>Owner contact details hidden until they accept your proposal</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={14} style={{ color: TEXT_MUTED }} />
                <span style={{ fontSize: 12, color: TEXT_MUTED }}>Your proposal is only visible to this owner</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══ EMAIL VIEW: What the agent's inbox looks like ═══ */
  const EmailView = () => (
    <div style={{ padding: "84px 32px 32px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: TEXT_MUTED }}>This is what arrives in the agent's email inbox</p>
        </div>

        <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, overflow: "hidden" }}>
          {/* Email chrome */}
          <div style={{ padding: "14px 20px", background: BG, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Mail size={16} style={{ color: TEXT_SEC }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>New Owner Brief — House in Hackney</span>
            </div>
            <div style={{ fontSize: 12, color: TEXT_MUTED }}>
              From: Yalla.House &lt;noreply@yalla.house&gt; · To: sarah@foxtons.co.uk
            </div>
          </div>

          {/* Email body */}
          <div style={{ background: BG, padding: 32 }}>
            <div style={{ maxWidth: 560, margin: "0 auto", background: SURFACE, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ background: BRAND, padding: "20px 32px" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: SIDEBAR, letterSpacing: "-0.02em" }}>Yalla.House</span>
              </div>

              <div style={{ padding: 32 }}>
                <p style={{ margin: "0 0 8px", fontSize: 16, color: SIDEBAR }}>Hi Sarah,</p>
                <p style={{ margin: "0 0 24px", fontSize: 15, color: TEXT_SEC, lineHeight: 1.6 }}>
                  A property owner in <strong style={{ color: SIDEBAR }}>Hackney (E9 7BT)</strong> is looking for competing proposals from local agents.
                </p>

                <div style={{ background: BG, borderRadius: 10, padding: 20, marginBottom: 24 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    {[
                      ["Area", "Hackney, E9 7BT"],
                      ["Type", "Victorian Terrace"],
                      ["Bedrooms", "3"],
                      ["Bathrooms", "2"],
                      ["Size", "1,450 sq ft"],
                      ["Asking Price", "£650,000"],
                      ["Chain Status", "Chain-free"],
                      ["Available", "Immediate"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ padding: "5px 0", color: TEXT_SEC, fontSize: 14 }}>{label}</td>
                        <td style={{ padding: "5px 0 5px 16px", fontSize: 14, fontWeight: 600 }}>{value}</td>
                      </tr>
                    ))}
                  </table>
                </div>

                <p style={{ margin: "0 0 16px", fontSize: 15, color: TEXT_SEC, lineHeight: 1.6 }}>
                  <strong style={{ color: SIDEBAR }}>Yalla.House</strong> connects motivated sellers with local agents — no upfront fees, no lock-in. The owner reviews proposals side by side and picks the best fit.
                </p>

                <div style={{ marginTop: 24 }}>
                  <span style={{
                    display: "inline-block", padding: "14px 28px", borderRadius: 10,
                    background: BRAND, color: "#fff", fontWeight: 700, fontSize: 15,
                  }}>
                    View Brief & Submit Your Proposal
                  </span>
                </div>

                <p style={{ marginTop: 24, fontSize: 13, color: TEXT_MUTED }}>
                  You're receiving this because you cover the E9 area. Owner details are private until they accept a proposal.
                </p>
              </div>

              <div style={{ padding: "20px 32px", background: BG, borderTop: `1px solid ${BORDER_LIGHT}` }}>
                <p style={{ margin: 0, fontSize: 12, color: TEXT_MUTED }}>Yalla.House Ltd — Sell your property. Keep every pound.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow showing flow */}
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: TEXT_SEC }}>
            <span>Agent clicks the button</span>
            <ArrowRight size={16} style={{ color: BRAND }} />
            <span>Opens the brief in their dashboard</span>
          </div>
        </div>

        <div style={{ background: BLUE_BG, borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, alignItems: "start" }}>
          <Lock size={18} style={{ color: BLUE_TEXT, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: BLUE_TEXT }}>Privacy protected</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: BLUE_TEXT, opacity: 0.8 }}>
              Your name, email, and phone number are never shared. Agents only see the property details until you choose to connect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", background: BG, minHeight: "100vh" }}>
      <Sidebar role={view === "agent" ? "agent" : "owner"} />
      <div style={{ marginLeft: 240 }}>
        <ViewSwitcher />
        {view === "owner" && <OwnerView />}
        {view === "agent" && <AgentView />}
        {view === "email" && <EmailView />}
      </div>
    </div>
  );
}
