import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { useToken } from './hooks/useToken'
import { useProgress } from './hooks/useProgress'
import { useTranslation } from './i18n'
import type { Lang, ProfileFormData, MedicationEntry, InsuranceEntry } from './types'
import { STEPS } from './types'

// ── Step components (inline for single-file build; extract as needed) ────────
import StepPersonal   from './pages/StepPersonal'
import StepContact    from './pages/StepContact'
import StepIdentity   from './pages/StepIdentity'
import StepEmergency  from './pages/StepEmergency'
import StepMedical    from './pages/StepMedical'
import StepSystems    from './pages/StepSystems'
import StepInsurance  from './pages/StepInsurance'
import StepConsent    from './pages/StepConsent'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  navy950: '#020a14', navy900: '#060e1c', navy800: '#0a1628', navy700: '#0f2040',
  gold: '#c9a96e', goldLt: '#e8cc9a',
  cyan: '#00d4ff', text: '#e8eaf0', muted: '#8a9bc0', subtle: '#3a4a6a',
  green: '#4ade80', red: '#ff6b6b',
}

const EMPTY_FORM: ProfileFormData = {
  first_name: '', last_name: '', middle_name: '', birth: '', gender: '', preferred_pronoun: '',
  preferred_language: 'en', interpreter_needed: false,
  email: '', cell_phone: '', home_phone: '', work_phone: '',
  is_us_resident: true, country_code: 'US', address1: '', address2: '',
  city: '', state_province: '', zip_postal: '',
  race: '', ethnicity: '', marital_status: '', employment_status: '',
  ssn_last4: '', tax_id_type: 'SSN', passport_number: '', passport_country: '',
  emergency_name: '', emergency_relationship: '', emergency_phone: '', emergency_email: '',
  chief_complaint: '', allergies: '', current_medications: [], surgical_history: '',
  family_history: '', social_history: '',
  ros_constitutional: [], ros_cardiovascular: [], ros_respiratory: [],
  ros_gastrointestinal: [], ros_musculoskeletal: [], ros_neurological: [],
  ros_psychiatric: [], ros_skin: [],
  insurance: [],
  consent_treatment: false, consent_privacy: false, consent_hipaa: false,
  consent_telehealth: false, signature_data: '', signature_date: '',
}

export default function App() {
  const { session, loading: sessionLoading, error: sessionError } = useToken()

  const sessionKey  = session?.token ?? session?.email ?? 'standalone'
  const { savedStep, savedData, saveProgress, clearProgress, lastSaved, isSaving } = useProgress(sessionKey)

  // Language — URL param → localStorage → browser lang → 'en'
  const [lang, setLang] = useState<Lang>(() => {
    const stored = sessionStorage.getItem('ptrac_lang') as Lang | null
    if (stored && ['en', 'es', 'fr'].includes(stored)) return stored
    const nav = navigator.language?.slice(0, 2)
    if (nav === 'es') return 'es'
    if (nav === 'fr') return 'fr'
    return 'en'
  })

  const tr = useTranslation(lang)

  const [step,     setStep]     = useState(0)          // 0 = welcome screen
  const [formData, setFormData] = useState<ProfileFormData>({ ...EMPTY_FORM })
  const [errors,   setErrors]   = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Restore saved progress on session ready
  useEffect(() => {
    if (session && savedStep > 0) {
      setFormData(prev => ({ ...prev, ...savedData }))
      setStep(savedStep)
    }
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  // Language preference sync
  useEffect(() => {
    sessionStorage.setItem('ptrac_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  // Auto-save on form changes (debounced inside hook)
  const updateForm = useCallback(<K extends keyof ProfileFormData>(
    field: K, value: ProfileFormData[K]
  ) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      if (step > 0) saveProgress(step, next)
      return next
    })
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }, [step, saveProgress])

  const updateFormMany = useCallback((updates: Partial<ProfileFormData>) => {
    setFormData(prev => {
      const next = { ...prev, ...updates }
      if (step > 0) saveProgress(step, next)
      return next
    })
  }, [step, saveProgress])

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setStep(s => Math.min(s + 1, STEPS.length))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goBack = useCallback(() => {
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const jumpToStep = useCallback((n: number) => {
    if (n <= step) {
      setStep(n)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  // ── Final Submit ────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!session) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      const now = new Date().toISOString()

      // 1. Upsert cr.patient
      const patientPayload = {
        org_id:              session.orgId,
        first_name:          formData.first_name,
        last_name:           formData.last_name,
        middle_name:         formData.middle_name || null,
        birth:               formData.birth || null,
        gender:              formData.gender || null,
        preferred_pronoun:   formData.preferred_pronoun || null,
        preferred_language:  formData.preferred_language,
        interpreter_needed:  formData.interpreter_needed,
        email:               formData.email,
        cell_phone:          formData.cell_phone || null,
        home_phone:          formData.home_phone || null,
        work_phone:          formData.work_phone || null,
        is_us_resident:      formData.is_us_resident,
        country_code:        formData.country_code,
        address1:            formData.address1 || null,
        address2:            formData.address2 || null,
        city:                formData.city || null,
        state_province:      formData.state_province || null,
        zip_postal:          formData.zip_postal || null,
        race:                formData.race || null,
        ethnicity:           formData.ethnicity || null,
        marital_status:      formData.marital_status || null,
        employment_status:   formData.employment_status || null,
        ssn_last4:           formData.ssn_last4 || null,
        tax_id_type:         formData.tax_id_type || null,
        passport_number:     formData.passport_number || null,
        passport_country:    formData.passport_country || null,
        emergency_name:      formData.emergency_name || null,
        emergency_relationship: formData.emergency_relationship || null,
        emergency_phone:     formData.emergency_phone || null,
        emergency_email:     formData.emergency_email || null,
        allergies:           formData.allergies || null,
        status:              'active',
        insert_date:         now,
        ...(session.patientId && { patient_id: session.patientId }),
      }

      let patientId = session.patientId
      if (patientId) {
        // Update existing patient
        await supabase.from('patient').update(patientPayload).eq('patient_id', patientId).eq('org_id', session.orgId)
      } else {
        // Insert new patient
        const { data: p, error: pErr } = await supabase.from('patient').insert(patientPayload).select('patient_id').single()
        if (pErr || !p) throw new Error(pErr?.message ?? 'Failed to create patient record')
        patientId = p.patient_id
      }

      // 2. Insert medications into cr.medications
      if (formData.current_medications.length > 0) {
        // Remove existing draft meds for this patient first (profiler session)
        await supabase.from('medications').delete().eq('patient_id', patientId).eq('org_id', session.orgId).eq('source', 'profiler')
        const meds = formData.current_medications.map((m: MedicationEntry) => ({
          patient_id:  patientId,
          org_id:      session.orgId,
          med_name:    m.name,
          dosage:      m.dose,
          frequency:   m.frequency,
          indication:  m.reason,
          source:      'profiler',
          start_date:  now,
        }))
        await supabase.from('medications').insert(meds)
      }

      // 3. Insert insurance into cr.patient_insurance
      if (formData.insurance.length > 0) {
        await supabase.from('patient_insurance').delete().eq('patient_id', patientId).eq('org_id', session.orgId)
        const ins = formData.insurance.map((i: InsuranceEntry) => ({
          patient_id:       patientId,
          org_id:           session.orgId,
          priority:         i.priority,
          company_name:     i.company_name,
          plan_name:        i.plan_name || null,
          member_id:        i.member_id || null,
          group_number:     i.group_number || null,
          subscriber_name:  i.subscriber_name || null,
          subscriber_dob:   i.subscriber_dob || null,
          relationship:     i.relationship || null,
          copay:            i.copay ?? null,
          deductible:       i.deductible ?? null,
          eligibility_status: 'pending',
          insert_date:      now,
        }))
        await supabase.from('patient_insurance').insert(ins)
      }

      // 4. Upsert cr.patient_intake (structured intake summary)
      const intakeSummary = {
        patient_id:         patientId,
        org_id:             session.orgId,
        intake_token:       session.token ?? null,
        chief_complaint:    formData.chief_complaint || null,
        allergies:          formData.allergies || null,
        medications_list:   formData.current_medications,
        surgical_history:   formData.surgical_history || null,
        family_history:     formData.family_history || null,
        social_history:     formData.social_history || null,
        ros_data: {
          constitutional:   formData.ros_constitutional,
          cardiovascular:   formData.ros_cardiovascular,
          respiratory:      formData.ros_respiratory,
          gastrointestinal: formData.ros_gastrointestinal,
          musculoskeletal:  formData.ros_musculoskeletal,
          neurological:     formData.ros_neurological,
          psychiatric:      formData.ros_psychiatric,
          skin:             formData.ros_skin,
        },
        consent_signed:     formData.consent_treatment && formData.consent_privacy && formData.consent_hipaa,
        consent_date:       formData.signature_date || now,
        signature_data:     formData.signature_data || null,
        status:             'completed',
        submitted_at:       now,
      }

      await supabase.from('patient_intake').upsert(intakeSummary, { onConflict: 'patient_id,org_id,intake_token' })

      // 5. Clear local progress
      clearProgress()
      setSubmitted(true)

    } catch (e: any) {
      console.error('Submit error:', e)
      setSubmitError(e.message ?? tr('errorSubmitting'))
    } finally {
      setSubmitting(false)
    }
  }, [session, formData, clearProgress, tr])

  // ── Shared props passed to every step ────────────────────────────────────────
  const stepProps = {
    formData, updateForm, updateFormMany,
    errors, setErrors,
    lang, tr,
    onNext: goNext, onBack: goBack,
    session,
  }

  // ── Render states ─────────────────────────────────────────────────────────
  if (sessionLoading) return <LoadingScreen />
  if (sessionError)   return <ErrorScreen message={sessionError} lang={lang} />

  if (submitted) return (
    <ThankYouScreen
      lang={lang}
      tr={tr}
      providerName={session?.providerName}
      schedulingUrl={import.meta.env.VITE_SCHEDULING_URL}
    />
  )

  if (step === 0) return (
    <WelcomeScreen
      session={session!}
      lang={lang}
      setLang={setLang}
      tr={tr}
      savedStep={savedStep}
      onStart={() => { setStep(savedStep > 0 ? savedStep : 1) }}
    />
  )

  const currentStepConfig = STEPS[step - 1]
  const progress = (step / STEPS.length) * 100

  return (
    <div style={{ minHeight: '100dvh', background: C.navy950, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── Top Bar ── */}
      <header style={{
        background: C.navy900,
        borderBottom: `1px solid rgba(201,169,110,0.14)`,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: C.gold }}>
          PatientTrac
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Auto-save indicator */}
          {isSaving
            ? <span style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Mono,monospace' }}>saving…</span>
            : lastSaved
              ? <span style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Mono,monospace' }}>✓ {tr('autoSaved')}</span>
              : null
          }

          {/* Lang switcher */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['en', 'es', 'fr'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  background: lang === l ? C.gold : 'transparent',
                  color: lang === l ? C.navy950 : C.muted,
                  border: `1px solid ${lang === l ? C.gold : C.subtle}`,
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: 11,
                  fontFamily: 'DM Mono,monospace',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >{l}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div style={{ height: 3, background: C.navy700 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.cyan})`, transition: 'width 0.4s ease' }} />
      </div>

      {/* ── Step indicator ── */}
      <div style={{ background: C.navy800, borderBottom: `1px solid rgba(201,169,110,0.08)`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{currentStepConfig?.icon}</span>
          <div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 600, fontSize: 15, color: C.text }}>
              {currentStepConfig?.titleEn}
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Mono,monospace' }}>
              STEP {step} {tr('stepOf')} {STEPS.length}
            </div>
          </div>
        </div>

        {/* Step pills (desktop) */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => jumpToStep(i + 1)}
              title={s.titleEn}
              style={{
                width: 28, height: 28,
                borderRadius: '50%',
                border: `1.5px solid ${i + 1 === step ? C.gold : i + 1 < step ? C.green : C.subtle}`,
                background: i + 1 === step ? C.gold : i + 1 < step ? 'rgba(74,222,128,0.15)' : 'transparent',
                color: i + 1 === step ? C.navy950 : i + 1 < step ? C.green : C.muted,
                fontSize: 11,
                fontWeight: 700,
                cursor: i + 1 <= step ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'DM Mono,monospace',
              }}
            >{i + 1 < step ? '✓' : i + 1}</button>
          ))}
        </div>
      </div>

      {/* ── Step Content ── */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }} className="animate-slide-up">
        {step === 1 && <StepPersonal   {...stepProps} />}
        {step === 2 && <StepContact    {...stepProps} />}
        {step === 3 && <StepIdentity   {...stepProps} />}
        {step === 4 && <StepEmergency  {...stepProps} />}
        {step === 5 && <StepMedical    {...stepProps} />}
        {step === 6 && <StepSystems    {...stepProps} />}
        {step === 7 && <StepInsurance  {...stepProps} />}
        {step === 8 && (
          <StepConsent
            {...stepProps}
            submitting={submitting}
            submitError={submitError}
            onSubmit={handleSubmit}
          />
        )}
      </main>
    </div>
  )
}

// ── Sub-screens ───────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100dvh', background: '#020a14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 28, fontWeight: 700, color: '#c9a96e', letterSpacing: 2 }}>PatientTrac</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a96e', opacity: 0.3, animation: `pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  )
}

function ErrorScreen({ message, lang }: { message: string; lang: Lang }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#020a14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 24, fontWeight: 700, color: '#c9a96e' }}>PatientTrac</div>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <p style={{ color: '#e8eaf0', maxWidth: 360, lineHeight: 1.6 }}>{message}</p>
      <p style={{ color: '#8a9bc0', fontSize: 14 }}>
        {lang === 'es' ? 'Contacte la oficina de su proveedor.' : lang === 'fr' ? 'Contactez le bureau de votre médecin.' : 'Please contact your provider\'s office.'}
      </p>
    </div>
  )
}

function WelcomeScreen({ session, lang, setLang, tr, savedStep, onStart }: {
  session: any; lang: Lang; setLang: (l: Lang) => void;
  tr: (k: any) => string; savedStep: number; onStart: () => void
}) {
  const isToken = session.mode === 'token'
  return (
    <div style={{ minHeight: '100dvh', background: '#020a14', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 22, color: '#c9a96e' }}>PatientTrac</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['en', 'es', 'fr'] as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              background: lang === l ? '#c9a96e' : 'transparent',
              color: lang === l ? '#020a14' : '#8a9bc0',
              border: `1px solid ${lang === l ? '#c9a96e' : '#3a4a6a'}`,
              borderRadius: 4, padding: '4px 9px', fontSize: 11,
              fontFamily: 'DM Mono,monospace', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 40px', maxWidth: 500, margin: '0 auto', textAlign: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(201,169,110,0.12)', border: '2px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
          {isToken ? '👋' : '🏥'}
        </div>

        <div>
          <h1 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 30, color: '#e8eaf0', marginBottom: 12, letterSpacing: 0.5 }}>
            {isToken ? tr('welcomeToken') : tr('welcome')}
          </h1>
          <p style={{ color: '#8a9bc0', lineHeight: 1.7, fontSize: 15 }}>
            {isToken ? tr('welcomeTokenSub') : tr('welcomeSub')}
          </p>
        </div>

        {session.apptDate && (
          <div style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8, padding: '12px 20px', fontSize: 14 }}>
            <div style={{ color: '#8a9bc0', fontSize: 11, fontFamily: 'DM Mono,monospace', marginBottom: 4 }}>YOUR APPOINTMENT</div>
            <div style={{ color: '#e8eaf0', fontWeight: 500 }}>
              {new Date(session.apptDate).toLocaleDateString(lang === 'es' ? 'es-US' : lang === 'fr' ? 'fr-CA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            {session.providerName && <div style={{ color: '#c9a96e', fontSize: 13, marginTop: 2 }}>with {session.providerName}</div>}
          </div>
        )}

        {/* HIPAA badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(10,22,40,0.8)', border: '1px solid #3a4a6a', borderRadius: 6, padding: '8px 14px', fontSize: 12, color: '#8a9bc0' }}>
          <span>🔒</span>
          <span>HIPAA Compliant · 256-bit Encryption</span>
        </div>

        {savedStep > 0 && (
          <div style={{ fontSize: 13, color: '#c9a96e', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 6, padding: '8px 16px' }}>
            {tr('progressSaved')}
          </div>
        )}

        <button onClick={onStart} className="btn-gold" style={{ width: '100%', marginTop: 8, padding: '16px 32px', fontSize: 17 }}>
          {savedStep > 0 ? `Continue (Step ${savedStep}/${STEPS.length})` : tr('continue')} →
        </button>

        <p style={{ fontSize: 11, color: '#3a4a6a', fontFamily: 'DM Mono,monospace', letterSpacing: 0.5 }}>
          © PATIENTTRAC CORP · HIPAA COMPLIANT
        </p>
      </div>
    </div>
  )
}

function ThankYouScreen({ lang, tr, providerName, schedulingUrl }: { lang: Lang; tr: (k: any) => string; providerName?: string; schedulingUrl?: string }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#020a14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', gap: 20 }}>
      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 22, fontWeight: 700, color: '#c9a96e' }}>PatientTrac</div>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>✓</div>
      <div>
        <h1 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 28, color: '#4ade80', marginBottom: 12 }}>{tr('thankYou')}</h1>
        <p style={{ color: '#8a9bc0', maxWidth: 360, lineHeight: 1.7 }}>{tr('thankYouSub')}</p>
        {providerName && <p style={{ color: '#c9a96e', marginTop: 8, fontSize: 14 }}>Your provider: {providerName}</p>}
      </div>
      <p style={{ fontSize: 12, color: '#3a4a6a', fontFamily: 'DM Mono,monospace' }}>
        © PATIENTTRAC CORP · HIPAA COMPLIANT
      </p>
    </div>
  )
}
