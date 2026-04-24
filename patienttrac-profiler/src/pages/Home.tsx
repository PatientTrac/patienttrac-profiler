import { useState, useEffect, useRef } from 'react'

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  navy950: '#020a14', navy900: '#060e1c', navy800: '#0a1628', navy700: '#0f2040',
  navy600: '#1a3060',
  gold: '#c9a96e', goldLt: '#e8cc9a', goldDk: '#9a7a4a',
  cyan: '#00d4ff', cyanDk: '#00a8cc',
  text: '#e8eaf0', muted: '#8a9bc0', subtle: '#3a4a6a',
  green: '#4ade80', amber: '#fbbf24', red: '#ff6b6b',
}

// ── Animated counter hook ─────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

// ── Intersection observer hook ────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ── Nav ───────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(2,10,20,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? `1px solid rgba(201,169,110,0.12)` : 'none',
      transition: 'all 0.3s',
      padding: '0 24px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <a href="/" style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 22, color: C.gold, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: '50%', background: `rgba(201,169,110,0.15)`, border: `1px solid rgba(201,169,110,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏥</span>
        PatientTrac
        <span style={{ background: C.gold, color: C.navy950, fontSize: 9, padding: '2px 6px', fontFamily: 'DM Mono,monospace', letterSpacing: '0.1em', fontWeight: 700 }}>PROFILER</span>
      </a>

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-desktop">
        {[['Features', '#features'], ['AI Features', '#ai'], ['How It Works', '#how'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([label, href]) => (
          <a key={label} href={href} style={{ color: C.muted, textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
            {label}
          </a>
        ))}
        <a href="/pricing" style={{ background: C.gold, color: C.navy950, padding: '9px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.05em', textDecoration: 'none', transition: 'background 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = C.goldLt)}
          onMouseLeave={e => (e.currentTarget.style.background = C.gold)}>
          START FREE TRIAL
        </a>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000)
    return () => clearInterval(id)
  }, [])

  const rotatingWords = ['Faster.', 'Smarter.', 'Paperless.', 'Compliant.', 'Connected.']
  const word = rotatingWords[tick % rotatingWords.length]

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: '80px 24px 60px', textAlign: 'center',
    }}>
      {/* Animated grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(201,169,110,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.04) 1px, transparent 1px)`, backgroundSize: '60px 60px', zIndex: 0 }} />

      {/* Radial glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '60%', left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', zIndex: 0 }} />

      {/* Floating data badges */}
      <div style={{ position: 'absolute', top: '20%', left: '8%', animation: 'float 6s ease-in-out infinite', zIndex: 1 }}>
        <DataBadge icon="🤖" label="AI ASSISTANT" value="Voice + Text" color={C.cyan} />
      </div>
      <div style={{ position: 'absolute', top: '35%', right: '6%', animation: 'float 8s ease-in-out infinite 1s', zIndex: 1 }}>
        <DataBadge icon="✍️" label="E-SIGNATURE" value="Legally Binding" color={C.green} />
      </div>
      <div style={{ position: 'absolute', bottom: '28%', left: '5%', animation: 'float 7s ease-in-out infinite 2s', zIndex: 1 }}>
        <DataBadge icon="🎤" label="VOICE INPUT" value="EN · ES · FR" color={C.gold} />
      </div>
      <div style={{ position: 'absolute', bottom: '32%', right: '7%', animation: 'float 9s ease-in-out infinite 0.5s', zIndex: 1 }}>
        <DataBadge icon="🔒" label="HIPAA" value="Compliant" color={C.amber} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 820 }}>
        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,169,110,0.08)', border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 20, padding: '6px 18px', marginBottom: 32, fontSize: 11, color: C.gold, fontFamily: 'DM Mono,monospace', letterSpacing: '0.12em' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          HIPAA-COMPLIANT PATIENT INTAKE PLATFORM
        </div>

        <h1 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(40px,7vw,80px)', lineHeight: 1.05, color: C.text, marginBottom: 8 }}>
          Patient Intake,
        </h1>
        <h1 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(40px,7vw,80px)', lineHeight: 1.05, marginBottom: 32, color: C.gold, minHeight: '1.1em', transition: 'all 0.3s' }}>
          {word}
        </h1>

        <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: C.muted, lineHeight: 1.75, maxWidth: 600, margin: '0 auto 48px' }}>
          Patients complete their full health profile before they arrive — demographics, medical history, medications, insurance, review of systems, and consent forms. Everything lands directly in your EHR, automatically.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/pricing" style={{ background: C.gold, color: C.navy950, padding: '16px 36px', borderRadius: 8, fontSize: 16, fontWeight: 700, fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.05em', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: `0 8px 32px rgba(201,169,110,0.25)` }}
            onMouseEnter={e => { e.currentTarget.style.background = C.goldLt; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.transform = 'translateY(0)' }}>
            START FREE TRIAL →
          </a>
          <a href="#how" style={{ background: 'transparent', color: C.muted, padding: '16px 32px', borderRadius: 8, fontSize: 15, border: `1px solid ${C.subtle}`, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.subtle; e.currentTarget.style.color = C.muted }}>
            See How It Works
          </a>
        </div>

        {/* Trust bar */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 52, flexWrap: 'wrap' }}>
          {[
            ['🔐', 'HIPAA Compliant'],
            ['🛡️', 'BAA Included'],
            ['🔒', '256-bit Encryption'],
            ['✅', 'No Card Required'],
          ].map(([icon, label]) => (
            <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.subtle, fontFamily: 'DM Mono,monospace' }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-12px) } }
        @keyframes pulse-dot { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .nav-desktop { display: flex }
        @media (max-width: 680px) { .nav-desktop { display: none } .float-badge { display: none } }
      `}</style>
    </section>
  )
}

function DataBadge({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="float-badge" style={{ background: 'rgba(6,14,28,0.9)', border: `1px solid ${color}33`, borderRadius: 10, padding: '10px 14px', backdropFilter: 'blur(8px)', minWidth: 120 }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: color, letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{value}</div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────────────
function StatsBar() {
  const { ref, inView } = useInView()
  const s1 = useCounter(87, 2000, inView)
  const s2 = useCounter(14, 1500, inView)
  const s3 = useCounter(99, 2200, inView)
  const s4 = useCounter(3, 1200, inView)

  const stats = [
    { value: s1, suffix: '%', label: 'Reduction in front-desk paperwork', color: C.gold },
    { value: s2, suffix: 'min', label: 'Average intake completion time', color: C.cyan },
    { value: s3, suffix: '%', label: 'Patient satisfaction score', color: C.green },
    { value: s4, suffix: 'min', label: 'Setup time for new practice', color: C.amber },
  ]

  return (
    <div ref={ref} style={{ background: C.navy900, borderTop: `1px solid rgba(201,169,110,0.1)`, borderBottom: `1px solid rgba(201,169,110,0.1)`, padding: '48px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, textAlign: 'center' }}>
        {stats.map((s, i) => (
          <div key={i}>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 52, color: s.color, lineHeight: 1 }}>
              {s.value}{s.suffix}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Features ──────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: '📋',
      title: '13-Section Clinical Intake',
      desc: 'Demographics, contact, insurance, medical history, medications, allergies, surgical history, family history, social history, review of systems, and consent — all in one seamless flow.',
      color: C.gold,
      tags: ['Complete Profile', 'Clinical Grade', 'EHR-Ready'],
    },
    {
      icon: '🔄',
      title: 'Instant EHR Sync',
      desc: 'Patient data writes directly to your PatientTracForge database the moment they submit. No manual entry. No transcription errors. Staff sees the complete profile before the patient arrives.',
      color: C.cyan,
      tags: ['Real-time', 'Zero Manual Entry', 'Live Database'],
    },
    {
      icon: '🤖',
      title: 'AI Patient Assistant',
      desc: 'Claude AI is embedded directly in the intake form. Patients ask questions in plain language — "What is a group number?" or "Do I include vitamins?" — and get instant, empathetic, clinically-aware answers in their own language.',
      color: C.cyan,
      tags: ['Claude AI', 'Real-time Help', 'EN · ES · FR'],
    },
    {
      icon: '🎤',
      title: 'Voice-to-Text Input',
      desc: 'Patients speak their answers instead of typing. Tap the mic, say it out loud, and the AI transcribes it instantly. Works in English, Spanish, and French. Ideal for elderly patients, low-literacy patients, or anyone completing forms hands-free.',
      color: '#a78bfa',
      tags: ['Speech Recognition', 'Hands-Free', 'Any Language'],
    },
    {
      icon: '✍️',
      title: 'Legal E-Signature Consent Forms',
      desc: 'Patients sign directly on their phone screen with a finger — no printing, no scanning, no mailing. Six built-in consent forms (Treatment, HIPAA, Financial, Telehealth, Photo, Psychiatric) plus unlimited custom forms. Compliant with the E-SIGN Act.',
      color: C.green,
      tags: ['E-SIGN Act Compliant', 'Custom Forms', 'Timestamped'],
    },
    {
      icon: '🌐',
      title: 'Trilingual — EN · ES · FR',
      desc: 'Full English, Spanish, and French support built in. Auto-detects browser language. Patients can switch languages mid-form. Critical for Miami, Houston, Montreal, and Latin American markets.',
      color: C.amber,
      tags: ['English', 'Español', 'Français'],
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      desc: 'Built for the phone. 70% of patients complete intake on mobile. Large touch targets, no pinch-to-zoom, native inputs, iOS safe areas. Feels like a native app, not a form.',
      color: '#a78bfa',
      tags: ['iOS', 'Android', 'Any Device'],
    },
    {
      icon: '🔗',
      title: 'Token-Based Access',
      desc: 'Send patients a secure 48-hour link before their appointment. No account creation required. Works standalone for new patient registration too. Auto-saves progress so patients can return.',
      color: C.gold,
      tags: ['No Account Needed', '48-hr Link', 'Auto-Save'],
    },
    {
      icon: '🧠',
      title: 'AI Clinical Summary',
      desc: "After intake, the AI generates a structured clinical summary for your provider — chief complaint, key symptoms, medication risks, allergy flags, and suggested ICD-10 codes. Provider walks in prepared, not surprised.",
      color: C.cyan,
      tags: ['Clinical Summary', 'ICD-10 Codes', 'Provider Ready'],
    },
    {
      icon: '🏥',
      title: 'Multi-Specialty Support',
      desc: 'Works seamlessly with PatientTracForge scheduling, Revela plastic surgery module, and the Mental Health behavioral health module. One profile, all specialties.',
      color: C.green,
      tags: ['Primary Care', 'Plastic Surgery', 'Mental Health'],
    },
    {
      icon: '📊',
      title: 'HubSpot CRM Integration',
      desc: 'Every completed profile syncs a contact to HubSpot. Track patient acquisition, follow up on incomplete profiles, and run marketing automations — all connected to your CRM.',
      color: C.amber,
      tags: ['HubSpot', 'CRM Sync', 'Automations'],
    },
  ]

  return (
    <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 72 }}>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: C.gold, letterSpacing: '0.15em', marginBottom: 16 }}>✦ PLATFORM FEATURES</div>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: C.text, marginBottom: 16, lineHeight: 1.1 }}>
          Everything your practice needs.<br />
          <span style={{ color: C.gold }}>Nothing it doesn't.</span>
        </h2>
        <p style={{ color: C.muted, fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
          Built specifically for modern medical practices. Clinical-grade data collection with a consumer-grade experience.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} delay={i * 60} />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc, color, tags, delay }: { icon: string; title: string; desc: string; color: string; tags: string[]; delay: number }) {
  const { ref, inView } = useInView(0.1)
  return (
    <div ref={ref} style={{
      background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 12, padding: 28,
      opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.5s ${delay}ms, transform 0.5s ${delay}ms`,
      cursor: 'default',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}44`; (e.currentTarget as HTMLDivElement).style.background = `rgba(10,22,40,0.95)` }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,169,110,0.1)'; (e.currentTarget as HTMLDivElement).style.background = C.navy800 }}
    >
      <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 20, color: C.text, marginBottom: 10 }}>{title}</h3>
      <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{desc}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tags.map(tag => (
          <span key={tag} style={{ background: `${color}15`, border: `1px solid ${color}30`, color, fontSize: 10, fontFamily: 'DM Mono,monospace', padding: '3px 8px', borderRadius: 4, letterSpacing: '0.06em' }}>{tag}</span>
        ))}
      </div>
    </div>
  )
}

// ── Power Features Spotlight ──────────────────────────────────────────────
function PowerFeatures() {
  const { ref: r1, inView: v1 } = useInView(0.15)
  const { ref: r2, inView: v2 } = useInView(0.15)
  const { ref: r3, inView: v3 } = useInView(0.15)

  return (
    <section id="ai" style={{ background: C.navy900, padding: '100px 24px', borderTop: `1px solid rgba(201,169,110,0.08)` }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: C.cyan, letterSpacing: '0.15em', marginBottom: 16 }}>✦ SIGNATURE CAPABILITIES</div>
          <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: C.text, lineHeight: 1.1, marginBottom: 16 }}>
            Three features that change<br /><span style={{ color: C.cyan }}>everything for your patients.</span>
          </h2>
          <p style={{ color: C.muted, fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
            No other intake platform combines AI guidance, voice input, and e-signatures in one patient-facing experience.
          </p>
        </div>

        {/* ── Feature 1: AI Assistant ── */}
        <div ref={r1} style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48, alignItems: 'center', marginBottom: 80,
          opacity: v1 ? 1 : 0, transform: v1 ? 'translateY(0)' : 'translateY(32px)',
          transition: 'all 0.6s ease',
        }}>
          {/* Visual mockup */}
          <div style={{ background: C.navy800, border: `1px solid rgba(0,212,255,0.2)`, borderRadius: 16, padding: 24, boxShadow: `0 0 60px rgba(0,212,255,0.08)` }}>
            {/* Chat header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid rgba(0,212,255,0.1)` }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
              <div>
                <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14, color: C.cyan }}>PatientTrac Assistant</div>
                <div style={{ fontSize: 10, color: C.green, fontFamily: 'DM Mono,monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block' }} /> ONLINE
                </div>
              </div>
            </div>
            {/* Chat bubbles */}
            {[
              { role: 'user',      text: 'What is a "group number" on my insurance card?' },
              { role: 'assistant', text: 'Great question! The group number identifies your employer\'s insurance plan. It\'s usually labeled "Group #" or "Grp" on the front of your card — often a 4-9 digit number.' },
              { role: 'user',      text: '¿Debo incluir mis vitaminas?' },
              { role: 'assistant', text: 'Sí, por favor incluya todas las vitaminas y suplementos que toma regularmente. Esto ayuda a su médico a evitar interacciones con medicamentos.' },
            ].map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, marginBottom: 12, alignItems: 'flex-end' }}>
                {msg.role === 'assistant' && <div style={{ fontSize: 14, flexShrink: 0 }}>🤖</div>}
                <div style={{
                  maxWidth: '80%', padding: '10px 13px', fontSize: 13, lineHeight: 1.55,
                  background: msg.role === 'user' ? 'rgba(0,212,255,0.1)' : C.navy700,
                  border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.2)' : 'rgba(201,169,110,0.08)'}`,
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  color: msg.role === 'user' ? C.cyan : C.text,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Input bar */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8, padding: '10px 12px', background: C.navy700, border: `1px solid ${C.subtle}`, borderRadius: 10 }}>
              <span style={{ fontSize: 13, color: C.subtle, flex: 1 }}>Ask anything about your intake form...</span>
              <span style={{ fontSize: 18 }}>🎤</span>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: C.navy950 }}>↑</div>
            </div>
          </div>
          {/* Copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 10, color: C.cyan, fontFamily: 'DM Mono,monospace', letterSpacing: '0.1em', marginBottom: 20 }}>🤖 POWERED BY CLAUDE AI</div>
            <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', color: C.text, lineHeight: 1.1, marginBottom: 16 }}>
              AI assistant that speaks<br /><span style={{ color: C.cyan }}>your patient's language.</span>
            </h3>
            <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
              Patients get confused by medical forms. Our Claude-powered assistant answers their questions in real time — in plain English, Spanish, or French. What's a deductible? Should I list my supplements? What does HIPAA mean? Answered instantly, accurately, empathetically.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Understands the current section', C.green],
                ['Answers in patient\'s chosen language', C.green],
                ['Never diagnoses — routes emergencies to 911', C.green],
                ['Reduces intake abandonment by 40%', C.cyan],
              ].map(([text, color]) => (
                <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.muted }}>
                  <span style={{ color: color as string, flexShrink: 0 }}>✓</span>{text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Feature 2: Voice Input ── */}
        <div ref={r2} style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48, alignItems: 'center', marginBottom: 80,
          opacity: v2 ? 1 : 0, transform: v2 ? 'translateY(0)' : 'translateY(32px)',
          transition: 'all 0.6s ease 0.1s',
        }}>
          {/* Copy — left on this row */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 10, color: '#a78bfa', fontFamily: 'DM Mono,monospace', letterSpacing: '0.1em', marginBottom: 20 }}>🎤 WEB SPEECH API</div>
            <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', color: C.text, lineHeight: 1.1, marginBottom: 16 }}>
              Speak your answers.<br /><span style={{ color: '#a78bfa' }}>No typing required.</span>
            </h3>
            <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
              Tap the microphone icon on any field and speak naturally. The AI transcribes your words instantly. Perfect for elderly patients who struggle with small keyboards, patients completing forms while driving (as a passenger!), or anyone who thinks faster than they type.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Works on iOS Safari, Chrome, Android', '#a78bfa'],
                ['English, Spanish, and French voice recognition', '#a78bfa'],
                ['AI reads responses aloud (text-to-speech)', '#a78bfa'],
                ['No app download — works in the browser', C.green],
              ].map(([text, color]) => (
                <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.muted }}>
                  <span style={{ color: color as string, flexShrink: 0 }}>✓</span>{text}
                </div>
              ))}
            </div>
          </div>
          {/* Visual mockup */}
          <div style={{ background: C.navy800, border: `1px solid rgba(167,139,250,0.2)`, borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: `0 0 60px rgba(167,139,250,0.06)` }}>
            {/* Listening animation */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', border: '2px solid rgba(167,139,250,0.4)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative' }}>
                🎤
                {/* Pulse rings */}
                <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(167,139,250,0.25)', animation: 'float 2s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: '1px solid rgba(167,139,250,0.12)', animation: 'float 2s ease-in-out infinite 0.3s' }} />
              </div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: '#a78bfa', letterSpacing: '0.15em' }}>LISTENING...</div>
            </div>
            {/* Waveform bars */}
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'flex-end', height: 48, marginBottom: 24 }}>
              {[20, 35, 55, 40, 65, 30, 50, 70, 45, 60, 35, 25, 55, 40, 30].map((h, i) => (
                <div key={i} style={{ width: 6, height: h, borderRadius: 3, background: `rgba(167,139,250,${0.3 + (i % 3) * 0.2})`, animation: `float ${1 + (i % 3) * 0.3}s ease-in-out infinite ${i * 0.1}s` }} />
              ))}
            </div>
            {/* Transcribed text */}
            <div style={{ background: C.navy700, border: `1px solid rgba(167,139,250,0.15)`, borderRadius: 10, padding: '14px 16px', textAlign: 'left' }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: '#a78bfa', letterSpacing: '0.1em', marginBottom: 8 }}>TRANSCRIBED</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
                "I take Metformin 500mg twice daily for my diabetes, and a baby aspirin every morning..."
              </div>
            </div>
            {/* Language badges */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              {['🇺🇸 EN', '🇪🇸 ES', '🇫🇷 FR'].map(lang => (
                <span key={lang} style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', fontSize: 11, padding: '4px 10px', borderRadius: 12, fontFamily: 'DM Mono,monospace' }}>{lang}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Feature 3: E-Signature ── */}
        <div ref={r3} style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48, alignItems: 'center',
          opacity: v3 ? 1 : 0, transform: v3 ? 'translateY(0)' : 'translateY(32px)',
          transition: 'all 0.6s ease 0.2s',
        }}>
          {/* Visual mockup */}
          <div style={{ background: C.navy800, border: `1px solid rgba(74,222,128,0.2)`, borderRadius: 16, padding: 24, boxShadow: `0 0 60px rgba(74,222,128,0.06)` }}>
            {/* Consent form preview */}
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.green, letterSpacing: '0.1em', marginBottom: 14 }}>CONSENT TO TREATMENT</div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid rgba(201,169,110,0.08)` }}>
              I consent to medical examination and treatment by the healthcare providers at this practice. I understand that I have the right to refuse any treatment at any time...
            </p>
            {/* Checkboxes */}
            {['I have read and understand this form', 'I consent to treatment', 'I acknowledge HIPAA Notice'].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: 3, background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: C.green, flexShrink: 0 }}>✓</div>
                <span style={{ fontSize: 13, color: C.muted }}>{text}</span>
              </div>
            ))}
            {/* Signature area */}
            <div style={{ marginTop: 20, border: `1px solid rgba(74,222,128,0.25)`, borderRadius: 10, padding: 16, background: 'rgba(10,22,40,0.8)' }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: C.green, letterSpacing: '0.1em', marginBottom: 10 }}>PATIENT SIGNATURE</div>
              <div style={{ height: 56, display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 280 56" style={{ width: '100%' }}>
                  <path d="M 20 40 Q 40 10 60 35 Q 80 55 100 30 Q 120 10 140 35 Q 155 50 170 30 Q 190 8 210 32 Q 225 48 240 35" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <div style={{ fontSize: 11, color: C.subtle }}>Maria García</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.subtle }}>Apr 24, 2026 · 2:14 PM</div>
              </div>
            </div>
            {/* Legal stamp */}
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: C.subtle }}>
              <span style={{ color: C.green }}>🔒</span> E-SIGN Act Compliant · Timestamped · Legally Binding
            </div>
          </div>
          {/* Copy */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 10, color: C.green, fontFamily: 'DM Mono,monospace', letterSpacing: '0.1em', marginBottom: 20 }}>✍️ E-SIGN ACT COMPLIANT</div>
            <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', color: C.text, lineHeight: 1.1, marginBottom: 16 }}>
              Consent forms signed<br /><span style={{ color: C.green }}>before they arrive.</span>
            </h3>
            <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
              Patients sign directly on their phone screen with a finger. No printing. No clipboards. No scanning. Six built-in consent forms ready to go, plus a full drag-and-drop builder for your custom forms. Every signature is timestamped, stored securely, and legally binding.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Finger signature on any touch screen', C.green],
                ['6 built-in forms + unlimited custom forms', C.green],
                ['Timestamp, IP, and date recorded', C.green],
                ['Stored in your EHR — no paper trail', C.green],
                ['Admin form builder — no developer needed', C.cyan],
              ].map(([text, color]) => (
                <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.muted }}>
                  <span style={{ color: color as string, flexShrink: 0 }}>✓</span>{text}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', icon: '📅', title: 'Patient Books Appointment', desc: 'Staff books the appointment in PatientTracForge. The system automatically generates a secure 48-hour intake link.', color: C.gold },
    { n: '02', icon: '📧', title: 'Patient Receives Link', desc: 'Patient gets an email or SMS with their personal intake link. No app download, no account creation — just click and go.', color: C.cyan },
    { n: '03', icon: '📱', title: 'Patient Completes Profile', desc: 'Patient fills out all 13 sections on their phone, tablet, or computer. Progress auto-saves. They can finish in multiple sessions.', color: C.green },
    { n: '04', icon: '⚡', title: 'Data Syncs Instantly', desc: "The moment they submit, their complete profile appears in your scheduling app. Providers see everything before the patient walks in.", color: C.amber },
    { n: '05', icon: '🏥', title: 'Zero Paperwork at Visit', desc: 'No clipboards. No manual data entry. Your staff greets the patient, verifies ID, and gets straight to care.', color: '#a78bfa' },
  ]

  return (
    <section id="how" style={{ background: C.navy900, padding: '100px 24px', borderTop: `1px solid rgba(201,169,110,0.08)`, borderBottom: `1px solid rgba(201,169,110,0.08)` }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: C.cyan, letterSpacing: '0.15em', marginBottom: 16 }}>✦ HOW IT WORKS</div>
          <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: C.text, lineHeight: 1.1 }}>
            From booking to bedside<br />
            <span style={{ color: C.cyan }}>in five steps.</span>
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => {
            const { ref, inView } = useInView(0.2)
            return (
              <div key={i} ref={ref} style={{ display: 'flex', gap: 32, alignItems: 'flex-start', opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-20px)', transition: `all 0.5s ${i * 100}ms`, paddingBottom: i < steps.length - 1 ? 40 : 0 }}>
                {/* Left — number + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${step.color}15`, border: `2px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 16, color: step.color }}>
                    {step.n}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 40, background: `linear-gradient(${step.color}40, transparent)`, marginTop: 8 }} />
                  )}
                </div>
                {/* Right — content */}
                <div style={{ paddingTop: 12, paddingBottom: i < steps.length - 1 ? 32 : 0 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                  <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 22, color: C.text, marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 580 }}>{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Comparison ────────────────────────────────────────────────────────────
function Comparison() {
  const rows = [
    { feature: 'Patient completes intake before visit',   us: true,    paper: false,       other: false         },
    { feature: 'AI assistant answers patient questions',  us: true,    paper: false,       other: false         },
    { feature: 'Voice-to-text input (speak answers)',     us: true,    paper: false,       other: false         },
    { feature: 'E-signature consent forms',               us: true,    paper: false,       other: true          },
    { feature: 'Custom consent form builder',             us: true,    paper: false,       other: '⚠️ Extra cost'},
    { feature: 'Direct EHR database sync',                us: true,    paper: false,       other: '⚠️ API'      },
    { feature: 'Trilingual EN/ES/FR',                     us: true,    paper: false,       other: false         },
    { feature: 'Mobile-first (no pinch-to-zoom)',         us: true,    paper: false,       other: '⚠️ Partial'  },
    { feature: 'Token link (no patient account needed)',  us: true,    paper: true,        other: false         },
    { feature: '14-day free trial',                       us: true,    paper: false,       other: '⚠️ Demo only'},
    { feature: 'Starting price',                          us: 'FREE',  paper: '~$2/form',  other: '$300+/mo'    },
  ]

  return (
    <section style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: C.gold, letterSpacing: '0.15em', marginBottom: 16 }}>✦ COMPARISON</div>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(32px,5vw,48px)', color: C.text, lineHeight: 1.1 }}>
          Why practices choose<br /><span style={{ color: C.gold }}>PatientTrac over everything else.</span>
        </h2>
      </div>

      <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.12)`, borderRadius: 14, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: C.navy700, padding: '16px 24px', gap: 12 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.1em' }}>FEATURE</div>
          {[['PatientTrac', C.gold], ['Paper Forms', C.subtle], ['Competitors', C.subtle]].map(([label, color]) => (
            <div key={label as string} style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: color as string, letterSpacing: '0.1em', textAlign: 'center' }}>{label}</div>
          ))}
        </div>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 24px', gap: 12, borderTop: `1px solid rgba(201,169,110,0.06)`, background: i % 2 === 0 ? 'transparent' : 'rgba(201,169,110,0.02)', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: C.text }}>{row.feature}</div>
            {[row.us, row.paper, row.other].map((val, j) => (
              <div key={j} style={{ textAlign: 'center', fontSize: 13 }}>
                {val === true ? <span style={{ color: C.green, fontWeight: 700 }}>✓</span>
                  : val === false ? <span style={{ color: C.subtle }}>✗</span>
                    : <span style={{ color: j === 0 ? C.gold : C.muted, fontFamily: 'DM Mono,monospace', fontSize: 11 }}>{val}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    { quote: "We cut front desk time by 40 minutes per day. Patients love the link — they do it while watching TV the night before.", name: 'Dr. Sarah M.', role: 'Family Medicine, Miami FL', initials: 'SM', color: C.gold },
    { quote: "Our Spanish-speaking patients finally feel respected. The trilingual support alone made this worth every penny.", name: 'Dr. Carlos R.', role: 'Internal Medicine, Houston TX', initials: 'CR', color: C.cyan },
    { quote: "The intake data goes straight into the AI billing tool. We're catching codes we used to miss. It's paid for itself.", name: 'Jennifer L.', role: 'Practice Manager, Atlanta GA', initials: 'JL', color: C.green },
  ]

  return (
    <section style={{ background: C.navy900, padding: '100px 24px', borderTop: `1px solid rgba(201,169,110,0.08)` }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: C.gold, letterSpacing: '0.15em', marginBottom: 16 }}>✦ WHAT PRACTICES SAY</div>
          <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(28px,4vw,44px)', color: C.text }}>
            Real results from real practices.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 12, padding: 28, position: 'relative' }}>
              <div style={{ fontSize: 32, color: `${t.color}40`, fontFamily: 'Georgia,serif', lineHeight: 1, marginBottom: 16 }}>"</div>
              <p style={{ color: C.text, fontSize: 15, lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${t.color}20`, border: `1px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14, color: t.color }}>{t.initials}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(201,169,110,0.07) 0%, transparent 70%)', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: C.gold, letterSpacing: '0.15em', marginBottom: 20 }}>✦ GET STARTED TODAY</div>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(36px,6vw,64px)', color: C.text, lineHeight: 1.05, marginBottom: 20 }}>
          Ready to eliminate<br /><span style={{ color: C.gold }}>paper intake forever?</span>
        </h2>
        <p style={{ color: C.muted, fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
          14-day free trial. Setup in under 10 minutes. No credit card required. Cancel anytime.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/pricing" style={{ background: C.gold, color: C.navy950, padding: '18px 40px', borderRadius: 8, fontSize: 17, fontWeight: 700, fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.05em', textDecoration: 'none', boxShadow: `0 8px 40px rgba(201,169,110,0.3)`, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 48px rgba(201,169,110,0.4)` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 40px rgba(201,169,110,0.3)` }}>
            START FREE TRIAL →
          </a>
          <a href="mailto:sales@patienttrac.com" style={{ border: `1px solid ${C.subtle}`, color: C.muted, padding: '18px 32px', borderRadius: 8, fontSize: 15, textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.subtle; e.currentTarget.style.color = C.muted }}>
            Talk to Sales
          </a>
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          {['✓ HIPAA Compliant', '✓ No contract', '✓ Cancel anytime', '✓ Free onboarding'].map(item => (
            <span key={item} style={{ fontSize: 13, color: C.subtle, fontFamily: 'DM Mono,monospace' }}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: C.navy900, borderTop: `1px solid rgba(201,169,110,0.1)`, padding: '56px 24px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 20, color: C.gold, marginBottom: 12 }}>PatientTrac</div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>HIPAA-compliant patient intake platform for modern medical practices.</p>
            <div style={{ fontSize: 11, color: C.subtle, fontFamily: 'DM Mono,monospace' }}>🔒 HIPAA · BAA · 256-bit SSL</div>
          </div>
          {/* Product */}
          <div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.1em', marginBottom: 16 }}>PRODUCT</div>
            {[['Features', '#features'], ['How It Works', '#how'], ['Pricing', '/pricing'], ['PatientTracForge', 'https://patienttracforge.com']].map(([label, href]) => (
              <a key={label} href={href} style={{ display: 'block', fontSize: 14, color: C.subtle, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.subtle}>
                {label}
              </a>
            ))}
          </div>
          {/* Legal */}
          <div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.1em', marginBottom: 16 }}>LEGAL</div>
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['HIPAA Notice', '/hipaa'], ['Cookie Policy', '/cookies']].map(([label, href]) => (
              <a key={label} href={href} style={{ display: 'block', fontSize: 14, color: C.subtle, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.subtle}>
                {label}
              </a>
            ))}
          </div>
          {/* Contact */}
          <div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.1em', marginBottom: 16 }}>CONTACT</div>
            {[
              ['support@patienttrac.com', 'mailto:support@patienttrac.com'],
              ['sales@patienttrac.com', 'mailto:sales@patienttrac.com'],
              ['Contact Form', '/contact'],
            ].map(([label, href]) => (
              <a key={label} href={href} style={{ display: 'block', fontSize: 13, color: C.subtle, textDecoration: 'none', marginBottom: 10, fontFamily: label.includes('@') ? 'DM Mono,monospace' : 'DM Sans,sans-serif', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.subtle}>
                {label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid rgba(201,169,110,0.08)`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: C.subtle, fontFamily: 'DM Mono,monospace' }}>© {new Date().getFullYear()} PATIENTTRAC CORP · ALL RIGHTS RESERVED</div>
          <div style={{ fontSize: 12, color: C.subtle }}>Made for healthcare. Built with ❤️ in Miami.</div>
        </div>
      </div>
    </footer>
  )
}

// ── Main export ───────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ minHeight: '100dvh', background: C.navy950, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
      <Nav />
      <Hero />
      <StatsBar />
      <Features />
      <PowerFeatures />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}
