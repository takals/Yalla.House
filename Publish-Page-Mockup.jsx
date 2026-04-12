import { useState } from "react";
import {
  Link2, QrCode, Share2, Copy, Check, ExternalLink, ShoppingBag,
  Globe, Users, Send, ChevronRight, ArrowRight, Sparkles, Eye,
  Home, FileText, Inbox, BarChart3, Settings, User, CheckCircle2,
  Star, MapPin, Camera, Download, Printer, Facebook, Twitter,
  MessageSquare, Mail, Phone, Shield, Lock, Zap, TrendingUp,
  Package, Tag, AlertCircle, Info, CreditCard, Crown, Gift,
  Megaphone, Radio, Search, Heart, BookOpen, Boxes, Store
} from "lucide-react";

const BRAND = "#D4764E";
const BRAND_LIGHT = "rgba(212,118,78,0.08)";
const BRAND_LIGHT2 = "rgba(212,118,78,0.14)";
const BG = "#EDEEF2";
const BG_SOFT = "#E6E8EE";
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
const RED_BG = "#FEE2E2";
const RED_TEXT = "#991B1B";

export default function PublishPageMockup() {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState("publish");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedPortals, setSelectedPortals] = useState([]);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const togglePortal = (id) => {
    setSelectedPortals(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── SIDEBAR ── */
  const Sidebar = () => (
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
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 8px", marginBottom: 8 }}>Owner Dashboard</p>
        {[
          { icon: Home, label: "Overview" },
          { icon: FileText, label: "My Listings" },
          { icon: Megaphone, label: "Publish & Share", active: true },
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

  /* ── QR CODE VISUAL ── */
  const QrCodeVisual = ({ size = 160 }) => (
    <div style={{
      width: size, height: size, background: "#fff", borderRadius: 8, padding: 8,
      display: "grid", gridTemplateColumns: `repeat(11, 1fr)`, gridTemplateRows: `repeat(11, 1fr)`, gap: 1,
    }}>
      {Array.from({ length: 121 }).map((_, i) => {
        const row = Math.floor(i / 11);
        const col = i % 11;
        const isCorner = (row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3);
        const isFilled = isCorner || Math.random() > 0.55;
        return (
          <div key={i} style={{
            background: isFilled ? TEXT : "#fff",
            borderRadius: 1,
          }} />
        );
      })}
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════
     MAIN: PUBLISH PAGE
     ══════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", background: BG, minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ marginLeft: 240, padding: 32 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: TEXT_MUTED, marginBottom: 16 }}>
            <span>My Listings</span> <ChevronRight size={14} /> <span>42 Victoria Park Road</span> <ChevronRight size={14} /> <span style={{ color: TEXT, fontWeight: 600 }}>Publish & Share</span>
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Your Listing is Ready</h1>
          <p style={{ margin: 0, fontSize: 15, color: TEXT_SEC }}>Share it with the world, push to portals, or send to local agents</p>
        </div>

        {/* ── Success Banner ── */}
        <div style={{
          background: GREEN_BG, borderRadius: 14, padding: "18px 24px", marginBottom: 28,
          display: "flex", alignItems: "center", gap: 12, border: `1px solid ${GREEN}30`,
        }}>
          <CheckCircle2 size={22} style={{ color: GREEN }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: GREEN_TEXT }}>42 Victoria Park Road is live!</span>
            <span style={{ fontSize: 14, color: GREEN_TEXT, marginLeft: 8, opacity: 0.8 }}>Published just now</span>
          </div>
          <button style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: SURFACE, color: GREEN_TEXT, border: `1px solid ${GREEN}40`, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Eye size={14} /> View Live Page
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
           SECTION 1: YOUR LINK & QR CODE
           ═══════════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>

          {/* Live Link Card */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Link2 size={22} style={{ color: BRAND }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Your Live Link</h3>
                <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED }}>Share this anywhere — it's always up to date</p>
              </div>
            </div>

            {/* URL Bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "12px 16px",
              background: BG, borderRadius: 10, border: `1px solid ${BORDER}`, marginBottom: 16,
            }}>
              <Globe size={16} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: TEXT, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                yalla.house/p/42-victoria-park-road-e9
              </span>
              <button onClick={handleCopy} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: copied ? GREEN_BG : BRAND, color: copied ? GREEN_TEXT : "#fff",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}>
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Link</>}
              </button>
            </div>

            {/* Share Buttons */}
            <p style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Share via</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { icon: MessageSquare, label: "WhatsApp", color: "#25D366" },
                { icon: Facebook, label: "Facebook", color: "#1877F2" },
                { icon: Twitter, label: "X / Twitter", color: "#000" },
                { icon: Mail, label: "Email", color: BRAND },
                { icon: MessageSquare, label: "SMS", color: TEXT_SEC },
              ].map(btn => (
                <button key={btn.label} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 11, fontWeight: 600,
                  background: BG, color: TEXT_SEC, border: `1px solid ${BORDER_LIGHT}`, cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  transition: "all 0.15s",
                }}>
                  <btn.icon size={18} style={{ color: btn.color }} />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* QR Code Card */}
          <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QrCode size={22} style={{ color: BRAND }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>QR Code</h3>
                <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED }}>Print it, stick it on the window, add it to your sign</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ background: BG, borderRadius: 12, padding: 16, border: `1px solid ${BORDER_LIGHT}` }}>
                <QrCodeVisual size={140} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.6, marginBottom: 16 }}>
                  Anyone who scans this goes straight to your listing. Perfect for window signs, flyers, or "For Sale" boards.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button style={{
                    padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: BRAND, color: "#fff", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <Download size={14} /> Download PNG
                  </button>
                  <button style={{
                    padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: BG, color: TEXT_SEC, border: `1px solid ${BORDER}`, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <Printer size={14} /> Print A4 with Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
           SECTION 2: ADD-ONS (Sign, Flyer, etc.)
           ═══════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Boost Your Listing</h2>
          <p style={{ fontSize: 14, color: TEXT_SEC, marginBottom: 16 }}>Optional extras to increase visibility</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {/* For Sale Sign */}
            <div
              onMouseEnter={() => setHoveredCard("sign")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: SURFACE, borderRadius: 16, border: `1px solid ${hoveredCard === "sign" ? BRAND : BORDER_LIGHT}`,
                overflow: "hidden", cursor: "pointer",
                transition: "all 0.2s", transform: hoveredCard === "sign" ? "translateY(-2px)" : "none",
                boxShadow: hoveredCard === "sign" ? "0 6px 20px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <div style={{ height: 120, background: "linear-gradient(135deg, #FFF0E8, #FFE0D0)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div style={{ width: 60, height: 80, borderRadius: 8, background: BRAND, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 8, boxShadow: "0 4px 12px rgba(212,118,78,0.3)" }}>
                  <span style={{ fontSize: 7, fontWeight: 800, color: "#fff", textTransform: "uppercase" }}>For Sale</span>
                  <span style={{ fontSize: 5, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Yalla.House</span>
                  <div style={{ width: 20, height: 20, background: "#fff", borderRadius: 3, marginTop: 4 }} />
                </div>
                <span style={{ position: "absolute", top: 10, right: 10, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: YELLOW_BG, color: YELLOW_TEXT }}>POPULAR</span>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Professional "For Sale" Sign</h3>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: TEXT_SEC }}>Weatherproof board with QR code. Delivered to your door in 3 days.</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: TEXT }}>£29.99</span>
                  <button style={{
                    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    background: BRAND, color: "#fff", border: "none", cursor: "pointer",
                  }}>
                    Order
                  </button>
                </div>
              </div>
            </div>

            {/* Printed Flyers */}
            <div
              onMouseEnter={() => setHoveredCard("flyers")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: SURFACE, borderRadius: 16, border: `1px solid ${hoveredCard === "flyers" ? BRAND : BORDER_LIGHT}`,
                overflow: "hidden", cursor: "pointer",
                transition: "all 0.2s", transform: hoveredCard === "flyers" ? "translateY(-2px)" : "none",
                boxShadow: hoveredCard === "flyers" ? "0 6px 20px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <div style={{ height: 120, background: "linear-gradient(135deg, #E8F0FF, #D0E0FF)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 44, height: 60, background: SURFACE, borderRadius: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.1)", transform: `rotate(${(i - 1) * 5}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Camera size={14} style={{ color: TEXT_MUTED }} />
                  </div>
                ))}
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Property Flyers (x50)</h3>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: TEXT_SEC }}>A5 glossy flyers with photos, details and QR code. Drop through letterboxes.</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: TEXT }}>£19.99</span>
                  <button style={{
                    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    background: BG, color: TEXT_SEC, border: `1px solid ${BORDER}`, cursor: "pointer",
                  }}>
                    Order
                  </button>
                </div>
              </div>
            </div>

            {/* Digital Pack */}
            <div
              onMouseEnter={() => setHoveredCard("digital")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: SURFACE, borderRadius: 16, border: `1px solid ${hoveredCard === "digital" ? BRAND : BORDER_LIGHT}`,
                overflow: "hidden", cursor: "pointer",
                transition: "all 0.2s", transform: hoveredCard === "digital" ? "translateY(-2px)" : "none",
                boxShadow: hoveredCard === "digital" ? "0 6px 20px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <div style={{ height: 120, background: "linear-gradient(135deg, #E8FFE8, #D0F0D0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 10, background: SURFACE, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Facebook size={20} style={{ color: "#1877F2" }} />
                  </div>
                  <div style={{ width: 50, height: 50, borderRadius: 10, background: SURFACE, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Camera size={20} style={{ color: "#E4405F" }} />
                  </div>
                </div>
                <span style={{ position: "absolute", top: 10, right: 10, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: GREEN_BG, color: GREEN_TEXT }}>FREE</span>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Social Media Pack</h3>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: TEXT_SEC }}>Ready-made graphics for Facebook, Instagram & WhatsApp stories. Auto-generated from your photos.</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: GREEN }}>Free</span>
                  <button style={{
                    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    background: GREEN_BG, color: GREEN_TEXT, border: "none", cursor: "pointer",
                  }}>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
           SECTION 3: PUSH TO PORTALS
           ═══════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Push to Portals & Marketplaces</h2>
          <p style={{ fontSize: 14, color: TEXT_SEC, marginBottom: 16 }}>Get your listing in front of millions more buyers</p>

          {/* Free Platforms */}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Gift size={16} style={{ color: GREEN }} /> Free Platforms
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { id: "ebay", name: "eBay", desc: "Property classifieds", color: "#E53238", icon: Store },
              { id: "fbmarket", name: "Facebook Marketplace", desc: "Local buyers", color: "#1877F2", icon: Facebook },
              { id: "gumtree", name: "Gumtree", desc: "Free classifieds", color: "#72EF36", icon: Search },
              { id: "openrent", name: "OpenRent", desc: "Direct listings", color: "#00B4D8", icon: Home },
            ].map(portal => {
              const isSelected = selectedPortals.includes(portal.id);
              return (
                <div key={portal.id}
                  onClick={() => togglePortal(portal.id)}
                  onMouseEnter={() => setHoveredCard(portal.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: SURFACE, borderRadius: 14, padding: 20,
                    border: `1px solid ${isSelected ? GREEN : hoveredCard === portal.id ? BORDER : BORDER_LIGHT}`,
                    cursor: "pointer", transition: "all 0.15s",
                    transform: hoveredCard === portal.id ? "translateY(-1px)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${portal.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <portal.icon size={20} style={{ color: portal.color }} />
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? GREEN : BORDER}`,
                      background: isSelected ? GREEN : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                    }}>
                      {isSelected && <Check size={14} style={{ color: "#fff" }} />}
                    </div>
                  </div>
                  <h4 style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>{portal.name}</h4>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: TEXT_MUTED }}>{portal.desc}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase" }}>Free</span>
                </div>
              );
            })}
          </div>

          {/* Premium Portals */}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Crown size={16} style={{ color: BRAND }} /> Premium Portals
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { id: "rightmove", name: "Rightmove", desc: "UK's #1 property portal", price: "From £99", color: "#00DEB6", icon: Home, note: "Requires partner agency", locked: true },
              { id: "zoopla", name: "Zoopla", desc: "Major UK portal", price: "From £99", color: "#7B4FC4", icon: Search, note: "Requires partner agency", locked: true },
              { id: "onthemarket", name: "OnTheMarket", desc: "Growing UK portal", price: "From £79", color: "#FF6B35", icon: Globe, note: "Requires partner agency", locked: true },
            ].map(portal => {
              const isSelected = selectedPortals.includes(portal.id);
              return (
                <div key={portal.id}
                  onMouseEnter={() => setHoveredCard(portal.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: SURFACE, borderRadius: 14, padding: 20,
                    border: `1px solid ${hoveredCard === portal.id ? BRAND : BORDER_LIGHT}`,
                    cursor: "pointer", transition: "all 0.15s",
                    opacity: portal.locked ? 0.85 : 1,
                    transform: hoveredCard === portal.id ? "translateY(-1px)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${portal.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <portal.icon size={20} style={{ color: portal.color }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: YELLOW_BG, color: YELLOW_TEXT }}>
                      {portal.price}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>{portal.name}</h4>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: TEXT_MUTED }}>{portal.desc}</p>
                  {portal.note && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", background: YELLOW_BG, borderRadius: 8 }}>
                      <AlertCircle size={12} style={{ color: YELLOW_TEXT }} />
                      <span style={{ fontSize: 11, color: YELLOW_TEXT, fontWeight: 500 }}>{portal.note}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ background: BLUE_BG, borderRadius: 12, padding: "14px 20px", display: "flex", gap: 12, alignItems: "start", marginBottom: 16 }}>
            <Info size={18} style={{ color: BLUE_TEXT, flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: BLUE_TEXT }}>Rightmove, Zoopla & OnTheMarket require a partner agency</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: BLUE_TEXT, opacity: 0.8 }}>
                In the UK, only registered estate agents can list on these portals. We work with partner agencies who can list your property for a flat fee — no commission, no strings attached. This varies by country.
              </p>
            </div>
          </div>

          {selectedPortals.length > 0 && (
            <button style={{
              padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
              background: BRAND, color: "#fff", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Zap size={18} /> Publish to {selectedPortals.length} Platform{selectedPortals.length > 1 ? "s" : ""}
            </button>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
           SECTION 4: REACH OUT TO AGENTS
           ═══════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Or Reach Out to Local Agents</h2>
          <p style={{ fontSize: 14, color: TEXT_SEC, marginBottom: 16 }}>Let agents compete for your listing — your brief is already written</p>

          <div style={{
            background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, overflow: "hidden",
            display: "grid", gridTemplateColumns: "1fr 380px",
          }}>
            {/* Left: Pitch */}
            <div style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={24} style={{ color: BRAND }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Send Your Brief to Competing Agents</h3>
                  <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED }}>Free — no commitment, no lock-in</p>
                </div>
              </div>

              <p style={{ fontSize: 14, color: TEXT_SEC, lineHeight: 1.65, marginBottom: 20 }}>
                Your listing is already a professional brief — photos, details, price, everything. Send it to local agents in one click. They'll compete with proposals showing their fee, valuation, and strategy. You compare side by side and pick the best fit.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {[
                  { icon: CheckCircle2, text: "Agents compete on commission — you get the best rate", color: GREEN },
                  { icon: Shield, text: "Your contact details stay private until you choose to connect", color: GREEN },
                  { icon: CheckCircle2, text: "No exclusive contracts — switch or remove agents anytime", color: GREEN },
                  { icon: CheckCircle2, text: "All communication stays on Yalla — full transparency", color: GREEN },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <item.icon size={18} style={{ color: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: TEXT_SEC }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <button style={{
                padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                background: BRAND, color: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <Search size={18} /> Find Agents Near E9 <ArrowRight size={16} />
              </button>
            </div>

            {/* Right: Agent Preview Cards */}
            <div style={{ background: BG_SOFT, padding: 24, borderLeft: `1px solid ${BORDER_LIGHT}` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Agents in your area</p>
              {[
                { name: "Foxtons", rating: 4.3, reviews: 187, response: "< 2 hrs", verified: true },
                { name: "Savills", rating: 4.8, reviews: 312, response: "< 4 hrs", verified: true },
                { name: "Dexters", rating: 4.6, reviews: 94, response: "< 1 hr", verified: true },
              ].map((agent, i) => (
                <div key={i} style={{
                  background: SURFACE, borderRadius: 12, padding: 16, marginBottom: 10,
                  border: `1px solid ${BORDER_LIGHT}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{agent.name}</span>
                        {agent.verified && (
                          <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 100, background: BRAND_LIGHT }}>
                            <Shield size={10} style={{ color: BRAND }} />
                            <span style={{ fontSize: 9, fontWeight: 700, color: BRAND }}>VERIFIED</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={11} fill={j < Math.floor(agent.rating) ? "#F59E0B" : "none"} stroke={j < Math.floor(agent.rating) ? "#F59E0B" : TEXT_MUTED} />
                        ))}
                        <span style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginLeft: 2 }}>{agent.rating}</span>
                        <span style={{ fontSize: 11, color: TEXT_MUTED }}>({agent.reviews})</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: TEXT_MUTED, display: "flex", alignItems: "center", gap: 3 }}>
                      <Zap size={11} style={{ color: GREEN }} /> {agent.response}
                    </span>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 12, color: BRAND, fontWeight: 600, textAlign: "center", cursor: "pointer" }}>
                View all 47 agents in E9 <ChevronRight size={14} style={{ verticalAlign: "middle" }} />
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
           SECTION 5: WHAT'S NEXT SUMMARY
           ═══════════════════════════════════════════════════════════════ */}
        <div style={{
          background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, padding: 28,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 20 }}>What's Next?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {[
              { icon: Eye, title: "Buyers visit your page", desc: "Your link is live. Share it anywhere — social media, WhatsApp, email. Buyers can view photos, details, and request viewings." },
              { icon: Inbox, title: "Enquiries come to you", desc: "When someone's interested, you get a notification. Manage all enquiries from your dashboard." },
              { icon: TrendingUp, title: "Track performance", desc: "See how many people viewed your listing, where they came from, and how many enquired. Optimise and adjust." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <item.icon size={22} style={{ color: BRAND }} />
                </div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
