import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
const ORG_ID = '00000000-0000-0000-0000-000000000001'

const C = {
  navy950: '#020a14', navy900: '#060e1c', navy800: '#0a1628', navy700: '#0f2040',
  gold: '#c9a96e', goldLt: '#e8cc9a', text: '#e8eaf0', muted: '#8a9bc0',
  subtle: '#3a4a6a', cyan: '#00d4ff', green: '#4ade80', red: '#ff6b6b', amber: '#fbbf24',
  purple: '#a78bfa',
}

type AdminTab = 'dashboard' | 'users' | 'consent-forms' | 'questionnaires' | 'patients' | 'settings'

// ── Types ─────────────────────────────────────────────────────────────────
interface StaffUser {
  id?:          string
  email:        string
  first_name:   string
  last_name:    string
  role:         string
  mfa_enabled:  boolean
  status:       string
  created_at?:  string
}

interface ConsentForm {
  id?:          string
  title:        string
  description:  string
  body:         string
  required:     boolean
  active:       boolean
  specialty?:   string
  lang:         string
  created_at?:  string
}

interface QuestionField {
  id:       string
  type:     'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'scale'
  label:    string
  required: boolean
  options?: string[]
  placeholder?: string
}

interface Questionnaire {
  id?:          string
  title:        string
  description:  string
  specialty:    string
  active:       boolean
  fields:       QuestionField[]
  created_at?:  string
}

const ROLES    = ['admin', 'provider', 'billing', 'staff', 'readonly']
const SPECIALTIES = ['All', 'Family Medicine', 'Plastic Surgery', 'Mental Health / Psychiatry', 'Psychology', 'Internal Medicine', 'Cardiology', 'Orthopedics', 'Other']
const FIELD_TYPES: { value: QuestionField['type']; label: string; icon: string }[] = [
  { value: 'text',     label: 'Short Text',    icon: '✏️' },
  { value: 'textarea', label: 'Long Text',     icon: '📝' },
  { value: 'select',   label: 'Dropdown',      icon: '📋' },
  { value: 'radio',    label: 'Single Choice', icon: '🔘' },
  { value: 'checkbox', label: 'Multi-Select',  icon: '☑️' },
  { value: 'date',     label: 'Date',          icon: '📅' },
  { value: 'number',   label: 'Number',        icon: '🔢' },
  { value: 'scale',    label: '1–10 Scale',    icon: '📊' },
]

// ── Helpers ───────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10) }

function Badge({ label, color = C.gold }: { label: string; color?: string }) {
  return (
    <span style={{ background: `${color}18`, border: `1px solid ${color}35`, color, fontSize: 10, fontFamily: 'DM Mono,monospace', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em' }}>
      {label.toUpperCase()}
    </span>
  )
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 26, color: C.text, marginBottom: 4 }}>{title}</h2>
        {sub && <p style={{ color: C.muted, fontSize: 14 }}>{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Main AdminPanel ───────────────────────────────────────────────────────
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [stats, setStats] = useState({ patients: 0, completed: 0, users: 0, forms: 0 })

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    const [{ count: patients }, { count: completed }, { count: forms }] = await Promise.all([
      supabase.schema('cr').from('patient').select('*', { count: 'exact', head: true }).eq('org_id', ORG_ID),
      supabase.schema('cr').from('patient_intake').select('*', { count: 'exact', head: true }).eq('org_id', ORG_ID).eq('status', 'completed'),
      supabase.from('profiler_consent_forms').select('*', { count: 'exact', head: true }).eq('org_id', ORG_ID).eq('active', true).catch(() => ({ count: 0 })),
    ])
    setStats({ patients: patients ?? 0, completed: completed ?? 0, users: 0, forms: (forms as any) ?? 0 })
  }

  const NAV: { key: AdminTab; label: string; icon: string; color: string }[] = [
    { key: 'dashboard',      label: 'Dashboard',      icon: '📊', color: C.gold   },
    { key: 'users',          label: 'User Management', icon: '👥', color: C.cyan   },
    { key: 'consent-forms',  label: 'Consent Forms',  icon: '✍️', color: C.green  },
    { key: 'questionnaires', label: 'Questionnaires', icon: '📋', color: C.purple  },
    { key: 'patients',       label: 'Patients',       icon: '🏥', color: C.amber  },
    { key: 'settings',       label: 'Settings',       icon: '⚙️', color: C.muted  },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: C.navy950, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: C.navy900, borderRight: `1px solid rgba(201,169,110,0.1)`, padding: '24px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: `1px solid rgba(201,169,110,0.08)`, marginBottom: 12 }}>
          <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: C.gold }}>PatientTrac</div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: C.subtle, letterSpacing: '0.12em', marginTop: 2 }}>ADMIN PANEL</div>
        </div>

        {NAV.map(item => (
          <button key={item.key} onClick={() => setActiveTab(item.key)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 20px', background: activeTab === item.key ? `${item.color}12` : 'transparent',
            border: 'none', borderLeft: `2px solid ${activeTab === item.key ? item.color : 'transparent'}`,
            color: activeTab === item.key ? item.color : C.subtle,
            fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ padding: '24px 20px 0', borderTop: `1px solid rgba(201,169,110,0.08)`, marginTop: 12 }}>
          <a href="/admin" style={{ fontSize: 12, color: C.subtle, textDecoration: 'none', display: 'block', marginBottom: 8 }}>← Patient Dashboard</a>
          <a href="https://patienttracforge.com" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.subtle, textDecoration: 'none' }}>Scheduling App ↗</a>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px 32px', overflowY: 'auto', maxWidth: 1100 }}>
        {activeTab === 'dashboard'      && <DashboardTab stats={stats} />}
        {activeTab === 'users'          && <UsersTab />}
        {activeTab === 'consent-forms'  && <ConsentFormsTab />}
        {activeTab === 'questionnaires' && <QuestionnairesTab />}
        {activeTab === 'patients'       && <PatientsTab />}
        {activeTab === 'settings'       && <SettingsTab />}
      </main>
    </div>
  )
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────
function DashboardTab({ stats }: { stats: any }) {
  return (
    <div>
      <SectionHeader title="Admin Dashboard" sub="Overview of your PatientTrac Profiler platform" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Patients',    value: stats.patients,  color: C.gold,   icon: '👥' },
          { label: 'Profiles Complete', value: stats.completed, color: C.green,  icon: '✅' },
          { label: 'Active Forms',      value: stats.forms,     color: C.cyan,   icon: '📋' },
          { label: 'Staff Users',       value: stats.users,     color: C.purple, icon: '👤' },
        ].map(s => (
          <div key={s.label} style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, padding: '20px' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 36, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, padding: 24 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.gold, letterSpacing: '0.1em', marginBottom: 16 }}>QUICK ACTIONS</div>
          {[
            ['👤', 'Create Staff User',     'users'],
            ['✍️', 'New Consent Form',      'consent-forms'],
            ['📋', 'New Questionnaire',     'questionnaires'],
            ['🏥', 'View Patient Profiles', 'patients'],
          ].map(([icon, label, tab]) => (
            <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid rgba(201,169,110,0.06)`, cursor: 'pointer', color: C.muted, fontSize: 14, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}>
              <span>{icon}</span>{label} →
            </div>
          ))}
        </div>

        <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, padding: 24 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.cyan, letterSpacing: '0.1em', marginBottom: 16 }}>PLATFORM STATUS</div>
          {[
            ['Patient Intake',     '✓ Active',  C.green],
            ['AI Assistant',       '✓ Active',  C.green],
            ['HubSpot Sync',       '✓ Active',  C.green],
            ['Supabase Database',  '✓ Connected', C.green],
            ['Stripe Payments',    '⚠ Configure', C.amber],
            ['TOTP / MFA',         '✓ Required', C.green],
          ].map(([label, status, color]) => (
            <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid rgba(201,169,110,0.06)`, fontSize: 13 }}>
              <span style={{ color: C.muted }}>{label}</span>
              <span style={{ color: color as string, fontFamily: 'DM Mono,monospace', fontSize: 11 }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Users Tab ─────────────────────────────────────────────────────────────
function UsersTab() {
  const [users,    setUsers]    = useState<StaffUser[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<StaffUser | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')

  const EMPTY: StaffUser = { email: '', first_name: '', last_name: '', role: 'staff', mfa_enabled: true, status: 'active' }
  const [form, setForm] = useState<StaffUser>({ ...EMPTY })

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase.schema('saas').from('org_members')
      .select('user_id,email,first_name,last_name,role,mfa_enabled,status,created_at')
      .eq('org_id', ORG_ID).order('created_at', { ascending: false })
    setUsers((data ?? []).map((u: any) => ({ ...u, id: u.user_id })))
    setLoading(false)
  }

  async function saveUser() {
    if (!form.email || !form.first_name || !form.last_name) return
    setSaving(true); setMsg('')
    try {
      if (editing?.id) {
        await supabase.schema('saas').from('org_members').update({
          first_name:  form.first_name,
          last_name:   form.last_name,
          role:        form.role,
          mfa_enabled: form.mfa_enabled,
          status:      form.status,
        }).eq('user_id', editing.id).eq('org_id', ORG_ID)
        setMsg('User updated.')
      } else {
        // Create Supabase Auth user then add to org_members
        const { data: authData, error: authErr } = await supabase.auth.admin?.createUser({
          email:             form.email,
          email_confirm:     true,
          user_metadata:     { first_name: form.first_name, last_name: form.last_name },
        }) ?? {}
        if (authErr) throw new Error(authErr.message)
        await supabase.schema('saas').from('org_members').insert({
          user_id:     authData?.user?.id ?? uid(),
          org_id:      ORG_ID,
          email:       form.email,
          first_name:  form.first_name,
          last_name:   form.last_name,
          role:        form.role,
          mfa_enabled: form.mfa_enabled,
          status:      'active',
        })
        setMsg('User created. They will receive a setup email.')
      }
      setShowForm(false); setEditing(null); setForm({ ...EMPTY }); fetchUsers()
    } catch (e: any) { setMsg('Error: ' + e.message) }
    setSaving(false)
  }

  async function toggleStatus(user: StaffUser) {
    const next = user.status === 'active' ? 'inactive' : 'active'
    await supabase.schema('saas').from('org_members').update({ status: next }).eq('user_id', user.id).eq('org_id', ORG_ID)
    fetchUsers()
  }

  function startEdit(u: StaffUser) { setEditing(u); setForm(u); setShowForm(true) }

  return (
    <div>
      <SectionHeader title="User Management" sub="Create and manage staff accounts with role-based access and MFA."
        action={<button className="btn-gold" onClick={() => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true) }} style={{ padding: '8px 20px', fontSize: 13 }}>+ New User</button>} />

      {/* Form */}
      {showForm && (
        <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: C.gold, marginBottom: 20 }}>{editing ? 'Edit User' : 'New Staff User'}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <FormField label="First Name" required half><input className="hud-input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></FormField>
            <FormField label="Last Name" required half><input className="hud-input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></FormField>
            <FormField label="Email Address" required><input className="hud-input" type="email" value={form.email} disabled={!!editing} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></FormField>
            <FormField label="Role" required half>
              <select className="hud-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Status" half>
              <select className="hud-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </FormField>
            <div style={{ flex: '1 1 100%' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" className="hud-checkbox" checked={form.mfa_enabled} onChange={e => setForm(f => ({ ...f, mfa_enabled: e.target.checked }))} />
                <span style={{ fontSize: 14, color: C.text }}>Require Google Authenticator (TOTP) — <span style={{ color: C.amber }}>required for admin & provider roles</span></span>
              </label>
            </div>
          </div>
          {msg && <div style={{ marginTop: 12, fontSize: 13, color: msg.startsWith('Error') ? C.red : C.green }}>{msg}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn-gold" onClick={saveUser} disabled={saving} style={{ padding: '9px 24px', fontSize: 13 }}>{saving ? 'Saving...' : editing ? 'Update User' : 'Create User'}</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 80px', padding: '12px 20px', background: C.navy700, gap: 12 }}>
          {['Name', 'Email', 'Role', 'MFA', 'Status', ''].map(h => <div key={h} style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.08em' }}>{h}</div>)}
        </div>
        {loading ? <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>Loading...</div>
          : users.length === 0 ? <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>No users yet. Create one above.</div>
            : users.map((u, i) => (
              <div key={u.id ?? i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 80px', padding: '13px 20px', gap: 12, borderTop: `1px solid rgba(201,169,110,0.05)`, alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: C.text }}>{u.first_name} {u.last_name}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{u.email}</div>
                <Badge label={u.role} color={u.role === 'admin' ? C.gold : u.role === 'provider' ? C.cyan : C.subtle} />
                <span style={{ fontSize: 12, color: u.mfa_enabled ? C.green : C.subtle }}>{u.mfa_enabled ? '✓ On' : '✗ Off'}</span>
                <span style={{ fontSize: 12, color: u.status === 'active' ? C.green : C.red }}>{u.status}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(u)} style={{ background: 'none', border: `1px solid ${C.subtle}`, color: C.muted, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>Edit</button>
                  <button onClick={() => toggleStatus(u)} style={{ background: 'none', border: `1px solid ${u.status === 'active' ? C.red : C.green}40`, color: u.status === 'active' ? C.red : C.green, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11 }}>
                    {u.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}

// ── Consent Forms Tab ─────────────────────────────────────────────────────
function ConsentFormsTab() {
  const [forms,    setForms]    = useState<ConsentForm[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<ConsentForm | null>(null)
  const [saving,   setSaving]   = useState(false)
  const [preview,  setPreview]  = useState<ConsentForm | null>(null)

  const EMPTY: ConsentForm = { title: '', description: '', body: '', required: true, active: true, specialty: 'All', lang: 'en' }
  const [form, setForm] = useState<ConsentForm>({ ...EMPTY })

  // Seeded defaults always available
  const DEFAULT_FORMS: ConsentForm[] = [
    { id: 'default-1', title: 'Consent to Treatment', description: 'General medical treatment consent', body: 'I consent to the medical examination and treatment by the healthcare providers at this practice. I understand that treatment may include physical examination, diagnostic tests, medical procedures, and other necessary care. I have the right to refuse any treatment at any time.', required: true, active: true, specialty: 'All', lang: 'en' },
    { id: 'default-2', title: 'HIPAA Privacy Acknowledgment', description: 'Receipt of HIPAA Notice of Privacy Practices', body: 'I acknowledge that I have received and/or been offered access to the Notice of Privacy Practices. I understand how my protected health information (PHI) may be used and disclosed for treatment, payment, and healthcare operations.', required: true, active: true, specialty: 'All', lang: 'en' },
    { id: 'default-3', title: 'Financial Responsibility', description: 'Patient financial responsibility agreement', body: 'I agree to be financially responsible for all charges for services rendered. I authorize the release of medical information necessary to process insurance claims. I assign insurance benefits directly to the provider.', required: true, active: true, specialty: 'All', lang: 'en' },
    { id: 'default-4', title: 'Telehealth Consent', description: 'Consent for telehealth / video visits', body: 'I consent to the use of telehealth technologies for my medical care, including video visits, secure messaging, and remote monitoring. I understand that telehealth visits are subject to the same privacy protections as in-person visits.', required: false, active: true, specialty: 'All', lang: 'en' },
    { id: 'default-5', title: 'Photo / Recording Consent', description: 'Consent for clinical photography', body: 'I consent to the use of photographs or recordings for medical documentation and treatment purposes. Images will be kept confidential and will not be used publicly without separate written consent.', required: false, active: true, specialty: 'Plastic Surgery', lang: 'en' },
    { id: 'default-6', title: 'Psychiatric Treatment Consent', description: 'Consent specific to mental health treatment', body: 'I consent to psychiatric evaluation and treatment. I understand that mental health treatment may include medication management, psychotherapy, and other evidence-based interventions. I understand my right to participate in treatment decisions.', required: true, active: true, specialty: 'Mental Health / Psychiatry', lang: 'en' },
  ]

  useEffect(() => {
    supabase.from('profiler_consent_forms').select('*').eq('org_id', ORG_ID).order('created_at')
      .then(({ data }) => setForms([...DEFAULT_FORMS, ...(data ?? [])]))
      .catch(() => setForms(DEFAULT_FORMS))
  }, [])

  async function saveForm() {
    if (!form.title || !form.body) return
    setSaving(true)
    const payload = { ...form, org_id: ORG_ID }
    if (editing?.id && !editing.id.startsWith('default')) {
      await supabase.from('profiler_consent_forms').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('profiler_consent_forms').insert({ ...payload, id: uid() })
    }
    setSaving(false); setShowForm(false); setEditing(null); setForm({ ...EMPTY })
    const { data } = await supabase.from('profiler_consent_forms').select('*').eq('org_id', ORG_ID)
    setForms([...DEFAULT_FORMS, ...(data ?? [])])
  }

  return (
    <div>
      <SectionHeader title="Consent Forms" sub="Build and manage custom consent forms shown to patients during intake."
        action={<button className="btn-gold" onClick={() => { setEditing(null); setForm({ ...EMPTY }); setShowForm(true) }} style={{ padding: '8px 20px', fontSize: 13 }}>+ New Form</button>} />

      {showForm && (
        <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: C.gold, marginBottom: 20 }}>{editing ? 'Edit Consent Form' : 'New Consent Form'}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <FormField label="Form Title" required><input className="hud-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Surgical Consent Form" /></FormField>
            <FormField label="Description" half><input className="hud-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description for staff" /></FormField>
            <FormField label="Specialty" half>
              <select className="hud-input" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Language" half>
              <select className="hud-input" value={form.lang} onChange={e => setForm(f => ({ ...f, lang: e.target.value }))}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </FormField>
            <FormField label="Form Body (patient-facing text)" required>
              <textarea className="hud-input" rows={6} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Enter the full consent form text that patients will read and agree to..." style={{ minHeight: 140 }} />
            </FormField>
            <div style={{ flex: '1 1 100%', display: 'flex', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" className="hud-checkbox" checked={form.required} onChange={e => setForm(f => ({ ...f, required: e.target.checked }))} />
                <span style={{ fontSize: 14, color: C.text }}>Required (patient must check)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" className="hud-checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                <span style={{ fontSize: 14, color: C.text }}>Active (show to patients)</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn-gold" onClick={saveForm} disabled={saving} style={{ padding: '9px 24px', fontSize: 13 }}>{saving ? 'Saving...' : 'Save Form'}</button>
            <button className="btn-ghost" onClick={() => setPreview(form)}>Preview</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setPreview(null)}>
          <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 12, padding: 32, maxWidth: 600, width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.gold, marginBottom: 12 }}>PATIENT PREVIEW</div>
            <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 20, color: C.text, marginBottom: 12 }}>{preview.title}</h3>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>{preview.body}</p>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: 8, padding: '14px 16px' }}>
              <input type="checkbox" className="hud-checkbox" style={{ marginTop: 2 }} />
              <span style={{ fontSize: 14, color: C.text }}>I have read and agree to the above. {preview.required && <span style={{ color: C.red }}>*Required</span>}</span>
            </label>
            <button className="btn-ghost" onClick={() => setPreview(null)} style={{ marginTop: 16 }}>Close Preview</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {forms.map((f, i) => (
          <div key={f.id ?? i} style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{f.title}</span>
                {f.required && <Badge label="Required" color={C.red} />}
                {!f.active && <Badge label="Inactive" color={C.subtle} />}
                {f.specialty && f.specialty !== 'All' && <Badge label={f.specialty} color={C.purple} />}
                {f.id?.startsWith('default') && <Badge label="Default" color={C.muted} />}
              </div>
              <p style={{ fontSize: 12, color: C.subtle, margin: 0 }}>{f.description}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
              <button onClick={() => setPreview(f)} style={{ background: 'none', border: `1px solid ${C.subtle}`, color: C.muted, padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Preview</button>
              {!f.id?.startsWith('default') && (
                <button onClick={() => { setEditing(f); setForm(f); setShowForm(true) }} style={{ background: 'none', border: `1px solid ${C.subtle}`, color: C.muted, padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Questionnaires Tab ────────────────────────────────────────────────────
function QuestionnairesTab() {
  const [quests,   setQuests]   = useState<Questionnaire[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Questionnaire | null>(null)
  const [saving,   setSaving]   = useState(false)

  const EMPTY_Q: Questionnaire = { title: '', description: '', specialty: 'All', active: true, fields: [] }
  const [form, setForm] = useState<Questionnaire>({ ...EMPTY_Q })

  useEffect(() => {
    supabase.from('profiler_questionnaires').select('*').eq('org_id', ORG_ID).order('created_at')
      .then(({ data }) => setQuests(data ?? [])).catch(() => {})
  }, [])

  function addField() {
    const newField: QuestionField = { id: uid(), type: 'text', label: '', required: false }
    setForm(f => ({ ...f, fields: [...f.fields, newField] }))
  }

  function updateField(id: string, updates: Partial<QuestionField>) {
    setForm(f => ({ ...f, fields: f.fields.map(field => field.id === id ? { ...field, ...updates } : field) }))
  }

  function removeField(id: string) {
    setForm(f => ({ ...f, fields: f.fields.filter(field => field.id !== id) }))
  }

  function moveField(id: string, dir: -1 | 1) {
    setForm(f => {
      const idx  = f.fields.findIndex(field => field.id === id)
      const next = [...f.fields]
      const temp = next[idx]; next[idx] = next[idx + dir]; next[idx + dir] = temp
      return { ...f, fields: next }
    })
  }

  async function saveQuestionnaire() {
    if (!form.title || form.fields.length === 0) return
    setSaving(true)
    const payload = { ...form, org_id: ORG_ID, fields: JSON.stringify(form.fields) }
    if (editing?.id) {
      await supabase.from('profiler_questionnaires').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('profiler_questionnaires').insert({ ...payload, id: uid() })
    }
    setSaving(false); setShowForm(false); setEditing(null); setForm({ ...EMPTY_Q })
    const { data } = await supabase.from('profiler_questionnaires').select('*').eq('org_id', ORG_ID)
    setQuests(data ?? [])
  }

  return (
    <div>
      <SectionHeader title="Questionnaires" sub="Build custom intake questionnaires for specific specialties or visit types."
        action={<button className="btn-gold" onClick={() => { setEditing(null); setForm({ ...EMPTY_Q }); setShowForm(true) }} style={{ padding: '8px 20px', fontSize: 13 }}>+ New Questionnaire</button>} />

      {showForm && (
        <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: C.gold, marginBottom: 20 }}>{editing ? 'Edit Questionnaire' : 'New Questionnaire'}</h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
            <FormField label="Title" required><input className="hud-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Pre-Surgical Assessment" /></FormField>
            <FormField label="Description" half><input className="hud-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="When is this shown?" /></FormField>
            <FormField label="Specialty" half>
              <select className="hud-input" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>

          {/* Field builder */}
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.cyan, letterSpacing: '0.1em', marginBottom: 14 }}>FORM FIELDS ({form.fields.length})</div>

          {form.fields.map((field, idx) => (
            <div key={field.id} style={{ background: C.navy700, border: `1px solid ${C.subtle}`, borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => idx > 0 && moveField(field.id, -1)} disabled={idx === 0} style={{ background: 'none', border: `1px solid ${C.subtle}`, color: C.muted, padding: '2px 8px', cursor: 'pointer', borderRadius: 3, fontSize: 12 }}>↑</button>
                  <button onClick={() => idx < form.fields.length - 1 && moveField(field.id, 1)} disabled={idx === form.fields.length - 1} style={{ background: 'none', border: `1px solid ${C.subtle}`, color: C.muted, padding: '2px 8px', cursor: 'pointer', borderRadius: 3, fontSize: 12 }}>↓</button>
                </div>
                <button onClick={() => removeField(field.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 13 }}>✕ Remove</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label className="field-label">Field Type</label>
                  <select className="hud-input" value={field.type} onChange={e => updateField(field.id, { type: e.target.value as QuestionField['type'], options: [] })}>
                    {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: '2 1 280px' }}>
                  <label className="field-label">Question / Label *</label>
                  <input className="hud-input" value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} placeholder="e.g. How would you describe your pain level?" />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label className="field-label">Placeholder</label>
                  <input className="hud-input" value={field.placeholder ?? ''} onChange={e => updateField(field.id, { placeholder: e.target.value })} placeholder="Optional hint text" />
                </div>
                {['select', 'radio', 'checkbox'].includes(field.type) && (
                  <div style={{ flex: '1 1 100%' }}>
                    <label className="field-label">Options (one per line)</label>
                    <textarea className="hud-input" rows={3} value={(field.options ?? []).join('\n')} onChange={e => updateField(field.id, { options: e.target.value.split('\n').filter(Boolean) })} placeholder="Option 1&#10;Option 2&#10;Option 3" style={{ minHeight: 70 }} />
                  </div>
                )}
                <div style={{ flex: '1 1 100%' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" className="hud-checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} />
                    <span style={{ fontSize: 13, color: C.muted }}>Required field</span>
                  </label>
                </div>
              </div>
            </div>
          ))}

          <button onClick={addField} style={{ width: '100%', background: 'transparent', border: `1px dashed ${C.subtle}`, color: C.subtle, padding: '10px 0', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontFamily: 'DM Mono,monospace', marginBottom: 20 }}>
            + ADD FIELD
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-gold" onClick={saveQuestionnaire} disabled={saving || !form.title || form.fields.length === 0} style={{ padding: '9px 24px', fontSize: 13 }}>{saving ? 'Saving...' : 'Save Questionnaire'}</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
          </div>
        </div>
      )}

      {quests.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted, border: `1px dashed ${C.subtle}`, borderRadius: 10 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, marginBottom: 6 }}>No questionnaires yet</div>
          <div style={{ fontSize: 13 }}>Create custom forms for specific specialties or visit types</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {quests.map((q, i) => (
          <div key={q.id ?? i} style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{q.title}</span>
                <Badge label={q.specialty} color={C.purple} />
                {!q.active && <Badge label="Inactive" color={C.subtle} />}
              </div>
              <p style={{ fontSize: 12, color: C.subtle }}>{Array.isArray(q.fields) ? q.fields.length : JSON.parse(q.fields as any ?? '[]').length} fields · {q.description}</p>
            </div>
            <button onClick={() => { setEditing(q); setForm({ ...q, fields: Array.isArray(q.fields) ? q.fields : JSON.parse(q.fields as any ?? '[]') }); setShowForm(true) }}
              style={{ background: 'none', border: `1px solid ${C.subtle}`, color: C.muted, padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Patients Tab ──────────────────────────────────────────────────────────
function PatientsTab() {
  const [patients, setPatients] = useState<any[]>([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<any | null>(null)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    supabase.schema('cr').from('patient').select('*').eq('org_id', ORG_ID).order('insert_date', { ascending: false }).limit(100)
      .then(({ data }) => setPatients(data ?? [])).finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p => !search || `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search.toLowerCase()))

  async function savePatient() {
    if (!editing) return
    setSaving(true)
    await supabase.schema('cr').from('patient').update({
      first_name:         editing.first_name,
      last_name:          editing.last_name,
      cell_phone:         editing.cell_phone,
      email:              editing.email,
      allergies:          editing.allergies,
      preferred_language: editing.preferred_language,
      status:             editing.status,
    }).eq('patient_id', editing.patient_id).eq('org_id', ORG_ID)
    setSaving(false); setEditing(null)
    const { data } = await supabase.schema('cr').from('patient').select('*').eq('org_id', ORG_ID).order('insert_date', { ascending: false }).limit(100)
    setPatients(data ?? [])
  }

  return (
    <div>
      <SectionHeader title="Patient Records" sub="View and update patient profile data submitted through the profiler." />
      <input className="hud-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ maxWidth: 360, marginBottom: 20 }} />

      {editing && (
        <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.2)`, borderRadius: 10, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: C.gold, marginBottom: 20 }}>Edit Patient #{editing.patient_id}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <FormField label="First Name" half><input className="hud-input" value={editing.first_name ?? ''} onChange={e => setEditing((p: any) => ({ ...p, first_name: e.target.value }))} /></FormField>
            <FormField label="Last Name" half><input className="hud-input" value={editing.last_name ?? ''} onChange={e => setEditing((p: any) => ({ ...p, last_name: e.target.value }))} /></FormField>
            <FormField label="Email" half><input className="hud-input" value={editing.email ?? ''} onChange={e => setEditing((p: any) => ({ ...p, email: e.target.value }))} /></FormField>
            <FormField label="Cell Phone" half><input className="hud-input" value={editing.cell_phone ?? ''} onChange={e => setEditing((p: any) => ({ ...p, cell_phone: e.target.value }))} /></FormField>
            <FormField label="Allergies"><textarea className="hud-input" rows={2} value={editing.allergies ?? ''} onChange={e => setEditing((p: any) => ({ ...p, allergies: e.target.value }))} /></FormField>
            <FormField label="Preferred Language" half>
              <select className="hud-input" value={editing.preferred_language ?? 'en'} onChange={e => setEditing((p: any) => ({ ...p, preferred_language: e.target.value }))}>
                <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option>
              </select>
            </FormField>
            <FormField label="Status" half>
              <select className="hud-input" value={editing.status ?? 'active'} onChange={e => setEditing((p: any) => ({ ...p, status: e.target.value }))}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn-gold" onClick={savePatient} disabled={saving} style={{ padding: '9px 24px', fontSize: 13 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 80px', padding: '12px 20px', background: C.navy700, gap: 12 }}>
          {['Name', 'Email', 'Phone', 'Language', ''].map(h => <div key={h} style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: C.muted, letterSpacing: '0.08em' }}>{h}</div>)}
        </div>
        {loading ? <div style={{ padding: 32, textAlign: 'center', color: C.muted }}>Loading...</div>
          : filtered.slice(0, 50).map((p, i) => (
            <div key={p.patient_id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 80px', padding: '13px 20px', gap: 12, borderTop: `1px solid rgba(201,169,110,0.05)`, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(10,22,40,0.3)' }}>
              <div style={{ fontSize: 14, color: C.text }}>{p.first_name} {p.last_name}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{p.email}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{p.cell_phone}</div>
              <div style={{ fontSize: 12, color: C.muted, fontFamily: 'DM Mono,monospace', textTransform: 'uppercase' }}>{p.preferred_language ?? 'EN'}</div>
              <button onClick={() => setEditing(p)} style={{ background: 'none', border: `1px solid ${C.subtle}`, color: C.muted, padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
            </div>
          ))}
      </div>
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────
function SettingsTab() {
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    practice_name:    'PatientTrac Corp',
    support_email:    'support@patienttrac.com',
    hubspot_form_id:  '',
    stripe_price_pro: '',
    intake_expiry_hrs: '48',
    require_mfa:      true,
    ai_assistant:     true,
    voice_input:      true,
    notify_on_submit: true,
  })

  function save() { setSaved(true); setTimeout(() => setSaved(false), 3000) }

  return (
    <div>
      <SectionHeader title="Platform Settings" sub="Configure platform-wide options for your PatientTrac Profiler." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {[
          { label: 'Practice / Organization Name', key: 'practice_name', type: 'text' },
          { label: 'Support Email', key: 'support_email', type: 'email' },
          { label: 'HubSpot Form GUID', key: 'hubspot_form_id', type: 'text' },
          { label: 'Stripe Price ID (Pro)', key: 'stripe_price_pro', type: 'text' },
          { label: 'Intake Link Expiry (hours)', key: 'intake_expiry_hrs', type: 'number' },
        ].map(field => (
          <div key={field.key} style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, padding: 20 }}>
            <label className="field-label" style={{ marginBottom: 10, display: 'block' }}>{field.label}</label>
            <input className="hud-input" type={field.type} value={(config as any)[field.key]} onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))} style={{ maxWidth: 420 }} />
          </div>
        ))}

        {[
          { label: 'Require MFA (Google Authenticator) for all admin/provider accounts', key: 'require_mfa', color: C.gold },
          { label: 'Enable AI Patient Assistant', key: 'ai_assistant', color: C.cyan },
          { label: 'Enable Voice Input in AI Assistant', key: 'voice_input', color: C.cyan },
          { label: 'Notify staff on patient profile completion', key: 'notify_on_submit', color: C.green },
        ].map(toggle => (
          <div key={toggle.key} style={{ background: C.navy800, border: `1px solid rgba(201,169,110,0.1)`, borderRadius: 10, padding: '16px 20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" className="hud-checkbox" checked={(config as any)[toggle.key]} onChange={e => setConfig(c => ({ ...c, [toggle.key]: e.target.checked }))} />
              <span style={{ fontSize: 14, color: C.text }}>{toggle.label}</span>
              {(config as any)[toggle.key] && <Badge label="ON" color={toggle.color} />}
            </label>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-gold" onClick={save} style={{ padding: '11px 28px', fontSize: 14 }}>{saved ? '✓ Saved!' : 'Save Settings'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Shared FormField ──────────────────────────────────────────────────────
function FormField({ label, required, half, children }: { label: string; required?: boolean; half?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ flex: half ? '1 1 calc(50% - 8px)' : '1 1 100%', minWidth: 0 }}>
      <label className="field-label">{label}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}</label>
      {children}
    </div>
  )
}
