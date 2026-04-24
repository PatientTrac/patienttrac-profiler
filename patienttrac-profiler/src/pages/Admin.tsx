import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

const C = {
  navy950: '#020a14', navy900: '#060e1c', navy800: '#0a1628', navy700: '#0f2040',
  gold: '#c9a96e', goldLt: '#e8cc9a', text: '#e8eaf0', muted: '#8a9bc0',
  subtle: '#3a4a6a', cyan: '#00d4ff', green: '#4ade80', red: '#ff6b6b', amber: '#fbbf24',
}

interface Patient {
  patient_id:         number
  first_name:         string
  last_name:          string
  email:              string
  cell_phone:         string
  birth:              string
  insert_date:        string
  status:             string
  preferred_language: string
  city:               string
  state_province:     string
}

interface Intake {
  patient_id:     number
  submitted_at:   string
  consent_signed: boolean
  chief_complaint: string
  status:         string
}

type AuthStep = 'credentials' | 'totp' | 'dashboard'

export default function Admin() {
  const [authStep,  setAuthStep]  = useState<AuthStep>('credentials')
  const [user,      setUser]      = useState<any>(null)
  const [loading,   setLoading]   = useState(true)

  // Credential fields
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [totp,     setTotp]     = useState('')
  const [authErr,  setAuthErr]  = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  // Dashboard data
  const [patients,    setPatients]    = useState<Patient[]>([])
  const [intakes,     setIntakes]     = useState<Intake[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [search,      setSearch]      = useState('')
  const [selected,    setSelected]    = useState<Patient | null>(null)
  const [tab,         setTab]         = useState<'all' | 'today' | 'pending'>('all')

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setAuthStep('dashboard')
      }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setAuthStep('dashboard')
      } else {
        setUser(null)
        setAuthStep('credentials')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (authStep === 'dashboard') fetchData()
  }, [authStep])

  // ── Step 1: Email + Password ────────────────────────────────────────────
  async function handleCredentials() {
    if (!email || !password) return
    setAuthBusy(true)
    setAuthErr('')
    try {
      // Check member exists in saas.org_members and has MFA required
      const { data: member } = await supabase
        .schema('saas')
        .from('org_members')
        .select('user_id, role, mfa_enabled, mfa_secret')
        .eq('email', email.toLowerCase())
        .single()

      if (!member) {
        setAuthErr('No staff account found for this email address.')
        setAuthBusy(false)
        return
      }

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setAuthErr(error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message)
        setAuthBusy(false)
        return
      }

      // If MFA is enabled, require TOTP next
      if (member.mfa_enabled) {
        // Sign out temporarily — only complete session after TOTP verified
        await supabase.auth.signOut()
        setUser({ ...data.user, _memberId: member.user_id, _role: member.role })
        setAuthStep('totp')
      } else {
        // No MFA — log in directly (non-admin roles)
        setUser(data.user)
        setAuthStep('dashboard')
      }
    } catch (e: any) {
      setAuthErr('Login failed. Please try again.')
    }
    setAuthBusy(false)
  }

  // ── Step 2: TOTP Verification ───────────────────────────────────────────
  async function handleTotp() {
    if (totp.length !== 6) return
    setAuthBusy(true)
    setAuthErr('')
    try {
      // Verify TOTP against saas.org_members using the verify_totp function
      const { data, error } = await supabase
        .schema('saas')
        .rpc('verify_totp_and_login', {
          p_email:    email.toLowerCase(),
          p_password: password,
          p_token:    totp,
        })

      if (error || !data?.success) {
        setAuthErr('Invalid authenticator code. Please try again.')
        setTotp('')
        setAuthBusy(false)
        return
      }

      // Re-authenticate now that TOTP is verified
      const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr || !session) {
        setAuthErr('Authentication failed after TOTP. Please try again.')
        setAuthBusy(false)
        return
      }

      // Log the MFA auth event
      await supabase.schema('saas').from('auth_audit_log').insert({
        user_id:    session.user.id,
        org_id:     '00000000-0000-0000-0000-000000000001',
        event_type: 'mfa_login',
        ip_address: null,
        user_agent: navigator.userAgent,
        success:    true,
        metadata:   { source: 'patienttracprofiler.com/admin' },
      })

      setUser(session.user)
      setAuthStep('dashboard')
    } catch (e: any) {
      setAuthErr('Verification failed. Please try again.')
    }
    setAuthBusy(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setPatients([])
    setIntakes([])
    setSelected(null)
    setEmail('')
    setPassword('')
    setTotp('')
    setAuthStep('credentials')
  }

  // ── Data fetch ──────────────────────────────────────────────────────────
  async function fetchData() {
    setDataLoading(true)
    try {
      const [{ data: pData }, { data: iData }] = await Promise.all([
        supabase.schema('cr').from('patient')
          .select('patient_id,first_name,last_name,email,cell_phone,birth,insert_date,status,preferred_language,city,state_province')
          .eq('org_id', '00000000-0000-0000-0000-000000000001')
          .order('insert_date', { ascending: false })
          .limit(200),
        supabase.schema('cr').from('patient_intake')
          .select('patient_id,submitted_at,consent_signed,chief_complaint,status')
          .eq('org_id', '00000000-0000-0000-0000-000000000001')
          .order('submitted_at', { ascending: false }),
      ])
      setPatients(pData ?? [])
      setIntakes(iData ?? [])
    } catch (e) {
      console.error('Fetch error:', e)
    } finally {
      setDataLoading(false)
    }
  }

  // ── Filter ──────────────────────────────────────────────────────────────
  const today      = new Date().toISOString().split('T')[0]
  const intakeMap  = new Map(intakes.map(i => [i.patient_id, i]))
  const filtered   = patients.filter(p => {
    const matchSearch = !search || `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search.toLowerCase())
    const intake = intakeMap.get(p.patient_id)
    if (tab === 'today')   return matchSearch && p.insert_date?.startsWith(today)
    if (tab === 'pending') return matchSearch && (!intake || intake.status !== 'completed')
    return matchSearch
  })

  const stats = {
    total:     patients.length,
    today:     patients.filter(p => p.insert_date?.startsWith(today)).length,
    completed: intakes.filter(i => i.status === 'completed').length,
    pending:   patients.length - intakes.filter(i => i.status === 'completed').length,
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100dvh', background: C.navy950, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 20, color: C.gold }}>Loading...</div>
    </div>
  )

  // ── AUTH SCREENS ────────────────────────────────────────────────────────
  if (authStep !== 'dashboard') return (
    <div style={{ minHeight: '100dvh', background: C.navy950, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 28, color: C.gold }}>PatientTrac</div>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.15em', marginTop: 4 }}>PROFILER ADMIN · STAFF LOGIN</div>
      </div>

      <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.15)`, borderRadius: 14, padding: 36, maxWidth: 420, width: '100%' }}>

        {/* ── Step 1: Credentials ── */}
        {authStep === 'credentials' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
              <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: C.text, marginBottom: 6 }}>Staff Login</h2>
              <p style={{ color: C.muted, fontSize: 14 }}>Enter your PatientTrac staff credentials</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="field-label">Email Address</label>
                <input className="hud-input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCredentials()}
                  placeholder="you@yourpractice.com"
                  autoComplete="email" inputMode="email"
                />
              </div>
              <div>
                <label className="field-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="hud-input" type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCredentials()}
                    placeholder="Your password"
                    autoComplete="current-password"
                    style={{ paddingRight: 48 }}
                  />
                  <button onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.subtle, cursor: 'pointer', fontSize: 14 }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {authErr && (
                <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: C.red }}>
                  ⚠️ {authErr}
                </div>
              )}

              <button onClick={handleCredentials} disabled={authBusy || !email || !password} className="btn-gold"
                style={{ width: '100%', padding: '13px 0', fontSize: 15, marginTop: 4, opacity: (!email || !password) ? 0.5 : 1 }}>
                {authBusy ? 'Verifying...' : 'Continue →'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: C.subtle, fontFamily: 'DM Mono,monospace' }}>
              🔒 STAFF ACCESS ONLY · HIPAA COMPLIANT
            </div>
          </>
        )}

        {/* ── Step 2: TOTP ── */}
        {authStep === 'totp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
              <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: C.text, marginBottom: 6 }}>Authenticator Code</h2>
              <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
                Open <strong style={{ color: C.gold }}>Google Authenticator</strong> on your phone and enter the 6-digit code for PatientTrac.
              </p>
            </div>

            {/* TOTP input — large digits */}
            <div style={{ marginBottom: 20 }}>
              <label className="field-label" style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>6-Digit Code</label>
              <input
                className="hud-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={totp}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setTotp(val)
                  setAuthErr('')
                  if (val.length === 6) setTimeout(() => handleTotp(), 100)
                }}
                placeholder="000000"
                autoFocus
                style={{ textAlign: 'center', fontSize: 28, letterSpacing: '0.3em', fontFamily: 'DM Mono,monospace', padding: '16px 14px' }}
              />
              <div style={{ textAlign: 'center', fontSize: 11, color: C.subtle, marginTop: 8, fontFamily: 'DM Mono,monospace' }}>
                Code refreshes every 30 seconds
              </div>
            </div>

            {authErr && (
              <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: C.red, marginBottom: 16 }}>
                ⚠️ {authErr}
              </div>
            )}

            <button onClick={handleTotp} disabled={authBusy || totp.length !== 6} className="btn-gold"
              style={{ width: '100%', padding: '13px 0', fontSize: 15, opacity: totp.length !== 6 ? 0.5 : 1 }}>
              {authBusy ? 'Verifying...' : 'Verify Code →'}
            </button>

            <button onClick={() => { setAuthStep('credentials'); setTotp(''); setAuthErr('') }}
              style={{ width: '100%', background: 'none', border: 'none', color: C.subtle, cursor: 'pointer', fontSize: 13, marginTop: 14, fontFamily: "'DM Sans',sans-serif" }}>
              ← Back to login
            </button>

            {/* Help */}
            <div style={{ marginTop: 20, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.cyan, marginBottom: 6 }}>NEED HELP?</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                If you haven't set up Google Authenticator yet, contact your admin at{' '}
                <a href="mailto:support@patienttrac.com" style={{ color: C.gold }}>support@patienttrac.com</a>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 20 }}>
        {[['← Home', '/'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([label, href]) => (
          <a key={label} href={href} style={{ color: C.subtle, textDecoration: 'none', fontSize: 13 }}>{label}</a>
        ))}
      </div>
    </div>
  )

  // ── DASHBOARD ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', background: C.navy950, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: C.navy900, borderBottom: `1px solid rgba(201,169,110,0.12)`, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: C.gold }}>PatientTrac</span>
          <span style={{ background: C.gold, color: C.navy950, fontSize: 9, padding: '2px 7px', fontFamily: 'DM Mono,monospace', letterSpacing: '0.1em' }}>PROFILER ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: C.muted, fontFamily: 'DM Mono,monospace' }}>{user?.email}</span>
          <a href="https://patienttracforge.com" target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: C.cyan, textDecoration: 'none', fontFamily: 'DM Mono,monospace' }}>
            SCHEDULING APP ↗
          </a>
          <button onClick={signOut} style={{ background: 'transparent', border: `1px solid ${C.subtle}`, color: C.muted, padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Mono,monospace' }}>
            SIGN OUT
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Patients',    value: stats.total,     color: C.gold,  icon: '👥' },
            { label: 'New Today',         value: stats.today,     color: C.cyan,  icon: '📅' },
            { label: 'Profiles Complete', value: stats.completed, color: C.green, icon: '✅' },
            { label: 'Pending Intake',    value: stats.pending,   color: C.amber, icon: '⏳' },
          ].map(s => (
            <div key={s.label} style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, padding: '18px 20px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 32, color: s.color }}>{dataLoading ? '—' : s.value}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="hud-input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..." style={{ flex: '1 1 220px', maxWidth: 340 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all', 'today', 'pending'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '8px 16px', borderRadius: 6,
                border: `1px solid ${tab === t ? C.gold : C.subtle}`,
                background: tab === t ? 'rgba(201,169,110,0.1)' : 'transparent',
                color: tab === t ? C.gold : C.muted,
                fontSize: 12, cursor: 'pointer', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase',
              }}>{t}</button>
            ))}
          </div>
          <button onClick={fetchData} style={{ background: 'transparent', border: `1px solid ${C.subtle}`, color: C.muted, padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Mono,monospace' }}>
            ↻ REFRESH
          </button>
        </div>

        {/* Table */}
        <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '12px 20px', background: C.navy700, gap: 12 }}>
            {['Patient', 'Contact', 'DOB', 'Language', 'Status'].map(h => (
              <div key={h} style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {dataLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading patient data...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No patients found.</div>
          ) : (
            filtered.slice(0, 50).map((p, i) => {
              const intake     = intakeMap.get(p.patient_id)
              const isComplete = intake?.status === 'completed'
              const isSelected = selected?.patient_id === p.patient_id
              return (
                <div key={p.patient_id}
                  onClick={() => setSelected(isSelected ? null : p)}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                    padding: '14px 20px', gap: 12, alignItems: 'center',
                    borderTop: `1px solid rgba(201,169,110,0.05)`,
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(201,169,110,0.06)' : i % 2 === 0 ? 'transparent' : 'rgba(10,22,40,0.3)',
                    transition: 'background 0.15s',
                  }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{p.first_name} {p.last_name}</div>
                    <div style={{ fontSize: 11, color: C.subtle, fontFamily: 'DM Mono,monospace', marginTop: 2 }}>#{p.patient_id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: C.muted }}>{p.email}</div>
                    <div style={{ fontSize: 12, color: C.subtle }}>{p.cell_phone}</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.birth ?? '—'}</div>
                  <div style={{ fontSize: 11, fontFamily: 'DM Mono,monospace', color: C.muted, textTransform: 'uppercase' }}>{p.preferred_language ?? 'EN'}</div>
                  <div>
                    <span style={{
                      background: isComplete ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.1)',
                      border: `1px solid ${isComplete ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.2)'}`,
                      color: isComplete ? C.green : C.amber,
                      fontSize: 10, fontFamily: 'DM Mono,monospace', padding: '3px 8px', borderRadius: 4,
                    }}>
                      {isComplete ? '✓ COMPLETE' : '⏳ PENDING'}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Detail panel */}
        {selected && (() => {
          const intake = intakeMap.get(selected.patient_id)
          return (
            <div style={{ marginTop: 20, background: C.navy800, border: `1px solid rgba(201,169,110,0.15)`, borderRadius: 12, padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 22, color: C.gold }}>
                  {selected.first_name} {selected.last_name}
                </h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href={`https://patienttracforge.com/patients/${selected.patient_id}`} target="_blank" rel="noreferrer"
                    style={{ background: C.gold, color: C.navy950, padding: '8px 16px', borderRadius: 6, fontSize: 12, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.04em' }}>
                    VIEW IN SCHEDULING →
                  </a>
                  <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: `1px solid ${C.subtle}`, color: C.muted, padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                {[
                  ['Patient ID',    `#${selected.patient_id}`],
                  ['Email',         selected.email],
                  ['Phone',         selected.cell_phone],
                  ['Date of Birth', selected.birth],
                  ['Location',      `${selected.city ?? ''}${selected.state_province ? ', ' + selected.state_province : ''}`],
                  ['Language',      selected.preferred_language],
                  ['Registered',    selected.insert_date ? new Date(selected.insert_date).toLocaleDateString() : '—'],
                  ['Intake Status', intake?.status ?? 'Not started'],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.subtle, letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, color: C.text }}>{value || '—'}</div>
                  </div>
                ))}
              </div>
              {intake?.chief_complaint && (
                <div style={{ padding: '12px 16px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.cyan, marginBottom: 6 }}>CHIEF COMPLAINT</div>
                  <div style={{ fontSize: 14, color: C.muted }}>{intake.chief_complaint}</div>
                </div>
              )}
            </div>
          )
        })()}

        <div style={{ marginTop: 16, fontSize: 11, color: C.subtle, fontFamily: 'DM Mono,monospace', textAlign: 'center' }}>
          SHOWING {Math.min(filtered.length, 50)} OF {filtered.length} PATIENTS · HIPAA COMPLIANT ADMIN VIEW
        </div>
      </div>
    </div>
  )
}
