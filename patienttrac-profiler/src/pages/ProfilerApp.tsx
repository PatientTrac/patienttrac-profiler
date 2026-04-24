import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import AIAssistant from '../components/AIAssistant'
import type { Lang } from '../types'

const SUPABASE_URL  = 'https://mskormozwekezjmtcylv.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1za29ybW96d2VrZXpqbXRjeWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzMzMzAsImV4cCI6MjA5MjU0OTMzMH0.nO9Q31CZJWRSIieLdLYVMkdu5NDDWjf1z0TgwCjBpp0'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Sections the patient completes ─────────────────────────────────
type Section =
  | 'welcome'
  | 'demographics'
  | 'contact'
  | 'insurance'
  | 'medical_history'
  | 'medications'
  | 'allergies'
  | 'surgical_history'
  | 'family_history'
  | 'social_history'
  | 'review_of_systems'
  | 'consent'
  | 'complete'

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'welcome',          label: 'Welcome',             icon: '👋' },
  { key: 'demographics',     label: 'Personal Info',       icon: '👤' },
  { key: 'contact',          label: 'Contact & Address',   icon: '📍' },
  { key: 'insurance',        label: 'Insurance',           icon: '🛡' },
  { key: 'medical_history',  label: 'Medical History',     icon: '🏥' },
  { key: 'medications',      label: 'Medications',         icon: '💊' },
  { key: 'allergies',        label: 'Allergies',           icon: '⚠️' },
  { key: 'surgical_history', label: 'Surgical History',    icon: '🔬' },
  { key: 'family_history',   label: 'Family History',      icon: '👨‍👩‍👧' },
  { key: 'social_history',   label: 'Social History',      icon: '🌐' },
  { key: 'review_of_systems',label: 'Review of Systems',   icon: '📋' },
  { key: 'consent',          label: 'Consent Forms',       icon: '✍️' },
  { key: 'complete',         label: 'Complete',            icon: '✅' },
]

// ── Styles ─────────────────────────────────────────────────────────
const g: Record<string, React.CSSProperties> = {
  shell:     { minHeight:'100vh', background:'#020a14', color:'#e8eaf0', fontFamily:"'DM Sans',sans-serif" },
  nav:       { background:'#060e1c', borderBottom:'1px solid rgba(201,169,110,0.12)', padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between', height:56, position:'sticky', top:0, zIndex:100 },
  logo:      { fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:20, color:'#c9a96e', display:'flex', alignItems:'center', gap:8 },
  badge:     { background:'#c9a96e', color:'#020a14', padding:'2px 8px', fontSize:9, fontFamily:'DM Mono,monospace', letterSpacing:'0.1em' },
  layout:    { display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'calc(100vh - 56px)' },
  sidebar:   { background:'#060e1c', borderRight:'1px solid rgba(201,169,110,0.08)', padding:'24px 0', position:'sticky', top:56, height:'calc(100vh - 56px)', overflowY:'auto' },
  sideItem:  { display:'flex', alignItems:'center', gap:10, padding:'9px 20px', cursor:'pointer', fontSize:13, transition:'all 0.15s', borderLeft:'2px solid transparent' },
  sideActive:{ background:'rgba(201,169,110,0.08)', borderLeftColor:'#c9a96e', color:'#c9a96e' },
  sideDone:  { color:'#4ade80' },
  sidePend:  { color:'#3a4a6a' },
  sideIcon:  { fontSize:14, width:20, textAlign:'center' as const },
  check:     { marginLeft:'auto', fontSize:11, color:'#4ade80' },
  main:      { padding:'32px 40px', maxWidth:760 },
  ph:        { fontFamily:'Rajdhani,sans-serif', fontSize:28, fontWeight:700, marginBottom:6, letterSpacing:'0.02em' },
  psub:      { color:'#8a9bc0', fontSize:14, marginBottom:28, lineHeight:1.6 },
  progress:  { background:'rgba(201,169,110,0.1)', height:4, borderRadius:2, marginBottom:32 },
  progressFill:{ background:'#c9a96e', height:4, borderRadius:2, transition:'width 0.4s' },
  fg:        { display:'flex', flexDirection:'column' as const, gap:6, marginBottom:20 },
  lbl:       { fontSize:10, fontFamily:'DM Mono,monospace', color:'#3a4a6a', letterSpacing:'0.12em', textTransform:'uppercase' as const },
  inp:       { background:'rgba(6,14,28,0.8)', border:'1px solid rgba(201,169,110,0.15)', color:'#e8eaf0', padding:'10px 14px', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', width:'100%', borderRadius:0 },
  inpFocus:  { borderColor:'rgba(201,169,110,0.5)' },
  ta:        { background:'rgba(6,14,28,0.8)', border:'1px solid rgba(201,169,110,0.15)', color:'#e8eaf0', padding:'12px 14px', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', width:'100%', resize:'vertical' as const, lineHeight:1.6, minHeight:80 },
  row2:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  row3:      { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 },
  btn:       { background:'#c9a96e', color:'#020a14', border:'none', padding:'12px 28px', fontSize:12, fontFamily:'DM Mono,monospace', letterSpacing:'0.12em', textTransform:'uppercase' as const, cursor:'pointer', fontWeight:500 },
  btnSec:    { background:'transparent', color:'#8a9bc0', border:'1px solid rgba(255,255,255,0.1)', padding:'12px 24px', fontSize:12, fontFamily:'DM Mono,monospace', letterSpacing:'0.1em', textTransform:'uppercase' as const, cursor:'pointer' },
  btnRow:    { display:'flex', gap:12, marginTop:32, paddingTop:24, borderTop:'1px solid rgba(201,169,110,0.08)' },
  card:      { background:'rgba(10,22,40,0.7)', border:'1px solid rgba(201,169,110,0.1)', padding:'20px 24px', marginBottom:16 },
  cardTitle: { fontSize:10, fontFamily:'DM Mono,monospace', color:'#c9a96e', letterSpacing:'0.12em', textTransform:'uppercase' as const, marginBottom:12 },
  tag:       { display:'inline-flex', alignItems:'center', gap:6, background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.2)', color:'#00d4ff', padding:'4px 10px', fontSize:11, fontFamily:'DM Mono,monospace', marginRight:6, marginBottom:6, cursor:'pointer' },
  tagOn:     { background:'rgba(0,212,255,0.18)', borderColor:'rgba(0,212,255,0.5)' },
  tagRed:    { background:'rgba(255,107,107,0.1)', borderColor:'rgba(255,107,107,0.3)', color:'#ff6b6b' },
  tagRedOn:  { background:'rgba(255,107,107,0.25)', borderColor:'rgba(255,107,107,0.6)' },
  check2:    { display:'flex', alignItems:'flex-start', gap:10, marginBottom:12, cursor:'pointer' },
  checkbox:  { width:16, height:16, border:'1px solid rgba(201,169,110,0.3)', background:'transparent', cursor:'pointer', flexShrink:0, marginTop:2 },
  checkOn:   { background:'#c9a96e', borderColor:'#c9a96e' },
  muted:     { color:'#3a4a6a', fontSize:13 },
  ok:        { background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', color:'#4ade80', padding:'10px 16px', fontSize:13, marginBottom:16 },
  err:       { background:'rgba(255,107,107,0.08)', border:'1px solid rgba(255,107,107,0.2)', color:'#ff6b6b', padding:'10px 16px', fontSize:13, marginBottom:16 },
  divider:   { height:1, background:'rgba(201,169,110,0.08)', margin:'24px 0' },
  addBtn:    { background:'transparent', border:'1px dashed rgba(201,169,110,0.2)', color:'#3a4a6a', padding:'8px 16px', fontSize:12, fontFamily:'DM Mono,monospace', cursor:'pointer', width:'100%', marginBottom:12 },
  pill:      { display:'inline-block', background:'rgba(201,169,110,0.1)', color:'#c9a96e', padding:'2px 8px', fontSize:11, fontFamily:'DM Mono,monospace', marginRight:4 },
}

// ── Condition tag lists ─────────────────────────────────────────────
const CONDITIONS = [
  'Hypertension','Diabetes Type 1','Diabetes Type 2','Asthma','COPD',
  'Heart Disease','Stroke','Cancer','Thyroid Disease','Depression',
  'Anxiety','Bipolar Disorder','ADHD','Arthritis','Osteoporosis',
  'Kidney Disease','Liver Disease','HIV/AIDS','Epilepsy/Seizures',
  'Migraine','Sleep Apnea','Fibromyalgia','Lupus','Multiple Sclerosis',
  'Crohn\'s Disease','Ulcerative Colitis','GERD','Anemia','Obesity',
]

const SURGICAL_PROCS = [
  'Appendectomy','Tonsillectomy','Gallbladder removal','Hernia repair',
  'C-Section','Hysterectomy','Hip replacement','Knee replacement',
  'Spinal surgery','CABG (open heart)','Angioplasty','Cataract surgery',
  'Lasik','Rhinoplasty','Breast augmentation','Liposuction',
  'Gastric bypass','Colonoscopy','Endoscopy','Biopsy','Other',
]

const FAMILY_CONDITIONS = [
  'Heart disease','Stroke','Diabetes','Cancer','Hypertension',
  'Mental illness','Alzheimer\'s/Dementia','Kidney disease',
  'Autoimmune disease','Blood disorders','Genetic conditions',
]

const SYSTEMS = [
  { system:'Constitutional', symptoms:['Fatigue','Weight loss','Weight gain','Fever','Night sweats','Chills'] },
  { system:'Cardiovascular', symptoms:['Chest pain','Palpitations','Shortness of breath','Swelling in legs','Dizziness'] },
  { system:'Respiratory',    symptoms:['Cough','Wheezing','Shortness of breath','Coughing blood','Snoring'] },
  { system:'GI / Digestive', symptoms:['Nausea','Vomiting','Diarrhea','Constipation','Abdominal pain','Heartburn','Blood in stool'] },
  { system:'Neurological',   symptoms:['Headache','Seizures','Numbness/tingling','Memory loss','Tremors','Weakness'] },
  { system:'Musculoskeletal',symptoms:['Joint pain','Back pain','Muscle weakness','Stiffness','Limited range of motion'] },
  { system:'Skin',           symptoms:['Rash','Itching','Hair loss','Nail changes','Skin lesions','Bruising easily'] },
  { system:'Mental Health',  symptoms:['Anxiety','Depression','Mood swings','Insomnia','Suicidal thoughts','Hallucinations'] },
  { system:'Urinary',        symptoms:['Frequent urination','Painful urination','Blood in urine','Incontinence'] },
  { system:'Eyes/Ears',      symptoms:['Vision changes','Double vision','Hearing loss','Ringing in ears','Eye pain'] },
]

// ── Small helpers ───────────────────────────────────────────────────
function Toggle({ label, value, onChange }: { label:string, value:boolean, onChange:(v:boolean)=>void }) {
  return (
    <div onClick={() => onChange(!value)} style={g.check2}>
      <div style={{...g.checkbox, ...(value ? g.checkOn : {}), display:'flex', alignItems:'center', justifyContent:'center'}}>
        {value && <span style={{color:'#020a14', fontSize:10, fontWeight:700}}>✓</span>}
      </div>
      <span style={{fontSize:14, color:'#8a9bc0', lineHeight:1.5}}>{label}</span>
    </div>
  )
}

function TagPicker({ options, selected, onChange, red }: { options:string[], selected:string[], onChange:(s:string[])=>void, red?:boolean }) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(x=>x!==opt) : [...selected, opt])
  }
  return (
    <div style={{display:'flex', flexWrap:'wrap' as const}}>
      {options.map(opt => {
        const on = selected.includes(opt)
        const base = red ? g.tagRed : g.tag
        const active = red ? g.tagRedOn : g.tagOn
        return (
          <div key={opt} onClick={() => toggle(opt)} style={{...base, ...(on ? active : {})}}>
            {on && <span>✓ </span>}{opt}
          </div>
        )
      })}
    </div>
  )
}

// ── Main App ────────────────────────────────────────────────────────
export default function ProfilerApp() {
  // Token from URL — can be used if launched from scheduling intake link
  const params   = new URLSearchParams(location.search)
  const urlToken = params.get('token')
  const urlEmail = params.get('email') || ''

  const [section, setSection] = useState<Section>('welcome')
  const [completed, setCompleted] = useState<Set<Section>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [patientId, setPatientId] = useState<number | null>(null)
  const [showAI,    setShowAI]    = useState(false)
  const [lang,      setLang]      = useState<Lang>(() => {
    const nav = navigator.language?.slice(0, 2)
    if (nav === 'es') return 'es'
    if (nav === 'fr') return 'fr'
    return 'en'
  })

  // ── Form state for each section ──────────────────────────────────
  const [demo, setDemo] = useState({
    first_name:'', last_name:'', birth:'', gender:'', preferred_pronouns:'',
    ssn_last4:'', is_us_resident:true, country_code:'US', preferred_language:'English',
    interpreter_needed:false, race:'', ethnicity:'', marital_status:'',
  })
  const [contact, setContact] = useState({
    cell_phone:'', home_phone:'', email: urlEmail, address1:'', address2:'',
    city:'', state_province:'', zip_postal:'', emergency_name:'',
    emergency_phone:'', emergency_relationship:'',
  })
  const [ins, setIns] = useState({
    has_insurance:true, insurance_company:'', policy_number:'', group_number:'',
    subscriber_name:'', subscriber_dob:'', relationship_to_subscriber:'Self',
    secondary_insurance:'', secondary_policy:'',
  })
  const [medHx, setMedHx] = useState<string[]>([])
  const [otherCondition, setOtherCondition] = useState('')
  const [medications, setMedications] = useState([{ name:'', dose:'', frequency:'', reason:'', prescriber:'' }])
  const [allergies, setAllergies] = useState([{ substance:'', reaction:'', severity:'Mild' }])
  const [noKnownAllergies, setNoKnownAllergies] = useState(false)
  const [surgicalHx, setSurgicalHx] = useState<string[]>([])
  const [surgicalDetails, setSurgicalDetails] = useState([{ procedure:'', year:'', surgeon:'', hospital:'' }])
  const [familyHx, setFamilyHx] = useState<{condition:string, relation:string}[]>([])
  const [socialHx, setSocialHx] = useState({
    tobacco:'Never', tobacco_ppd:'', tobacco_years:'',
    alcohol:'Never', alcohol_drinks_week:'',
    drugs:'Never', drug_types:'',
    exercise:'Sedentary', diet:'Mixed',
    occupation:'', highest_education:'',
    living_situation:'', sexual_activity:false, sexual_partners:'',
  })
  const [ros, setRos] = useState<Record<string, string[]>>({})
  const [consents, setConsents] = useState({
    treatment:false, hipaa:false, financial:false,
    telehealth:false, photo:false, research:false,
    signature:'', signed_date: new Date().toISOString().split('T')[0],
  })

  // Progress
  const totalSections = SECTIONS.length - 2 // exclude welcome + complete
  const pct = Math.round((completed.size / totalSections) * 100)

  function markDone(s: Section) {
    setCompleted(prev => new Set([...prev, s]))
  }

  function nextSection() {
    const idx = SECTIONS.findIndex(s => s.key === section)
    if (idx < SECTIONS.length - 1) {
      markDone(section)
      setSection(SECTIONS[idx + 1].key)
      window.scrollTo(0, 0)
    }
  }

  function prevSection() {
    const idx = SECTIONS.findIndex(s => s.key === section)
    if (idx > 0) setSection(SECTIONS[idx - 1].key)
    window.scrollTo(0, 0)
  }

  // ── Save all to Supabase ──────────────────────────────────────────
  async function saveAll() {
    setSaving(true); setSaveMsg('')
    try {
      // 1. Upsert patient demographics
      const patientPayload = {
        org_id: '00000000-0000-0000-0000-000000000001',
        first_name:          demo.first_name,
        last_name:           demo.last_name,
        birth:               demo.birth,
        gender:              demo.gender,
        preferred_pronouns:  demo.preferred_pronouns,
        ssn_last4:           demo.ssn_last4,
        is_us_resident:      demo.is_us_resident,
        country_code:        demo.country_code,
        preferred_language:  demo.preferred_language,
        interpreter_needed:  demo.interpreter_needed,
        race:                demo.race,
        ethnicity:           demo.ethnicity,
        marital_status:      demo.marital_status,
        // Contact
        cell_phone:          contact.cell_phone,
        home_phone:          contact.home_phone,
        email:               contact.email,
        address1:            contact.address1,
        address2:            contact.address2,
        city:                contact.city,
        state_province:      contact.state_province,
        zip_postal:          contact.zip_postal,
        emergency_contact_name:         contact.emergency_name,
        emergency_contact_phone:        contact.emergency_phone,
        emergency_contact_relationship: contact.emergency_relationship,
        // Medical
        medical_conditions:  [...medHx, otherCondition].filter(Boolean).join(', '),
        allergies:           noKnownAllergies ? 'NKDA' : allergies.map(a => `${a.substance} (${a.reaction}, ${a.severity})`).join('; '),
        surgical_history:    surgicalHx.join(', '),
        // Social
        tobacco_use:         socialHx.tobacco,
        alcohol_use:         socialHx.alcohol,
        substance_use:       socialHx.drugs,
        occupation:          socialHx.occupation,
        status:              'active',
        insert_date:         new Date().toISOString(),
        update_date:         new Date().toISOString(),
      }

      let pid = patientId
      if (pid) {
        await supabase.schema('cr').from('patient').update(patientPayload).eq('patient_id', pid)
      } else {
        const { data, error } = await supabase.schema('cr').from('patient').insert(patientPayload).select('patient_id').single()
        if (error) throw new Error(error.message)
        pid = data.patient_id
        setPatientId(pid)
      }

      // 2. Insurance
      if (ins.has_insurance && pid) {
        await supabase.schema('cr').from('patient_insurance').upsert({
          patient_id:                pid,
          org_id:                    '00000000-0000-0000-0000-000000000001',
          insurance_company_name:    ins.insurance_company,
          policy_number:             ins.policy_number,
          group_number:              ins.group_number,
          subscriber_name:           ins.subscriber_name,
          subscriber_dob:            ins.subscriber_dob,
          relationship_to_subscriber:ins.relationship_to_subscriber,
          coverage_type:             'primary',
          is_active:                 true,
          insert_date:               new Date().toISOString(),
        }, { onConflict: 'patient_id,coverage_type' })
      }

      // 3. Intake summary (saves to patient_intake for AI to read)
      if (pid) {
        const intakeSummary = {
          patient_id:    pid,
          org_id:        '00000000-0000-0000-0000-000000000001',
          completed_at:  new Date().toISOString(),
          medical_history: medHx.join(', '),
          current_medications: medications.filter(m=>m.name).map(m=>`${m.name} ${m.dose} ${m.frequency}`).join('; '),
          allergies_raw: noKnownAllergies ? 'NKDA' : allergies.filter(a=>a.substance).map(a=>`${a.substance}: ${a.reaction}`).join('; '),
          surgical_history: surgicalHx.join(', '),
          family_history: familyHx.map(f=>`${f.condition} (${f.relation})`).join(', '),
          social_history: JSON.stringify(socialHx),
          review_of_systems: JSON.stringify(ros),
          consents_signed: consents.treatment && consents.hipaa && consents.financial,
          consent_signature: consents.signature,
          consent_signed_date: consents.signed_date,
          source: 'patient_profiler',
          insert_date: new Date().toISOString(),
        }
        await supabase.schema('cr').from('patient_intake').upsert(intakeSummary, { onConflict: 'patient_id' })
      }

      markDone(section)
      setSection('complete')
      setSaveMsg('success')
    } catch (e: any) {
      setSaveMsg('error:' + e.message)
    }
    setSaving(false)
  }

  // ── Render ──────────────────────────────────────────────────────
  const current = SECTIONS.find(s => s.key === section)!

  return (
    <div style={g.shell}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; margin:0; padding:0 }
        select, input, textarea { color: #e8eaf0 !important; background: rgba(6,14,28,0.8) !important }
        select option { background: #060e1c }
        input:focus, select:focus, textarea:focus { border-color: rgba(201,169,110,0.5) !important; outline: none }
        ::-webkit-scrollbar { width: 6px } ::-webkit-scrollbar-track { background: #020a14 }
        ::-webkit-scrollbar-thumb { background: #3a4a6a; border-radius: 3px }
        @media (max-width: 700px) {
          .layout { grid-template-columns: 1fr !important }
          .sidebar { display: none }
        }
      `}</style>

      {/* NAV */}
      <nav style={g.nav}>
        <div style={g.logo}>
          <span style={{...g.badge, fontSize:10}}>PROFILER</span>
          PatientTrac
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          {patientId && <span style={{fontFamily:'DM Mono,monospace', fontSize:10, color:'#3a4a6a'}}>Patient #{patientId}</span>}
          <div style={{fontFamily:'DM Mono,monospace', fontSize:10, color:'#c9a96e'}}>{pct}% Complete</div>
        </div>
      </nav>

      <div style={{...g.layout}} className="layout">

        {/* SIDEBAR */}
        <div style={g.sidebar} className="sidebar">
          <div style={{padding:'0 20px 12px', fontFamily:'DM Mono,monospace', fontSize:9, color:'#3a4a6a', letterSpacing:'0.15em', textTransform:'uppercase'}}>Sections</div>
          {SECTIONS.map(sec => {
            const isActive = sec.key === section
            const isDone   = completed.has(sec.key)
            return (
              <div key={sec.key}
                onClick={() => setSection(sec.key)}
                style={{
                  ...g.sideItem,
                  ...(isActive ? g.sideActive : {}),
                  ...(isDone && !isActive ? g.sideDone : {}),
                  ...(!isDone && !isActive ? g.sidePend : {}),
                }}>
                <span style={g.sideIcon}>{sec.icon}</span>
                <span style={{fontSize:13}}>{sec.label}</span>
                {isDone && <span style={g.check}>✓</span>}
              </div>
            )
          })}
          {/* Progress bar */}
          <div style={{padding:'20px 20px 0'}}>
            <div style={{...g.progress, marginBottom:4}}>
              <div style={{...g.progressFill, width:`${pct}%`}}/>
            </div>
            <div style={{fontFamily:'DM Mono,monospace', fontSize:9, color:'#3a4a6a'}}>{pct}% of profile complete</div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={g.main}>

          {/* ── WELCOME ── */}
          {section === 'welcome' && (
            <div>
              <div style={{fontSize:11, fontFamily:'DM Mono,monospace', color:'#c9a96e', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12}}>✦ Patient Portal</div>
              <div style={{...g.ph, fontSize:36}}>Welcome to<br/>PatientTrac Profiler</div>
              <div style={g.psub}>
                Complete your patient profile before your visit. This information is securely shared with your healthcare provider and reduces paperwork on the day of your appointment.<br/><br/>
                Your data is protected under HIPAA. All information is encrypted and only accessible to your care team.
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:32}}>
                {[
                  ['🔐','HIPAA Compliant','Your health information is protected by federal law'],
                  ['⏱','Save Time','Complete this once — no paper forms at the office'],
                  ['🔄','Auto-Synced','Directly integrated with your provider\'s scheduling system'],
                  ['📱','Any Device','Complete on phone, tablet, or computer at your convenience'],
                ].map(([icon, title, desc]) => (
                  <div key={title as string} style={g.card}>
                    <div style={{fontSize:24, marginBottom:8}}>{icon}</div>
                    <div style={{fontSize:14, fontWeight:500, marginBottom:4}}>{title as string}</div>
                    <div style={{fontSize:12, color:'#8a9bc0', lineHeight:1.5}}>{desc as string}</div>
                  </div>
                ))}
              </div>
              <div style={{...g.card, borderColor:'rgba(0,212,255,0.15)', background:'rgba(0,212,255,0.04)'}}>
                <div style={{fontFamily:'DM Mono,monospace', fontSize:10, color:'#00d4ff', letterSpacing:'0.1em', marginBottom:8}}>ESTIMATED TIME</div>
                <div style={{fontSize:14, color:'#8a9bc0'}}>10–15 minutes to complete all sections. You can save progress and return at any time.</div>
              </div>
              <div style={g.btnRow}>
                <button onClick={nextSection} style={g.btn}>Begin Profile →</button>
              </div>
            </div>
          )}

          {/* ── DEMOGRAPHICS ── */}
          {section === 'demographics' && (
            <div>
              <div style={g.ph}>Personal Information</div>
              <div style={g.psub}>Please provide your legal name and personal details as they appear on your insurance card and ID.</div>
              <div style={g.row2}>
                <div style={g.fg}><label style={g.lbl}>First Name *</label><input value={demo.first_name} onChange={e=>setDemo(d=>({...d,first_name:e.target.value}))} placeholder="First name" style={g.inp}/></div>
                <div style={g.fg}><label style={g.lbl}>Last Name *</label><input value={demo.last_name} onChange={e=>setDemo(d=>({...d,last_name:e.target.value}))} placeholder="Last name" style={g.inp}/></div>
              </div>
              <div style={g.row3}>
                <div style={g.fg}><label style={g.lbl}>Date of Birth *</label><input type="date" value={demo.birth} onChange={e=>setDemo(d=>({...d,birth:e.target.value}))} style={g.inp}/></div>
                <div style={g.fg}><label style={g.lbl}>Sex at Birth *</label>
                  <select value={demo.gender} onChange={e=>setDemo(d=>({...d,gender:e.target.value}))} style={g.inp}>
                    <option value="">Select...</option>
                    <option>Male</option><option>Female</option><option>Intersex</option>
                  </select>
                </div>
                <div style={g.fg}><label style={g.lbl}>Preferred Pronouns</label>
                  <select value={demo.preferred_pronouns} onChange={e=>setDemo(d=>({...d,preferred_pronouns:e.target.value}))} style={g.inp}>
                    <option value="">Select...</option>
                    <option>He/Him</option><option>She/Her</option><option>They/Them</option><option>Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div style={g.row2}>
                <div style={g.fg}><label style={g.lbl}>Marital Status</label>
                  <select value={demo.marital_status} onChange={e=>setDemo(d=>({...d,marital_status:e.target.value}))} style={g.inp}>
                    <option value="">Select...</option>
                    <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option><option>Domestic Partnership</option><option>Separated</option>
                  </select>
                </div>
                <div style={g.fg}><label style={g.lbl}>Preferred Language</label>
                  <select value={demo.preferred_language} onChange={e=>setDemo(d=>({...d,preferred_language:e.target.value}))} style={g.inp}>
                    <option>English</option><option>Spanish</option><option>French</option><option>Portuguese</option><option>Creole</option><option>Mandarin</option><option>Arabic</option><option>Other</option>
                  </select>
                </div>
              </div>
              <Toggle label="I need an interpreter / translation services" value={demo.interpreter_needed} onChange={v=>setDemo(d=>({...d,interpreter_needed:v}))}/>
              <div style={g.divider}/>
              <div style={{...g.cardTitle, marginBottom:12}}>Race &amp; Ethnicity (optional — for healthcare statistics)</div>
              <div style={g.row2}>
                <div style={g.fg}><label style={g.lbl}>Race</label>
                  <select value={demo.race} onChange={e=>setDemo(d=>({...d,race:e.target.value}))} style={g.inp}>
                    <option value="">Prefer not to say</option>
                    <option>White</option><option>Black or African American</option><option>Asian</option>
                    <option>Hispanic or Latino</option><option>Native American</option>
                    <option>Pacific Islander</option><option>Two or more races</option><option>Other</option>
                  </select>
                </div>
                <div style={g.fg}><label style={g.lbl}>Ethnicity</label>
                  <select value={demo.ethnicity} onChange={e=>setDemo(d=>({...d,ethnicity:e.target.value}))} style={g.inp}>
                    <option value="">Prefer not to say</option>
                    <option>Hispanic or Latino</option><option>Not Hispanic or Latino</option>
                  </select>
                </div>
              </div>
              <div style={g.divider}/>
              <Toggle label="I am a US resident" value={demo.is_us_resident} onChange={v=>setDemo(d=>({...d,is_us_resident:v}))}/>
              {!demo.is_us_resident && (
                <div style={g.fg}>
                  <label style={g.lbl}>Country</label>
                  <select value={demo.country_code} onChange={e=>setDemo(d=>({...d,country_code:e.target.value}))} style={g.inp}>
                    <option value="CO">Colombia</option><option value="MX">Mexico</option>
                    <option value="BR">Brazil</option><option value="VE">Venezuela</option>
                    <option value="AR">Argentina</option><option value="PE">Peru</option>
                    <option value="CA">Canada</option><option value="FR">France</option>
                    <option value="GB">United Kingdom</option><option value="OTHER">Other</option>
                  </select>
                </div>
              )}
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} disabled={!demo.first_name||!demo.last_name||!demo.birth} style={!demo.first_name||!demo.last_name||!demo.birth?{...g.btn,opacity:0.4,cursor:'not-allowed'}:g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── CONTACT ── */}
          {section === 'contact' && (
            <div>
              <div style={g.ph}>Contact &amp; Address</div>
              <div style={g.psub}>We use this to send appointment reminders, intake links, and important health communications.</div>
              <div style={g.row2}>
                <div style={g.fg}><label style={g.lbl}>Cell Phone *</label><input value={contact.cell_phone} onChange={e=>setContact(c=>({...c,cell_phone:e.target.value}))} placeholder="(305) 555-0100" style={g.inp}/></div>
                <div style={g.fg}><label style={g.lbl}>Home Phone</label><input value={contact.home_phone} onChange={e=>setContact(c=>({...c,home_phone:e.target.value}))} placeholder="(305) 555-0200" style={g.inp}/></div>
              </div>
              <div style={g.fg}><label style={g.lbl}>Email Address *</label><input type="email" value={contact.email} onChange={e=>setContact(c=>({...c,email:e.target.value}))} placeholder="you@email.com" style={g.inp}/></div>
              <div style={g.divider}/>
              <div style={{...g.cardTitle, marginBottom:12}}>Home Address</div>
              <div style={g.fg}><label style={g.lbl}>Street Address *</label><input value={contact.address1} onChange={e=>setContact(c=>({...c,address1:e.target.value}))} placeholder="123 Main Street" style={g.inp}/></div>
              <div style={g.fg}><label style={g.lbl}>Apt / Suite / Unit</label><input value={contact.address2} onChange={e=>setContact(c=>({...c,address2:e.target.value}))} placeholder="Apt 4B" style={g.inp}/></div>
              <div style={g.row3}>
                <div style={g.fg}><label style={g.lbl}>City *</label><input value={contact.city} onChange={e=>setContact(c=>({...c,city:e.target.value}))} placeholder="Miami" style={g.inp}/></div>
                <div style={g.fg}><label style={g.lbl}>State *</label><input value={contact.state_province} onChange={e=>setContact(c=>({...c,state_province:e.target.value}))} placeholder="FL" style={g.inp}/></div>
                <div style={g.fg}><label style={g.lbl}>ZIP Code *</label><input value={contact.zip_postal} onChange={e=>setContact(c=>({...c,zip_postal:e.target.value}))} placeholder="33101" style={g.inp}/></div>
              </div>
              <div style={g.divider}/>
              <div style={{...g.cardTitle, marginBottom:12}}>Emergency Contact</div>
              <div style={g.row2}>
                <div style={g.fg}><label style={g.lbl}>Full Name *</label><input value={contact.emergency_name} onChange={e=>setContact(c=>({...c,emergency_name:e.target.value}))} placeholder="Jane Doe" style={g.inp}/></div>
                <div style={g.fg}><label style={g.lbl}>Phone *</label><input value={contact.emergency_phone} onChange={e=>setContact(c=>({...c,emergency_phone:e.target.value}))} placeholder="(305) 555-0300" style={g.inp}/></div>
              </div>
              <div style={g.fg}><label style={g.lbl}>Relationship</label>
                <select value={contact.emergency_relationship} onChange={e=>setContact(c=>({...c,emergency_relationship:e.target.value}))} style={g.inp}>
                  <option>Spouse</option><option>Parent</option><option>Child</option><option>Sibling</option>
                  <option>Friend</option><option>Partner</option><option>Other</option>
                </select>
              </div>
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} style={g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── INSURANCE ── */}
          {section === 'insurance' && (
            <div>
              <div style={g.ph}>Insurance Information</div>
              <div style={g.psub}>Please have your insurance card handy. This information is used for billing and eligibility verification.</div>
              <Toggle label="I have health insurance" value={ins.has_insurance} onChange={v=>setIns(i=>({...i,has_insurance:v}))}/>
              {ins.has_insurance && (
                <>
                  <div style={{...g.card, marginTop:16}}>
                    <div style={g.cardTitle}>Primary Insurance</div>
                    <div style={g.row2}>
                      <div style={g.fg}><label style={g.lbl}>Insurance Company *</label>
                        <select value={ins.insurance_company} onChange={e=>setIns(i=>({...i,insurance_company:e.target.value}))} style={g.inp}>
                          <option value="">Select insurance...</option>
                          <option>Aetna</option><option>Blue Cross Blue Shield</option><option>Cigna</option>
                          <option>UnitedHealthcare</option><option>Humana</option><option>Medicare</option>
                          <option>Medicaid</option><option>Tricare</option><option>Molina Healthcare</option>
                          <option>Centene</option><option>Other</option>
                        </select>
                      </div>
                      <div style={g.fg}><label style={g.lbl}>Member/Policy Number *</label><input value={ins.policy_number} onChange={e=>setIns(i=>({...i,policy_number:e.target.value}))} placeholder="From your insurance card" style={g.inp}/></div>
                    </div>
                    <div style={g.row2}>
                      <div style={g.fg}><label style={g.lbl}>Group Number</label><input value={ins.group_number} onChange={e=>setIns(i=>({...i,group_number:e.target.value}))} placeholder="Group # from card" style={g.inp}/></div>
                      <div style={g.fg}><label style={g.lbl}>Relationship to Subscriber</label>
                        <select value={ins.relationship_to_subscriber} onChange={e=>setIns(i=>({...i,relationship_to_subscriber:e.target.value}))} style={g.inp}>
                          <option>Self</option><option>Spouse</option><option>Child</option><option>Other</option>
                        </select>
                      </div>
                    </div>
                    {ins.relationship_to_subscriber !== 'Self' && (
                      <div style={g.row2}>
                        <div style={g.fg}><label style={g.lbl}>Subscriber Name</label><input value={ins.subscriber_name} onChange={e=>setIns(i=>({...i,subscriber_name:e.target.value}))} placeholder="Policy holder name" style={g.inp}/></div>
                        <div style={g.fg}><label style={g.lbl}>Subscriber Date of Birth</label><input type="date" value={ins.subscriber_dob} onChange={e=>setIns(i=>({...i,subscriber_dob:e.target.value}))} style={g.inp}/></div>
                      </div>
                    )}
                  </div>
                  <div style={g.card}>
                    <div style={g.cardTitle}>Secondary Insurance (optional)</div>
                    <div style={g.row2}>
                      <div style={g.fg}><label style={g.lbl}>Secondary Insurer</label><input value={ins.secondary_insurance} onChange={e=>setIns(i=>({...i,secondary_insurance:e.target.value}))} placeholder="Secondary insurance name" style={g.inp}/></div>
                      <div style={g.fg}><label style={g.lbl}>Policy Number</label><input value={ins.secondary_policy} onChange={e=>setIns(i=>({...i,secondary_policy:e.target.value}))} placeholder="Policy #" style={g.inp}/></div>
                    </div>
                  </div>
                </>
              )}
              {!ins.has_insurance && (
                <div style={{...g.card, marginTop:16, borderColor:'rgba(251,191,36,0.2)', background:'rgba(251,191,36,0.04)'}}>
                  <div style={{fontSize:13, color:'#8a9bc0'}}>We offer self-pay options. Our billing team will contact you to discuss payment plans before your visit.</div>
                </div>
              )}
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} style={g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── MEDICAL HISTORY ── */}
          {section === 'medical_history' && (
            <div>
              <div style={g.ph}>Medical History</div>
              <div style={g.psub}>Select all conditions you have been diagnosed with or currently manage. Check all that apply.</div>
              <TagPicker options={CONDITIONS} selected={medHx} onChange={setMedHx}/>
              <div style={{...g.fg, marginTop:16}}>
                <label style={g.lbl}>Other conditions not listed above</label>
                <textarea value={otherCondition} onChange={e=>setOtherCondition(e.target.value)} placeholder="List any other diagnoses, conditions, or chronic illnesses..." style={g.ta}/>
              </div>
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} style={g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── MEDICATIONS ── */}
          {section === 'medications' && (
            <div>
              <div style={g.ph}>Current Medications</div>
              <div style={g.psub}>List all prescription medications, over-the-counter drugs, vitamins, and supplements you are currently taking.</div>
              {medications.map((med, i) => (
                <div key={i} style={{...g.card, marginBottom:12}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                    <div style={g.cardTitle}>Medication {i+1}</div>
                    {i > 0 && <button onClick={()=>setMedications(m=>m.filter((_,j)=>j!==i))} style={{background:'transparent', border:'none', color:'#ff6b6b', cursor:'pointer', fontSize:12}}>Remove</button>}
                  </div>
                  <div style={g.row2}>
                    <div style={g.fg}><label style={g.lbl}>Medication Name *</label><input value={med.name} onChange={e=>setMedications(m=>m.map((x,j)=>j===i?{...x,name:e.target.value}:x))} placeholder="e.g. Metformin" style={g.inp}/></div>
                    <div style={g.fg}><label style={g.lbl}>Dose / Strength</label><input value={med.dose} onChange={e=>setMedications(m=>m.map((x,j)=>j===i?{...x,dose:e.target.value}:x))} placeholder="e.g. 500mg" style={g.inp}/></div>
                  </div>
                  <div style={g.row2}>
                    <div style={g.fg}><label style={g.lbl}>Frequency</label>
                      <select value={med.frequency} onChange={e=>setMedications(m=>m.map((x,j)=>j===i?{...x,frequency:e.target.value}:x))} style={g.inp}>
                        <option value="">Select...</option>
                        <option>Once daily</option><option>Twice daily</option><option>Three times daily</option>
                        <option>Four times daily</option><option>As needed (PRN)</option><option>Weekly</option><option>Other</option>
                      </select>
                    </div>
                    <div style={g.fg}><label style={g.lbl}>Reason / Condition</label><input value={med.reason} onChange={e=>setMedications(m=>m.map((x,j)=>j===i?{...x,reason:e.target.value}:x))} placeholder="e.g. Diabetes" style={g.inp}/></div>
                  </div>
                  <div style={g.fg}><label style={g.lbl}>Prescribing Doctor</label><input value={med.prescriber} onChange={e=>setMedications(m=>m.map((x,j)=>j===i?{...x,prescriber:e.target.value}:x))} placeholder="Dr. Name" style={g.inp}/></div>
                </div>
              ))}
              <button onClick={()=>setMedications(m=>[...m,{name:'',dose:'',frequency:'',reason:'',prescriber:''}])} style={g.addBtn}>+ Add another medication</button>
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} style={g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── ALLERGIES ── */}
          {section === 'allergies' && (
            <div>
              <div style={g.ph}>Allergies</div>
              <div style={g.psub}>List all known allergies to medications, foods, latex, or environmental triggers.</div>
              <Toggle label="No known drug allergies (NKDA)" value={noKnownAllergies} onChange={setNoKnownAllergies}/>
              {!noKnownAllergies && (
                <>
                  {allergies.map((al, i) => (
                    <div key={i} style={{...g.card, marginBottom:12}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                        <div style={g.cardTitle}>Allergy {i+1}</div>
                        {i > 0 && <button onClick={()=>setAllergies(a=>a.filter((_,j)=>j!==i))} style={{background:'transparent', border:'none', color:'#ff6b6b', cursor:'pointer', fontSize:12}}>Remove</button>}
                      </div>
                      <div style={g.row3}>
                        <div style={g.fg}><label style={g.lbl}>Substance / Allergen *</label><input value={al.substance} onChange={e=>setAllergies(a=>a.map((x,j)=>j===i?{...x,substance:e.target.value}:x))} placeholder="e.g. Penicillin" style={g.inp}/></div>
                        <div style={g.fg}><label style={g.lbl}>Reaction</label><input value={al.reaction} onChange={e=>setAllergies(a=>a.map((x,j)=>j===i?{...x,reaction:e.target.value}:x))} placeholder="e.g. Hives, anaphylaxis" style={g.inp}/></div>
                        <div style={g.fg}><label style={g.lbl}>Severity</label>
                          <select value={al.severity} onChange={e=>setAllergies(a=>a.map((x,j)=>j===i?{...x,severity:e.target.value}:x))} style={g.inp}>
                            <option>Mild</option><option>Moderate</option><option>Severe</option><option>Life-threatening</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>setAllergies(a=>[...a,{substance:'',reaction:'',severity:'Mild'}])} style={g.addBtn}>+ Add another allergy</button>
                </>
              )}
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} style={g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── SURGICAL HISTORY ── */}
          {section === 'surgical_history' && (
            <div>
              <div style={g.ph}>Surgical History</div>
              <div style={g.psub}>Select any procedures or surgeries you have had. Then add details below.</div>
              <TagPicker options={SURGICAL_PROCS} selected={surgicalHx} onChange={setSurgicalHx}/>
              {surgicalHx.length > 0 && (
                <div style={{marginTop:20}}>
                  <div style={{...g.cardTitle, marginBottom:12}}>Surgical Details (optional)</div>
                  {surgicalDetails.map((sd, i) => (
                    <div key={i} style={{...g.card, marginBottom:12}}>
                      <div style={g.row2}>
                        <div style={g.fg}><label style={g.lbl}>Procedure</label><input value={sd.procedure} onChange={e=>setSurgicalDetails(s=>s.map((x,j)=>j===i?{...x,procedure:e.target.value}:x))} placeholder="Procedure name" style={g.inp}/></div>
                        <div style={g.fg}><label style={g.lbl}>Year</label><input value={sd.year} onChange={e=>setSurgicalDetails(s=>s.map((x,j)=>j===i?{...x,year:e.target.value}:x))} placeholder="e.g. 2019" style={g.inp}/></div>
                      </div>
                      <div style={g.row2}>
                        <div style={g.fg}><label style={g.lbl}>Surgeon / Doctor</label><input value={sd.surgeon} onChange={e=>setSurgicalDetails(s=>s.map((x,j)=>j===i?{...x,surgeon:e.target.value}:x))} placeholder="Dr. Name" style={g.inp}/></div>
                        <div style={g.fg}><label style={g.lbl}>Hospital / Facility</label><input value={sd.hospital} onChange={e=>setSurgicalDetails(s=>s.map((x,j)=>j===i?{...x,hospital:e.target.value}:x))} placeholder="Hospital name" style={g.inp}/></div>
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>setSurgicalDetails(s=>[...s,{procedure:'',year:'',surgeon:'',hospital:''}])} style={g.addBtn}>+ Add another surgery detail</button>
                </div>
              )}
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} style={g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── FAMILY HISTORY ── */}
          {section === 'family_history' && (
            <div>
              <div style={g.ph}>Family History</div>
              <div style={g.psub}>Select conditions that run in your immediate family (parents, siblings, grandparents, children).</div>
              {FAMILY_CONDITIONS.map(cond => {
                const existing = familyHx.find(f=>f.condition===cond)
                return (
                  <div key={cond} style={{...g.card, marginBottom:10}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                      <div style={{fontSize:14, color: existing ? '#e8eaf0' : '#3a4a6a'}}>{cond}</div>
                      {existing ? (
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <select value={existing.relation} onChange={e=>setFamilyHx(f=>f.map(x=>x.condition===cond?{...x,relation:e.target.value}:x))} style={{...g.inp, width:140, padding:'6px 10px', fontSize:12}}>
                            <option>Mother</option><option>Father</option><option>Sibling</option>
                            <option>Maternal grandmother</option><option>Maternal grandfather</option>
                            <option>Paternal grandmother</option><option>Paternal grandfather</option>
                            <option>Child</option><option>Multiple family members</option>
                          </select>
                          <button onClick={()=>setFamilyHx(f=>f.filter(x=>x.condition!==cond))} style={{background:'transparent', border:'none', color:'#ff6b6b', cursor:'pointer', fontSize:18}}>×</button>
                        </div>
                      ) : (
                        <button onClick={()=>setFamilyHx(f=>[...f,{condition:cond,relation:'Mother'}])} style={{...g.btnSec, padding:'4px 12px', fontSize:11}}>+ Add</button>
                      )}
                    </div>
                  </div>
                )
              })}
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} style={g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── SOCIAL HISTORY ── */}
          {section === 'social_history' && (
            <div>
              <div style={g.ph}>Social History</div>
              <div style={g.psub}>This information helps your provider understand your lifestyle and health risk factors. All information is confidential.</div>
              <div style={g.card}>
                <div style={g.cardTitle}>Tobacco Use</div>
                <div style={g.fg}><label style={g.lbl}>Tobacco status</label>
                  <select value={socialHx.tobacco} onChange={e=>setSocialHx(s=>({...s,tobacco:e.target.value}))} style={g.inp}>
                    <option>Never</option><option>Former smoker</option><option>Current smoker</option><option>Smokeless tobacco</option><option>E-cigarette / Vaping</option>
                  </select>
                </div>
                {socialHx.tobacco.includes('smoker') && (
                  <div style={g.row2}>
                    <div style={g.fg}><label style={g.lbl}>Packs per day</label><input value={socialHx.tobacco_ppd} onChange={e=>setSocialHx(s=>({...s,tobacco_ppd:e.target.value}))} placeholder="e.g. 0.5" style={g.inp}/></div>
                    <div style={g.fg}><label style={g.lbl}>Years smoked</label><input value={socialHx.tobacco_years} onChange={e=>setSocialHx(s=>({...s,tobacco_years:e.target.value}))} placeholder="e.g. 10" style={g.inp}/></div>
                  </div>
                )}
              </div>
              <div style={g.card}>
                <div style={g.cardTitle}>Alcohol Use</div>
                <div style={g.fg}><label style={g.lbl}>Alcohol consumption</label>
                  <select value={socialHx.alcohol} onChange={e=>setSocialHx(s=>({...s,alcohol:e.target.value}))} style={g.inp}>
                    <option>Never</option><option>Occasional (social)</option><option>Moderate (1–2 drinks/day)</option><option>Heavy (3+ drinks/day)</option><option>Former drinker</option>
                  </select>
                </div>
                {socialHx.alcohol !== 'Never' && socialHx.alcohol !== 'Former drinker' && (
                  <div style={g.fg}><label style={g.lbl}>Approximate drinks per week</label><input value={socialHx.alcohol_drinks_week} onChange={e=>setSocialHx(s=>({...s,alcohol_drinks_week:e.target.value}))} placeholder="e.g. 3" style={g.inp}/></div>
                )}
              </div>
              <div style={g.card}>
                <div style={g.cardTitle}>Recreational Drug Use</div>
                <div style={g.fg}><label style={g.lbl}>Recreational drug use</label>
                  <select value={socialHx.drugs} onChange={e=>setSocialHx(s=>({...s,drugs:e.target.value}))} style={g.inp}>
                    <option>Never</option><option>Former use</option><option>Current use</option>
                  </select>
                </div>
                {socialHx.drugs !== 'Never' && (
                  <div style={g.fg}><label style={g.lbl}>Type(s) — optional</label><input value={socialHx.drug_types} onChange={e=>setSocialHx(s=>({...s,drug_types:e.target.value}))} placeholder="Cannabis, etc." style={g.inp}/></div>
                )}
              </div>
              <div style={g.card}>
                <div style={g.cardTitle}>Lifestyle</div>
                <div style={g.row2}>
                  <div style={g.fg}><label style={g.lbl}>Exercise level</label>
                    <select value={socialHx.exercise} onChange={e=>setSocialHx(s=>({...s,exercise:e.target.value}))} style={g.inp}>
                      <option>Sedentary</option><option>Light (1–2x/week)</option><option>Moderate (3–4x/week)</option><option>Active (5+ days/week)</option><option>Athlete</option>
                    </select>
                  </div>
                  <div style={g.fg}><label style={g.lbl}>Diet</label>
                    <select value={socialHx.diet} onChange={e=>setSocialHx(s=>({...s,diet:e.target.value}))} style={g.inp}>
                      <option>Mixed / No restrictions</option><option>Vegetarian</option><option>Vegan</option>
                      <option>Low-carb / Keto</option><option>Diabetic diet</option><option>Heart-healthy</option><option>Gluten-free</option>
                    </select>
                  </div>
                </div>
                <div style={g.row2}>
                  <div style={g.fg}><label style={g.lbl}>Occupation</label><input value={socialHx.occupation} onChange={e=>setSocialHx(s=>({...s,occupation:e.target.value}))} placeholder="Your job / profession" style={g.inp}/></div>
                  <div style={g.fg}><label style={g.lbl}>Highest education</label>
                    <select value={socialHx.highest_education} onChange={e=>setSocialHx(s=>({...s,highest_education:e.target.value}))} style={g.inp}>
                      <option value="">Select...</option>
                      <option>Less than high school</option><option>High school / GED</option><option>Some college</option>
                      <option>Associate degree</option><option>Bachelor's degree</option><option>Graduate degree</option><option>Doctoral degree</option>
                    </select>
                  </div>
                </div>
                <div style={g.fg}><label style={g.lbl}>Living situation</label>
                  <select value={socialHx.living_situation} onChange={e=>setSocialHx(s=>({...s,living_situation:e.target.value}))} style={g.inp}>
                    <option value="">Select...</option>
                    <option>Lives alone</option><option>Lives with spouse/partner</option><option>Lives with family</option>
                    <option>Lives with roommates</option><option>Assisted living</option><option>Unhoused</option>
                  </select>
                </div>
              </div>
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} style={g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── REVIEW OF SYSTEMS ── */}
          {section === 'review_of_systems' && (
            <div>
              <div style={g.ph}>Review of Systems</div>
              <div style={g.psub}>Check any symptoms you have experienced in the past 30 days.</div>
              {SYSTEMS.map(({ system, symptoms }) => (
                <div key={system} style={g.card}>
                  <div style={g.cardTitle}>{system}</div>
                  <TagPicker
                    options={symptoms}
                    selected={ros[system] ?? []}
                    onChange={vals => setRos(r => ({...r, [system]: vals}))}
                    red
                  />
                </div>
              ))}
              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button onClick={nextSection} style={g.btn}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── CONSENT ── */}
          {section === 'consent' && (
            <div>
              <div style={g.ph}>Consent Forms</div>
              <div style={g.psub}>Please read and acknowledge each consent form below. Your electronic signature is legally equivalent to a handwritten signature.</div>

              {[
                {key:'treatment', title:'Consent to Treatment', body:'I consent to the medical examination and treatment by the healthcare providers at this practice. I understand that treatment may include physical examination, diagnostic tests, medical procedures, and other necessary care. I have the right to refuse any treatment at any time.'},
                {key:'hipaa', title:'HIPAA Privacy Notice Acknowledgment', body:'I acknowledge that I have received and/or been offered access to the Notice of Privacy Practices. I understand how my protected health information (PHI) may be used and disclosed for treatment, payment, and healthcare operations. My information will not be sold or used for marketing without my explicit consent.'},
                {key:'financial', title:'Financial Responsibility Agreement', body:'I agree to be financially responsible for all charges for services rendered. I authorize the release of medical information necessary to process insurance claims. I assign insurance benefits directly to the provider. I understand that I am responsible for co-pays, deductibles, and any balances not covered by my insurance.'},
                {key:'telehealth', title:'Telehealth Consent (optional)', body:'I consent to the use of telehealth technologies for my medical care, including video visits, secure messaging, and remote monitoring. I understand that telehealth visits are subject to the same privacy protections as in-person visits.'},
                {key:'photo', title:'Photo / Recording Consent (optional)', body:'I consent to the use of photographs or recordings for medical documentation, educational, or treatment purposes. Images will be kept confidential and will not be used publicly without separate written consent.'},
                {key:'research', title:'Research / Quality Improvement (optional)', body:'I consent to the use of my de-identified health information for quality improvement research, clinical studies, and population health analytics. My identity will never be disclosed. I may withdraw this consent at any time.'},
              ].map(({ key, title, body }) => (
                <div key={key} style={{...g.card, marginBottom:12, borderColor: (consents as any)[key] ? 'rgba(74,222,128,0.2)' : 'rgba(201,169,110,0.1)', background: (consents as any)[key] ? 'rgba(74,222,128,0.03)' : 'rgba(10,22,40,0.7)'}}>
                  <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
                    <div
                      onClick={()=>setConsents(c=>({...c,[key]:!(c as any)[key]}))}
                      style={{...g.checkbox, ...(((consents as any)[key]) ? g.checkOn : {}), display:'flex', alignItems:'center', justifyContent:'center', marginTop:2, flexShrink:0, cursor:'pointer'}}>
                      {(consents as any)[key] && <span style={{color:'#020a14', fontSize:10, fontWeight:700}}>✓</span>}
                    </div>
                    <div>
                      <div style={{fontSize:14, fontWeight:500, marginBottom:6, color: (consents as any)[key] ? '#4ade80' : '#e8eaf0'}}>{title}</div>
                      <div style={{fontSize:12, color:'#8a9bc0', lineHeight:1.6}}>{body}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div style={g.divider}/>
              <div style={{...g.cardTitle, marginBottom:12}}>Electronic Signature</div>
              <div style={g.row2}>
                <div style={g.fg}><label style={g.lbl}>Full Name (as signature) *</label><input value={consents.signature} onChange={e=>setConsents(c=>({...c,signature:e.target.value}))} placeholder="Type your full legal name" style={{...g.inp, fontStyle:'italic', fontSize:16}}/></div>
                <div style={g.fg}><label style={g.lbl}>Date</label><input type="date" value={consents.signed_date} onChange={e=>setConsents(c=>({...c,signed_date:e.target.value}))} style={g.inp}/></div>
              </div>
              <div style={{...g.card, background:'rgba(0,212,255,0.03)', borderColor:'rgba(0,212,255,0.12)', marginTop:8}}>
                <div style={{fontSize:12, color:'#8a9bc0'}}>
                  By typing your name above, you are electronically signing this document. This electronic signature is legally binding under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act).
                </div>
              </div>

              {saveMsg.startsWith('error') && <div style={{...g.err, marginTop:16}}>{saveMsg.replace('error:','')}</div>}

              <div style={g.btnRow}>
                <button onClick={prevSection} style={g.btnSec}>← Back</button>
                <button
                  onClick={saveAll}
                  disabled={saving || !consents.treatment || !consents.hipaa || !consents.financial || !consents.signature}
                  style={saving || !consents.treatment || !consents.hipaa || !consents.financial || !consents.signature
                    ? {...g.btn, opacity:0.4, cursor:'not-allowed'}
                    : g.btn}>
                  {saving ? 'Submitting...' : 'Submit Profile →'}
                </button>
              </div>
            </div>
          )}

          {/* ── COMPLETE ── */}
          {section === 'complete' && (
            <div style={{textAlign:'center', paddingTop:40}}>
              <div style={{fontSize:64, marginBottom:20}}>✅</div>
              <div style={{...g.ph, fontSize:36, textAlign:'center'}}>Profile Complete!</div>
              <div style={{...g.psub, textAlign:'center', maxWidth:520, margin:'0 auto 32px'}}>
                Your patient profile has been securely submitted and is now available to your care team. You will receive a confirmation by email and SMS shortly.
              </div>
              {patientId && (
                <div style={{...g.card, display:'inline-block', minWidth:320, textAlign:'left', marginBottom:24}}>
                  <div style={g.cardTitle}>Profile Summary</div>
                  <div style={{fontSize:14, color:'#8a9bc0', lineHeight:2}}>
                    <div>Patient: <span style={{color:'#e8eaf0'}}>{demo.first_name} {demo.last_name}</span></div>
                    <div>Patient ID: <span style={{color:'#c9a96e', fontFamily:'DM Mono,monospace'}}>#{patientId}</span></div>
                    <div>Conditions logged: <span style={{color:'#e8eaf0'}}>{medHx.length}</span></div>
                    <div>Medications: <span style={{color:'#e8eaf0'}}>{medications.filter(m=>m.name).length}</span></div>
                    <div>Consents signed: <span style={{color:'#4ade80'}}>✓ Treatment · HIPAA · Financial</span></div>
                  </div>
                </div>
              )}
              <div style={{display:'flex', flexDirection:'column', gap:12, alignItems:'center'}}>
                <div style={{fontSize:13, color:'#8a9bc0'}}>What happens next:</div>
                {[
                  '📧 Confirmation email sent to ' + (contact.email || 'your email'),
                  '💬 Your provider will review your profile before the visit',
                  '🔄 Information is now live in the scheduling system',
                  '📋 No paper forms needed at your appointment',
                ].map(item => <div key={item} style={{fontSize:13, color:'#8a9bc0'}}>{item}</div>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Patient Assistant ── */}
      {section !== 'welcome' && section !== 'complete' && (
        showAI ? (
          <AIAssistant
            lang={lang}
            currentSection={section.replace(/_/g, ' ')}
            patientName={demo.first_name || undefined}
            onClose={() => setShowAI(false)}
          />
        ) : (
          <button
            onClick={() => setShowAI(true)}
            style={{
              position: 'fixed', bottom: 24, right: 24, zIndex: 200,
              background: '#c9a96e', color: '#020a14', border: 'none',
              width: 56, height: 56, borderRadius: '50%', fontSize: 24,
              cursor: 'pointer', boxShadow: '0 4px 24px rgba(201,169,110,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title={lang === 'es' ? 'Asistente IA' : lang === 'fr' ? 'Assistant IA' : 'AI Assistant'}>
            🤖
          </button>
        )
      )}
    </div>
  )
}
