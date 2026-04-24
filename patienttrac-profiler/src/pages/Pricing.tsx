import { useState } from 'react'
import { TIERS, redirectToCheckout } from '../lib/stripe'
import type { PricingTier } from '../lib/stripe'

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  navy950: '#020a14', navy900: '#060e1c', navy800: '#0a1628', navy700: '#0f2040',
  gold: '#c9a96e', goldLt: '#e8cc9a', goldDk: '#9a7a4a',
  cyan: '#00d4ff', text: '#e8eaf0', muted: '#8a9bc0', subtle: '#3a4a6a',
  green: '#4ade80', red: '#ff6b6b', amber: '#fbbf24',
}

const FAQS = [
  { q: 'Is there a free trial?', a: 'Yes — Profiler Pro and Enterprise both include a 14-day free trial. No credit card required to start.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel any time from your admin dashboard. No cancellation fees, no lock-in.' },
  { q: 'Is PatientTrac Profiler HIPAA compliant?', a: 'Yes. All data is encrypted at rest and in transit. We sign a Business Associate Agreement (BAA) with all paid plans.' },
  { q: 'Does it work without PatientTracForge?', a: 'Yes — the Standalone plan works independently. The Included/Pro/Enterprise plans sync directly with PatientTracForge scheduling for the best experience.' },
  { q: 'What languages are supported?', a: 'English, Spanish (Español), and French (Français) are fully supported across all intake forms. More languages available on Enterprise.' },
  { q: 'How does document upload work?', a: 'Patients can upload photos or PDFs of insurance cards, photo IDs, and medical records directly from their phone. Files are stored securely in your Supabase project.' },
  { q: 'Can I customize the intake forms?', a: 'The Enterprise plan includes a custom form builder. Pro uses our standard 8-step intake which covers 95% of practice needs.' },
  { q: 'How do e-signatures work?', a: 'Patients sign directly on their phone screen using a finger. Signatures are stored as secure, timestamped images alongside the consent form.' },
]

const COMPARE_MARKET = [
  { name: 'Phreesia',        price: '$500–$1,500/mo', features: '✓ Intake  ✓ Insurance  ✗ Scheduling sync' },
  { name: 'Klara',           price: '$300–$800/mo',   features: '✓ Intake  ✗ E-signature  ✗ AI features' },
  { name: 'IntakeQ',         price: '$59–$199/mo',    features: '✓ Forms  ✓ E-sign  ✗ EHR sync' },
  { name: 'PatientTrac Pro', price: '$99/mo',         features: '✓ Intake  ✓ E-sign  ✓ EHR sync  ✓ AI' },
]

export default function Pricing() {
  const [annual,    setAnnual]    = useState(false)
  const [loading,   setLoading]   = useState<string | null>(null)
  const [openFaq,   setOpenFaq]   = useState<number | null>(null)
  const [email,     setEmail]     = useState('')
  const [showEmail, setShowEmail] = useState<string | null>(null)

  async function handleCta(tier: PricingTier) {
    if (!tier.priceIdMonthly) {
      window.location.href = 'https://patienttracforge.com'
      return
    }
    if (!email && tier.id !== 'included') {
      setShowEmail(tier.id)
      return
    }
    setLoading(tier.id)
    const priceId = annual ? tier.priceIdAnnual : tier.priceIdMonthly
    await redirectToCheckout(priceId, email)
    setLoading(null)
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.navy950, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── Nav ── */}
      <nav style={{ background: C.navy900, borderBottom: `1px solid rgba(201,169,110,0.12)`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 20, color: C.gold, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🏥</span> PatientTrac
        </a>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="/" style={{ color: C.muted, textDecoration: 'none', fontSize: 14 }}>Home</a>
          <a href="/pricing" style={{ color: C.gold, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Pricing</a>
          <a href="/contact" style={{ color: C.muted, textDecoration: 'none', fontSize: 14 }}>Contact</a>
          <a href="https://patienttracforge.com" target="_blank" rel="noreferrer"
            style={{ background: C.gold, color: C.navy950, padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700, fontFamily: 'Rajdhani,sans-serif', textDecoration: 'none', letterSpacing: '0.04em' }}>
            SCHEDULING APP →
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: '72px 24px 48px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: C.gold, fontFamily: 'DM Mono,monospace', letterSpacing: '0.08em', marginBottom: 24 }}>
          ✦ TRANSPARENT PRICING · NO HIDDEN FEES
        </div>
        <h1 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(36px, 6vw, 58px)', color: C.text, lineHeight: 1.1, marginBottom: 20 }}>
          Simple pricing for<br />
          <span style={{ color: C.gold }}>every practice size</span>
        </h1>
        <p style={{ color: C.muted, fontSize: 18, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
          Start free with PatientTracForge. Upgrade when you need document uploads, e-signatures, and CRM integrations.
        </p>

        {/* ── Monthly / Annual toggle ── */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: C.navy800, border: `1px solid ${C.subtle}`, borderRadius: 30, padding: '6px 8px' }}>
          <button onClick={() => setAnnual(false)} style={{
            background: !annual ? C.gold : 'transparent',
            color: !annual ? C.navy950 : C.muted,
            border: 'none', borderRadius: 24, padding: '8px 20px',
            fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.04em',
          }}>MONTHLY</button>
          <button onClick={() => setAnnual(true)} style={{
            background: annual ? C.gold : 'transparent',
            color: annual ? C.navy950 : C.muted,
            border: 'none', borderRadius: 24, padding: '8px 20px',
            fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.04em',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ANNUAL
            <span style={{ background: C.green, color: C.navy950, fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>SAVE 20%</span>
          </button>
        </div>
      </div>

      {/* ── Pricing Cards ── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, alignItems: 'start' }}>
        {TIERS.map(tier => {
          const price    = annual ? tier.priceAnnual : tier.priceMonthly
          const isLoading = loading === tier.id
          const needEmail = showEmail === tier.id

          return (
            <div key={tier.id} style={{
              background:   tier.highlighted ? `linear-gradient(135deg, ${C.navy800}, rgba(201,169,110,0.06))` : C.navy800,
              border:       `1px solid ${tier.highlighted ? C.gold : 'rgba(201,169,110,0.12)'}`,
              borderRadius: 14,
              padding:      28,
              position:     'relative',
              boxShadow:    tier.highlighted ? `0 0 40px rgba(201,169,110,0.12)` : 'none',
              transform:    tier.highlighted ? 'translateY(-8px)' : 'none',
              transition:   'transform 0.2s',
            }}>
              {/* Badge */}
              {tier.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: tier.highlighted ? C.gold : C.cyan, color: C.navy950, fontSize: 11, fontWeight: 700, fontFamily: 'Rajdhani,sans-serif', padding: '4px 14px', borderRadius: 12, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {tier.badge}
                </div>
              )}

              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 20, color: tier.highlighted ? C.gold : C.text, marginBottom: 6 }}>
                  {tier.name}
                </div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{tier.description}</div>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid rgba(201,169,110,0.1)` }}>
                {price === 0 ? (
                  <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 40, color: C.green }}>
                    FREE
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 48, color: C.text, lineHeight: 1 }}>
                      ${price}
                    </span>
                    <span style={{ color: C.muted, fontSize: 14, marginBottom: 8 }}>/mo</span>
                  </div>
                )}
                {annual && price > 0 && (
                  <div style={{ fontSize: 12, color: C.green, marginTop: 4, fontFamily: 'DM Mono,monospace' }}>
                    ✓ Billed annually · Save ${(((tier.priceMonthly - price) * 12))}/ yr
                  </div>
                )}
                {!annual && price > 0 && (
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontFamily: 'DM Mono,monospace' }}>
                    or ${tier.priceAnnual}/mo billed annually
                  </div>
                )}
              </div>

              {/* Email capture for checkout */}
              {needEmail && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Enter your work email to continue:</div>
                  <input
                    type="email"
                    className="hud-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@practice.com"
                    style={{ marginBottom: 8 }}
                  />
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => handleCta(tier)}
                disabled={isLoading || (needEmail && !email)}
                style={{
                  width: '100%', padding: '13px 0',
                  background: tier.highlighted ? C.gold : tier.id === 'included' ? 'transparent' : 'rgba(201,169,110,0.12)',
                  border: `1px solid ${tier.highlighted ? C.gold : C.subtle}`,
                  borderRadius: 8,
                  color: tier.highlighted ? C.navy950 : C.gold,
                  fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15,
                  letterSpacing: '0.05em', cursor: isLoading ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? '⏳ Redirecting...' : tier.cta}
              </button>

              {tier.id !== 'included' && (
                <div style={{ textAlign: 'center', fontSize: 11, color: C.subtle, marginTop: 8, fontFamily: 'DM Mono,monospace' }}>
                  14-DAY FREE TRIAL · NO CARD REQUIRED
                </div>
              )}

              {/* Features */}
              <ul style={{ margin: '20px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tier.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: i === 0 && f.includes('Everything') ? C.muted : C.text }}>
                    <span style={{ color: C.green, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontStyle: i === 0 && f.includes('Everything') ? 'italic' : 'normal' }}>{f}</span>
                  </li>
                ))}
                {tier.notIncluded.map((f, i) => (
                  <li key={`no-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: C.subtle }}>
                    <span style={{ color: C.subtle, flexShrink: 0, marginTop: 1 }}>✗</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* ── Market Comparison ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 34, color: C.text, marginBottom: 12 }}>
            How we compare
          </h2>
          <p style={{ color: C.muted, fontSize: 16 }}>PatientTrac delivers more for a fraction of the cost</p>
        </div>

        <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.12)`, borderRadius: 12, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '14px 24px', background: C.navy700, borderBottom: `1px solid rgba(201,169,110,0.1)` }}>
            {['Product', 'Monthly Cost', 'What\'s Included'].map(h => (
              <div key={h} style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>{h}</div>
            ))}
          </div>
          {COMPARE_MARKET.map((row, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              padding: '16px 24px',
              borderBottom: i < COMPARE_MARKET.length - 1 ? `1px solid rgba(201,169,110,0.06)` : 'none',
              background: row.name.includes('PatientTrac') ? 'rgba(201,169,110,0.05)' : 'transparent',
            }}>
              <div style={{ fontWeight: row.name.includes('PatientTrac') ? 700 : 400, color: row.name.includes('PatientTrac') ? C.gold : C.text, fontSize: 14 }}>{row.name}</div>
              <div style={{ fontSize: 14, color: row.name.includes('PatientTrac') ? C.green : C.muted, fontFamily: 'DM Mono,monospace' }}>{row.price}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{row.features}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 34, color: C.text, textAlign: 'center', marginBottom: 40 }}>
          Frequently asked questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: C.navy800, border: `1px solid ${openFaq === i ? 'rgba(201,169,110,0.3)' : 'rgba(201,169,110,0.1)'}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: '100%', padding: '18px 20px', background: 'none', border: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', textAlign: 'left', gap: 16,
              }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{faq.q}</span>
                <span style={{ color: C.gold, fontSize: 20, flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy800}, rgba(201,169,110,0.06))`, border: `1px solid rgba(201,169,110,0.15)`, margin: '0 24px 80px', borderRadius: 16, padding: '48px 32px', textAlign: 'center', maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 32, color: C.text, marginBottom: 14 }}>
          Ready to modernize your patient intake?
        </h2>
        <p style={{ color: C.muted, fontSize: 16, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
          Start your 14-day free trial. No credit card required. Setup takes under 10 minutes.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => handleCta(TIERS[1])} className="btn-gold" style={{ padding: '14px 32px', fontSize: 16 }}>
            Start Free Trial →
          </button>
          <a href="mailto:sales@patienttrac.com" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 28px', border: `1px solid ${C.subtle}`, borderRadius: 8, color: C.muted, textDecoration: 'none', fontSize: 15, fontFamily: 'DM Sans,sans-serif' }}>
            Talk to Sales
          </a>
        </div>
        <p style={{ fontSize: 12, color: C.subtle, marginTop: 16, fontFamily: 'DM Mono,monospace' }}>
          HIPAA COMPLIANT · 256-BIT ENCRYPTION · BAA INCLUDED ON ALL PAID PLANS
        </p>
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid rgba(201,169,110,0.1)`, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: C.gold, marginBottom: 12 }}>PatientTrac</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['HIPAA', '/hipaa'], ['Contact', '/contact']].map(([label, href]) => (
            <a key={label} href={href} style={{ color: C.muted, textDecoration: 'none', fontSize: 13 }}>{label}</a>
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.subtle, fontFamily: 'DM Mono,monospace' }}>
          © {new Date().getFullYear()} PATIENTTRAC CORP · HIPAA COMPLIANT · support@patienttrac.com
        </div>
      </footer>
    </div>
  )
}
