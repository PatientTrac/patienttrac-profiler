import { useState } from 'react'
import type { Lang } from '../types'

const C = {
  navy950: '#020a14', navy900: '#060e1c', navy800: '#0a1628', navy700: '#0f2040',
  gold: '#c9a96e', goldLt: '#e8cc9a', text: '#e8eaf0', muted: '#8a9bc0',
  subtle: '#3a4a6a', cyan: '#00d4ff', green: '#4ade80', red: '#ff6b6b', amber: '#fbbf24',
}

// ── HubSpot Forms API — creates contact directly via HubSpot Forms endpoint ──
// Replace PORTAL_ID and FORM_GUID with your HubSpot values
const HUBSPOT_PORTAL_ID  = '51168696'
const HUBSPOT_FORM_GUID  = 'patienttrac-contact-form' // Replace with real form GUID from HubSpot

async function submitToHubSpot(data: ContactForm): Promise<{ ok: boolean; error?: string }> {
  // HubSpot Forms API v3
  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`

  const payload = {
    fields: [
      { objectTypeId: '0-1', name: 'firstname',   value: data.firstName },
      { objectTypeId: '0-1', name: 'lastname',    value: data.lastName },
      { objectTypeId: '0-1', name: 'email',       value: data.email },
      { objectTypeId: '0-1', name: 'phone',       value: data.phone },
      { objectTypeId: '0-1', name: 'company',     value: data.practice },
      { objectTypeId: '0-1', name: 'message',     value: data.message },
      { objectTypeId: '0-1', name: 'hs_lead_status', value: 'NEW' },
      { objectTypeId: '0-1', name: 'jobtitle',    value: data.role },
      { objectTypeId: '0-1', name: 'hs_analytics_source', value: 'patienttracprofiler.com' },
    ],
    context: {
      pageUri:  'https://patienttracprofiler.com/contact',
      pageName: 'PatientTrac Profiler — Contact',
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: 'I agree to allow PatientTrac Corp to store and process my personal data.',
        communications: [{
          value: true,
          subscriptionTypeId: 999,
          text: 'I agree to receive marketing communications from PatientTrac.',
        }],
      },
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) return { ok: true }
    const err = await res.json().catch(() => ({}))
    return { ok: false, error: err?.message ?? `HTTP ${res.status}` }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

interface ContactForm {
  firstName: string; lastName: string; email: string; phone: string
  practice: string; role: string; interest: string; message: string; consent: boolean
}

const EMPTY: ContactForm = {
  firstName: '', lastName: '', email: '', phone: '',
  practice: '', role: '', interest: '', message: '', consent: false,
}

const INTERESTS = [
  'Patient Intake (Profiler)',
  'PatientTracForge Scheduling',
  'Revela (Plastic Surgery)',
  'Mental Health Module',
  'Pricing & Plans',
  'HIPAA / Compliance',
  'Enterprise / Custom',
  'General Question',
]

const ROLES = [
  'Practice Owner / Physician',
  'Practice Manager',
  'Front Desk / Admin',
  'Billing Specialist',
  'IT / Tech',
  'Other',
]

export default function Contact() {
  const [lang, setLang] = useState<Lang>('en')
  const [form, setForm] = useState<ContactForm>({ ...EMPTY })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: keyof ContactForm, val: string | boolean) {
    setForm(f => ({ ...f, [field]: val }))
  }

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.email || !form.message || !form.consent) return
    setStatus('submitting')
    const result = await submitToHubSpot(form)
    if (result.ok) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMsg(result.error ?? 'Unknown error')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: C.navy950, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: C.navy900, borderBottom: `1px solid rgba(201,169,110,0.12)`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 20, color: C.gold, textDecoration: 'none' }}>PatientTrac</a>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="/" style={{ color: C.muted, textDecoration: 'none', fontSize: 14 }}>Home</a>
          <a href="/pricing" style={{ color: C.muted, textDecoration: 'none', fontSize: 14 }}>Pricing</a>
          <a href="/pricing" style={{ background: C.gold, color: C.navy950, padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700, fontFamily: 'Rajdhani,sans-serif', textDecoration: 'none' }}>START FREE TRIAL</a>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: C.navy900, borderBottom: `1px solid rgba(201,169,110,0.08)`, padding: '56px 24px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4, padding: '4px 12px', fontSize: 10, fontFamily: 'DM Mono,monospace', color: C.cyan, letterSpacing: '0.1em', marginBottom: 20 }}>CONTACT US</div>
        <h1 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: C.text, marginBottom: 14 }}>Let's talk about your practice</h1>
        <p style={{ color: C.muted, fontSize: 17, maxWidth: 520, margin: '0 auto' }}>Sales, support, partnerships, or just a question — we respond within one business day.</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>

        {/* ── Left — Info ── */}
        <div>
          <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 26, color: C.text, marginBottom: 28 }}>Get in touch</h2>

          {[
            { icon: '📧', label: 'Sales', value: 'sales@patienttrac.com', href: 'mailto:sales@patienttrac.com', desc: 'Pricing, demos, onboarding' },
            { icon: '🛟', label: 'Support', value: 'support@patienttrac.com', href: 'mailto:support@patienttrac.com', desc: 'Technical help, platform issues' },
            { icon: '⚖️', label: 'Legal & Privacy', value: 'legal@patienttrac.com', href: 'mailto:legal@patienttrac.com', desc: 'HIPAA, BAA, compliance questions' },
            { icon: '🔒', label: 'Privacy Office', value: 'privacy@patienttrac.com', href: 'mailto:privacy@patienttrac.com', desc: 'Data requests, privacy concerns' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24, padding: 16, background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10 }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</div>
                <a href={item.href} style={{ color: C.gold, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{item.value}</a>
                <div style={{ fontSize: 12, color: C.subtle, marginTop: 3 }}>{item.desc}</div>
              </div>
            </div>
          ))}

          {/* Response time */}
          <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, padding: '14px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ color: C.green, fontSize: 18 }}>⚡</span>
            <div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.green, letterSpacing: '0.08em' }}>RESPONSE TIME</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>We respond to all inquiries within 1 business day. Sales inquiries same-day when possible.</div>
            </div>
          </div>

          {/* Links */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.1em', marginBottom: 14 }}>HELPFUL LINKS</div>
            {[
              ['Pricing & Plans', '/pricing'],
              ['Privacy Policy', '/privacy'],
              ['Terms of Service', '/terms'],
              ['HIPAA Notice', '/hipaa'],
              ['PatientTracForge', 'https://patienttracforge.com'],
            ].map(([label, href]) => (
              <a key={label} href={href} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.subtle, textDecoration: 'none', fontSize: 14, marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = C.gold}
                onMouseLeave={e => e.currentTarget.style.color = C.subtle}>
                <span style={{ color: C.subtle }}>→</span> {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Right — Form ── */}
        <div>
          {status === 'success' ? (
            <div style={{ background: C.navy800, border: `1px solid rgba(74,222,128,0.2)`, borderRadius: 12, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 26, color: C.green, marginBottom: 12 }}>Message Received!</h3>
              <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
                Thanks for reaching out, <strong style={{ color: C.text }}>{form.firstName}</strong>. We've added you to our CRM and someone from our team will be in touch within one business day.
              </p>
              <a href="/" style={{ display: 'inline-block', background: C.gold, color: C.navy950, padding: '12px 28px', borderRadius: 8, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', letterSpacing: '0.04em' }}>← BACK TO HOME</a>
            </div>
          ) : (
            <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.12)`, borderRadius: 12, padding: 32 }}>
              <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 22, color: C.text, marginBottom: 24 }}>Send us a message</h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>

                <Field label="First Name" required half>
                  <input className="hud-input" value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Maria" autoComplete="given-name" />
                </Field>

                <Field label="Last Name" required half>
                  <input className="hud-input" value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="García" autoComplete="family-name" />
                </Field>

                <Field label="Work Email" required>
                  <input className="hud-input" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@yourpractice.com" autoComplete="email" inputMode="email" />
                </Field>

                <Field label="Phone" half>
                  <input className="hud-input" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(305) 555-0100" inputMode="tel" />
                </Field>

                <Field label="Practice / Organization" half>
                  <input className="hud-input" value={form.practice} onChange={e => update('practice', e.target.value)} placeholder="Miami Medical Group" autoComplete="organization" />
                </Field>

                <Field label="Your Role" half>
                  <select className="hud-input" value={form.role} onChange={e => update('role', e.target.value)}>
                    <option value="">— Select —</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>

                <Field label="I'm interested in" half>
                  <select className="hud-input" value={form.interest} onChange={e => update('interest', e.target.value)}>
                    <option value="">— Select —</option>
                    {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>

                <Field label="Message" required>
                  <textarea className="hud-input" rows={4} value={form.message} onChange={e => update('message', e.target.value)} placeholder="Tell us about your practice, how many providers you have, and what you're looking for..." style={{ minHeight: 110 }} />
                </Field>

                {/* Consent */}
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" className="hud-checkbox" style={{ marginTop: 2 }} checked={form.consent} onChange={e => update('consent', e.target.checked)} />
                    <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                      I agree to allow PatientTrac Corp to store and process my personal data, and to receive communications about products and services. See our <a href="/privacy" style={{ color: C.gold }}>Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                {status === 'error' && (
                  <div style={{ flex: '1 1 100%', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: C.red }}>
                    ⚠️ {errorMsg || 'Something went wrong. Please email us directly at sales@patienttrac.com'}
                  </div>
                )}

                <div style={{ flex: '1 1 100%' }}>
                  <button
                    onClick={handleSubmit}
                    disabled={status === 'submitting' || !form.firstName || !form.email || !form.message || !form.consent}
                    className="btn-gold"
                    style={{ width: '100%', padding: '14px 0', fontSize: 16, opacity: (!form.firstName || !form.email || !form.message || !form.consent) ? 0.5 : 1 }}>
                    {status === 'submitting' ? '⏳ Sending...' : 'Send Message →'}
                  </button>
                  <div style={{ textAlign: 'center', fontSize: 11, color: C.subtle, fontFamily: 'DM Mono,monospace', marginTop: 10 }}>
                    🔒 YOUR DATA IS SECURE · NEVER SOLD · HIPAA COMPLIANT
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid rgba(201,169,110,0.1)`, padding: '24px', textAlign: 'center', fontSize: 12, color: C.subtle, fontFamily: 'DM Mono,monospace' }}>
        © {new Date().getFullYear()} PATIENTTRAC CORP · HIPAA COMPLIANT · support@patienttrac.com
      </div>
    </div>
  )
}

function Field({ label, required, half, children }: { label: string; required?: boolean; half?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ flex: half ? '1 1 calc(50% - 8px)' : '1 1 100%', minWidth: 0 }}>
      <label className="field-label">{label}{required && <span style={{ color: '#ff6b6b', marginLeft: 3 }}>*</span>}</label>
      {children}
    </div>
  )
}
