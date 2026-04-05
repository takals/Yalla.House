import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, MapPin, Clock, Star, TrendingUp, Zap, Shield } from 'lucide-react';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

// ─── Constants ─────────────────────────────────────────────────────────────
const DASHBOARD_URL = '../Website/dashboards/dashboard.html';
const HUNTER_URL = '../Website/dashboards/buyer.html';
const AGENT_URL = '../Website/dashboards/agent.html';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85&auto=format&fit=crop';
const PHILOSOPHY_IMAGE = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1920&q=80&auto=format&fit=crop';
const PROTOCOL_IMAGE = 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=1920&q=80&auto=format&fit=crop';

// ─── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-6 px-6 py-3 rounded-full transition-all duration-500 ${scrolled
        ? 'bg-cream/80 backdrop-blur-xl border border-moss/20 shadow-lg text-charcoal'
        : 'bg-transparent text-cream'
        }`}
    >
      <a href="#" className="font-sans font-bold text-sm tracking-tight">
        Yalla.House
      </a>
      <div className="hidden md:flex items-center gap-5">
        {['How it works', "Who it's for", 'Services'].map((link) => (
          <a
            key={link}
            href="#"
            className="nav-link-line text-xs font-medium tracking-wide opacity-80 hover:opacity-100 transition-opacity"
          >
            {link}
          </a>
        ))}
      </div>
      <a
        href={DASHBOARD_URL}
        className="btn-magnetic ml-2 flex items-center gap-1.5 rounded-full bg-clay px-4 py-2 text-xs font-semibold text-cream"
      >
        <span className="btn-slide bg-clay-dark rounded-full" />
        <span>Log in</span>
        <span><ArrowUpRight size={12} /></span>
      </a>
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      tl.fromTo(
        '.hero-badge',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
        .fromTo(
          '.hero-line-1',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo(
          '.hero-line-2',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out' },
          '-=0.6'
        )
        .fromTo(
          '.hero-sub',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo(
          '.hero-cta',
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 },
          '-=0.3'
        );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-dvh min-h-[600px] flex flex-col justify-end pb-20 px-8 md:px-16"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="Dark forest — organic, alive"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-moss-dark/70 to-transparent" />
      </div>

      {/* Content — bottom left */}
      <div ref={textRef} className="relative z-10 max-w-3xl">
        <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 backdrop-blur-sm px-4 py-1.5 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-clay animate-pulse-slow" />
          <span className="font-mono text-xs text-cream/80 tracking-widest uppercase">
            Listed on IS24 · Immowelt · Rightmove
          </span>
        </div>

        <div className="overflow-hidden mb-2">
          <p className="hero-line-1 font-sans font-bold text-cream/90 text-2xl md:text-3xl tracking-tight">
            Property control is
          </p>
        </div>
        <div className="overflow-hidden mb-6">
          <p className="hero-line-2 font-drama italic text-cream leading-none" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', letterSpacing: '-0.03em' }}>
            yours to keep.
          </p>
        </div>

        <p className="hero-sub font-sans text-cream/70 text-base md:text-lg max-w-lg leading-relaxed mb-10">
          Sell or rent your home with full visibility — DIY, hybrid, or agent-led. One dashboard. No black box. No commission shock.
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href={DASHBOARD_URL}
            className="hero-cta btn-magnetic flex items-center gap-2 rounded-full bg-clay px-7 py-4 text-sm font-semibold text-cream"
          >
            <span className="btn-slide bg-clay-dark rounded-full" />
            <span>Start your Property Audit</span>
            <span><ArrowUpRight size={14} /></span>
          </a>
          <a
            href={HUNTER_URL}
            className="hero-cta btn-magnetic flex items-center gap-2 rounded-full border border-cream/30 bg-cream/10 backdrop-blur-sm px-7 py-4 text-sm font-semibold text-cream"
          >
            <span className="btn-slide bg-cream/20 rounded-full" />
            <span>Find your home →</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Feature Card 1: Diagnostic Shuffler (Owner) ──────────────────────────
function ShufflerCard() {
  const listings = [
    { address: '14 Maple Street, E3', enquiries: 12, viewings: 6, offers: 2, next: 'Sat 10:00 – Alice R.' },
    { address: '7 Oak Close, M14', enquiries: 8, viewings: 4, offers: 1, next: 'Sun 14:30 – Tom K.' },
    { address: '22 Park Lane, N4', enquiries: 5, viewings: 2, offers: 0, next: 'Mon 11:00 – Priya M.' },
  ];
  const [cards, setCards] = useState(listings);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prev) => {
        const next = [...prev];
        next.unshift(next.pop());
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="feature-card p-8 flex flex-col gap-6">
      <div>
        <span className="font-mono text-xs text-clay tracking-widest uppercase font-semibold">Owner Dashboard</span>
        <h3 className="font-sans font-bold text-xl text-charcoal mt-2 tracking-tight">
          Run your sale from one dashboard
        </h3>
        <p className="text-sm text-charcoal/60 mt-2 leading-relaxed">
          Enquiries, viewings, and offers in one place. DIY, Hybrid, or Agent-led — always transparent.
        </p>
      </div>

      {/* Shuffler */}
      <div className="relative h-52">
        {cards.map((card, i) => (
          <div
            key={card.address}
            className="shuffler-card"
            style={{
              transform: `translateY(${i * 10}px) scale(${1 - i * 0.04})`,
              opacity: 1 - i * 0.28,
              zIndex: cards.length - i,
              boxShadow: i === 0 ? '0 8px 32px rgba(46,64,54,0.15)' : 'none',
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-xs text-moss font-semibold">{card.address}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.offers > 0 ? 'bg-clay/10 text-clay' : 'bg-moss/10 text-moss'}`}>
                {card.offers > 0 ? `${card.offers} offer${card.offers > 1 ? 's' : ''}` : 'Active'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              {[['Enquiries', card.enquiries], ['Viewings', card.viewings], ['Offers', card.offers]].map(([label, val]) => (
                <div key={label}>
                  <div className="font-sans font-bold text-lg text-charcoal">{val}</div>
                  <div className="font-mono text-xs text-charcoal/50">{label}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-charcoal/60 border-t border-charcoal/8 pt-2.5">
              <Clock size={10} />
              <span className="font-mono">Next: {card.next}</span>
            </div>
          </div>
        ))}
      </div>

      <a
        href={DASHBOARD_URL}
        className="btn-magnetic self-start flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-xs font-semibold text-cream"
      >
        <span className="btn-slide bg-moss-dark rounded-full" />
        <span>Start your free Property Audit</span>
        <span><ArrowUpRight size={12} /></span>
      </a>
    </div>
  );
}

// ─── Feature Card 2: Telemetry Typewriter (Home Hunter) ───────────────────
function TypewriterCard() {
  const lines = [
    'Scanning East London · £525k · 2–3 beds...',
    'Price drop detected: Hackney E8 — £15k reduction',
    '4 new matches found this morning',
    'Viewing confirmed: Sat 10:00 — Maple Street',
    'Deal radar active: 2 properties entering offer stage',
    'Agent newsletter filtered: 12 duplicates removed',
  ];

  const [displayText, setDisplayText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = lines[lineIndex];
    let timeout;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), 38);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), 18);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setLineIndex((l) => (l + 1) % lines.length);
    }

    setDisplayText(current.slice(0, charIndex));
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, lineIndex]);

  return (
    <div className="feature-card p-8 flex flex-col gap-6">
      <div>
        <span className="font-mono text-xs text-clay tracking-widest uppercase font-semibold">Home Hunter</span>
        <h3 className="font-sans font-bold text-xl text-charcoal mt-2 tracking-tight">
          Create a Home Passport — let homes come to you
        </h3>
        <p className="text-sm text-charcoal/60 mt-2 leading-relaxed">
          Set preferences once. Filter listings, cut newsletter noise, track opportunities, and book viewings in one place.
        </p>
      </div>

      {/* Live feed */}
      <div className="rounded-2xl bg-charcoal p-5 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-2 w-2 rounded-full bg-clay animate-pulse-slow" />
          <span className="font-mono text-xs text-cream/50 tracking-widest">LIVE FEED · HOME PASSPORT</span>
        </div>
        <div className="space-y-2 mb-5">
          {[
            { label: 'Location', value: 'East London' },
            { label: 'Budget', value: '£525k' },
            { label: 'Beds', value: '2–3' },
            { label: 'Matches', value: '4 new today' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="font-mono text-xs text-cream/40">{label}</span>
              <span className="font-mono text-xs text-cream/80 font-medium">{value}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-cream/10 pt-4">
          <div className="font-mono text-xs text-clay mb-1">// system output</div>
          <p className="font-mono text-xs text-cream/70 leading-relaxed min-h-[3rem]">
            {displayText}
            <span className="cursor-blink" />
          </p>
        </div>
      </div>

      <a
        href={HUNTER_URL}
        className="btn-magnetic self-start flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-xs font-semibold text-cream"
      >
        <span className="btn-slide bg-moss-dark rounded-full" />
        <span>Create your Home Passport</span>
        <span><ArrowUpRight size={12} /></span>
      </a>
    </div>
  );
}

// ─── Feature Card 3: Cursor Scheduler (Agent) ─────────────────────────────
function SchedulerCard() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const [activeDay, setActiveDay] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState('idle');
  const [savedFlash, setSavedFlash] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    let step = 0;
    const sequence = [2, 4, 1, 5, 3];
    let timeout;

    const runSequence = () => {
      const dayIndex = sequence[step % sequence.length];
      setPhase('moving');

      // Animate cursor to cell
      timeout = setTimeout(() => {
        setActiveDay(dayIndex);
        setPhase('clicking');
        setTimeout(() => {
          setPhase('active');
          setTimeout(() => {
            setSavedFlash(true);
            setTimeout(() => {
              setSavedFlash(false);
              setActiveDay(null);
              setPhase('idle');
              step++;
              timeout = setTimeout(runSequence, 800);
            }, 700);
          }, 400);
        }, 300);
      }, 1000);
    };

    timeout = setTimeout(runSequence, 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="feature-card p-8 flex flex-col gap-6">
      <div>
        <span className="font-mono text-xs text-clay tracking-widest uppercase font-semibold">Agent Workspace</span>
        <h3 className="font-sans font-bold text-xl text-charcoal mt-2 tracking-tight">
          Work from a workspace built for transparency
        </h3>
        <p className="text-sm text-charcoal/60 mt-2 leading-relaxed">
          Viewings, tasks, and updates in a shared system owners can see — without endless calls or spreadsheets.
        </p>
      </div>

      {/* Scheduler grid */}
      <div ref={gridRef} className="rounded-2xl border border-charcoal/10 bg-charcoal/4 p-5 flex-1 relative">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs text-charcoal/60">Week schedule</span>
          <div className="flex gap-3 text-xs font-mono text-charcoal/50">
            <span>Viewings: <strong className="text-moss">3</strong></span>
            <span>Reports: <strong className="text-clay">2</strong></span>
          </div>
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="font-mono text-xs text-charcoal/40">{d}</span>
              <button
                className={`w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200 ${activeDay === i
                  ? phase === 'clicking'
                    ? 'bg-clay text-cream scale-95'
                    : 'bg-clay text-cream scale-100'
                  : 'bg-charcoal/8 text-charcoal/50 hover:bg-moss/10'
                  } ${[1, 3, 5].includes(i) ? 'ring-1 ring-moss/20' : ''}`}
              >
                {i + 1}
              </button>
            </div>
          ))}
        </div>

        {/* Booked slots */}
        <div className="space-y-2">
          {[
            { day: 'Mon', time: '10:00', property: '14 Maple St', type: 'Viewing' },
            { day: 'Wed', time: '14:00', property: '7 Oak Close', type: 'Survey' },
            { day: 'Fri', time: '11:00', property: '22 Park Lane', type: 'Viewing' },
          ].map(({ day, time, property, type }) => (
            <div key={property} className="flex items-center gap-2 rounded-xl bg-charcoal/6 px-3 py-2">
              <span className="font-mono text-xs text-clay w-7">{day}</span>
              <span className="font-mono text-xs text-charcoal/40 w-10">{time}</span>
              <span className="font-sans text-xs text-charcoal/70 flex-1 truncate">{property}</span>
              <span className="font-mono text-xs text-moss">{type}</span>
            </div>
          ))}
        </div>

        {/* Save flash */}
        {savedFlash && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-moss/10 border border-moss/20 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-clay animate-pulse" />
            <span className="font-mono text-xs text-moss">Saved</span>
          </div>
        )}
      </div>

      <a
        href={AGENT_URL}
        className="btn-magnetic self-start flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-xs font-semibold text-cream"
      >
        <span className="btn-slide bg-moss-dark rounded-full" />
        <span>Join as an Agent</span>
        <span><ArrowUpRight size={12} /></span>
      </a>
    </div>
  );
}

// ─── Features Section ──────────────────────────────────────────────────────
function Features() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.features-heading',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.features-heading', start: 'top 85%' },
        }
      );
      gsap.fromTo(
        '.feature-card',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: '.feature-card', start: 'top 90%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="who" className="py-28 px-8 md:px-16 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="features-heading mb-16">
          <span className="font-mono text-xs text-clay tracking-widest uppercase font-semibold">Who it's for</span>
          <h2 className="font-sans font-bold text-4xl md:text-5xl text-charcoal mt-3 tracking-tight max-w-2xl leading-tight">
            One platform.{' '}
            <span className="font-drama italic text-moss" style={{ fontSize: '1.15em' }}>
              Three kinds of people.
            </span>
          </h2>
          <p className="text-charcoal/60 mt-4 text-lg max-w-xl leading-relaxed">
            Whether you're selling, searching, or servicing — Yalla.House gives you a workspace that keeps everyone aligned.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ShufflerCard />
          <TypewriterCard />
          <SchedulerCard />
        </div>
      </div>
    </section>
  );
}

// ─── Philosophy ─────────────────────────────────────────────────────────────
function Philosophy() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.philosophy-line',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.2,
          scrollTrigger: { trigger: '.philosophy-line', start: 'top 80%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-8 md:px-16 overflow-hidden" style={{ backgroundColor: '#1E2B24' }}>
      {/* Parallax texture */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img src={PHILOSOPHY_IMAGE} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-moss-dark via-transparent to-moss-dark" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="philosophy-line mb-6">
          <span className="font-mono text-xs text-cream/40 tracking-widest uppercase">Our philosophy</span>
        </div>

        <p className="philosophy-line font-sans text-cream/50 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
          Most property platforms focus on: getting sellers to list fast, then handing them to an agent and walking away.
        </p>

        <div className="philosophy-line">
          <p className="font-drama italic text-cream leading-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}>
            We focus on:{' '}
            <span style={{ color: '#CC5833' }}>keeping you in control</span>
            {' '}from day one to completion.
          </p>
        </div>

        <div className="philosophy-line mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Shield size={20} />, label: 'No black box', desc: 'You see everything your agent sees. Viewing logs, response times, offers — always.' },
            { icon: <Zap size={20} />, label: 'No commission shock', desc: 'Flat fees from €199. Or bring in an agent on your terms. You choose.' },
            { icon: <TrendingUp size={20} />, label: 'No starting over', desc: 'Switch from DIY to Hybrid to Agent-led at any point — your data travels with you.' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="rounded-3xl border border-cream/10 bg-cream/5 p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-2xl bg-clay/20 flex items-center justify-center text-clay mb-4">
                {icon}
              </div>
              <h4 className="font-sans font-bold text-cream text-base mb-2">{label}</h4>
              <p className="font-sans text-cream/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Protocol: Sticky Stacking ─────────────────────────────────────────────
// Rotating SVG motif
function RotatingMotif() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-32 animate-spin-slow opacity-30">
      <circle cx="100" cy="100" r="80" stroke="#CC5833" strokeWidth="1.5" strokeDasharray="8 4" />
      <circle cx="100" cy="100" r="55" stroke="#2E4036" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy="100" r="30" stroke="#CC5833" strokeWidth="2" />
      <path d="M100 20 L100 180 M20 100 L180 100" stroke="#2E4036" strokeWidth="0.5" />
    </svg>
  );
}

// Scanning laser grid
function LaserGrid() {
  return (
    <div className="relative w-40 h-24 overflow-hidden">
      <div className="grid grid-cols-8 grid-rows-4 gap-1 opacity-40">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ background: `rgba(46,64,54,${Math.random() * 0.5 + 0.2})` }}
          />
        ))}
      </div>
      <div
        className="absolute inset-y-0 w-px bg-clay shadow-[0_0_6px_2px_rgba(204,88,51,0.5)]"
        style={{ animation: 'scanLaser 2s linear infinite', left: 0 }}
      />
      <style>{`@keyframes scanLaser { 0%{left:0} 100%{left:100%} }`}</style>
    </div>
  );
}

// EKG waveform
function Waveform() {
  return (
    <svg viewBox="0 0 300 60" className="w-48 h-12" fill="none">
      <path
        d="M0 30 L50 30 L70 10 L90 50 L110 30 L140 30 L160 5 L175 55 L190 30 L230 30 L245 15 L255 45 L270 30 L300 30"
        stroke="#CC5833"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 600,
          strokeDashoffset: 0,
          animation: 'ekg 3s linear infinite',
        }}
      />
      <style>{`@keyframes ekg { 0%{stroke-dashoffset:600} 100%{stroke-dashoffset:0} }`}</style>
    </svg>
  );
}

function Protocol() {
  const sectionRef = useRef(null);
  const protocolCards = [
    {
      step: '01',
      title: 'Audit Your Property',
      desc: 'Complete your readiness score in minutes. We flag what needs fixing — photos, docs, pricing, EPC — before you go live. No guessing.',
      bg: '#F2F0E9',
      accent: '#2E4036',
      visual: <RotatingMotif />,
    },
    {
      step: '02',
      title: 'Choose Your Route',
      desc: 'Go DIY for maximum savings. Add Hybrid support for specific tasks. Appoint an agent and keep visibility. Switch anytime — your data follows you.',
      bg: '#2E4036',
      accent: '#CC5833',
      visual: <LaserGrid />,
    },
    {
      step: '03',
      title: 'Track, Close, Move',
      desc: 'Every offer, every milestone, every legal step — visible in your Deal Room. Weekly summaries auto-generated. You cross the finish line with total clarity.',
      bg: '#CC5833',
      accent: '#F2F0E9',
      visual: <Waveform />,
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.protocol-header',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.protocol-header', start: 'top 85%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-8 md:px-16 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="protocol-header mb-16">
          <span className="font-mono text-xs text-clay tracking-widest uppercase font-semibold">How it works</span>
          <h2 className="font-sans font-bold text-4xl md:text-5xl text-charcoal mt-3 tracking-tight max-w-xl leading-tight">
            Three steps.{' '}
            <span className="font-drama italic text-moss" style={{ fontSize: '1.1em' }}>
              One dashboard.
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {protocolCards.map((card) => (
            <div
              key={card.step}
              className="protocol-card rounded-5xl overflow-hidden"
              style={{ backgroundColor: card.bg }}
            >
              <div
                className="relative px-10 py-16 md:px-20 flex flex-col md:flex-row items-start md:items-center gap-10"
                style={{ minHeight: '280px' }}
              >
                {/* Background image for card 2 */}
                {card.step === '02' && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img src={PROTOCOL_IMAGE} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 relative z-10">
                  <div
                    className="font-mono text-7xl font-bold leading-none mb-6 opacity-15"
                    style={{ color: card.accent }}
                  >
                    {card.step}
                  </div>
                  <h3
                    className="font-sans font-bold text-2xl md:text-3xl tracking-tight mb-4"
                    style={{ color: card.step === '03' ? '#F2F0E9' : '#1A1A1A' }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-base leading-relaxed max-w-lg"
                    style={{ color: card.step === '03' ? 'rgba(242,240,233,0.7)' : 'rgba(26,26,26,0.65)' }}
                  >
                    {card.desc}
                  </p>
                </div>
                <div className="flex-shrink-0 relative z-10 opacity-70">
                  {card.visual}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA "Feel it live" ────────────────────────────────────────────────────
function CTASection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-content > *',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: '.cta-content', start: 'top 80%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-4 px-8 md:px-16 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-5xl px-10 md:px-20 py-20 md:py-28 text-center relative overflow-hidden"
          style={{ backgroundColor: '#1E2B24' }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(204,88,51,0.18) 0%, transparent 70%)',
            }}
          />
          <div className="cta-content relative z-10">
            <span className="font-mono text-xs text-cream/40 tracking-widest uppercase">Ready to try it?</span>
            <h2 className="font-sans font-bold text-4xl md:text-6xl text-cream tracking-tight mt-4 mb-6 leading-tight">
              Don't take our word for it.{' '}
              <span className="font-drama italic" style={{ color: '#CC5833' }}>
                Log in and feel it.
              </span>
            </h2>
            <p className="font-sans text-cream/60 text-lg max-w-xl mx-auto leading-relaxed mb-12">
              Your dashboard is live. Start a free Property Audit and see exactly what you need to do before you sell.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={DASHBOARD_URL}
                className="btn-magnetic flex items-center gap-2 rounded-full bg-clay px-8 py-4 text-sm font-semibold text-cream"
              >
                <span className="btn-slide bg-clay-dark rounded-full" />
                <span>🏡 Owner — Start your Audit</span>
                <span><ArrowUpRight size={14} /></span>
              </a>
              <a
                href={HUNTER_URL}
                className="btn-magnetic flex items-center gap-2 rounded-full border border-cream/20 bg-cream/8 px-8 py-4 text-sm font-semibold text-cream backdrop-blur-sm"
              >
                <span className="btn-slide bg-cream/15 rounded-full" />
                <span>🔍 Home Hunter — Create Passport</span>
              </a>
              <a
                href={AGENT_URL}
                className="btn-magnetic flex items-center gap-2 rounded-full border border-cream/20 bg-cream/8 px-8 py-4 text-sm font-semibold text-cream backdrop-blur-sm"
              >
                <span className="btn-slide bg-cream/15 rounded-full" />
                <span>📍 Agent — Join workspace</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="mt-4 pt-16 pb-10 px-8 md:px-16 rounded-t-5xl"
      style={{ backgroundColor: '#1A1A1A' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="font-sans font-bold text-cream text-xl mb-2">Yalla.House</div>
            <p className="font-sans text-cream/50 text-sm leading-relaxed max-w-xs">
              Sell smarter — with or without an agent. Your property. Your rules. Your deal.
            </p>
            <div className="flex items-center gap-2 mt-6">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              <span className="font-mono text-xs text-cream/40">System operational</span>
            </div>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-cream/80 text-xs uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-3">
              {['Owner Dashboard', 'Home Hunter', 'Agent Workspace', 'Deal Room', 'Reporting'].map((item) => (
                <li key={item}>
                  <a href="#" className="nav-link-line font-sans text-sm text-cream/50 hover:text-cream/80 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-cream/80 text-xs uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR & Safety', 'Imprint'].map((item) => (
                <li key={item}>
                  <a href="#" className="nav-link-line font-sans text-sm text-cream/50 hover:text-cream/80 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/8 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="font-mono text-xs text-cream/30">© 2025 Yalla.House GmbH. Registered in Germany.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-cream/30">IS24 · Immowelt · ImmoNet</span>
            <span className="font-mono text-xs text-cream/20">v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App Root ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="bg-cream">
      <Navbar />
      <Hero />
      <Features />
      <Philosophy />
      <Protocol />
      <CTASection />
      <Footer />
    </div>
  );
}
