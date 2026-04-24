import { useRef, useEffect, useState } from 'react'
import type { ProfileFormData } from '../types'
import StepNav from '../components/StepNav'

interface Props {
  formData: ProfileFormData; updateForm: <K extends keyof ProfileFormData>(f: K, v: ProfileFormData[K]) => void
  errors: any; setErrors: any; lang: string; tr: (k: any) => string
  onNext: () => void; onBack: () => void; session: any
  submitting: boolean; submitError: string | null; onSubmit: () => void
}

export default function StepConsent({ formData, updateForm, tr, onBack, session, submitting, submitError, onSubmit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.strokeStyle = '#c9a96e'
    ctx.lineWidth   = 2.5
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    // Restore signature if any
    if (formData.signature_data) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src    = formData.signature_data
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      }
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top)  * scaleY,
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current; if (!canvas) return
    setDrawing(true)
    lastPos.current = getPos(e, canvas)
    e.preventDefault()
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e, canvas)
    if (lastPos.current) {
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      setHasSignature(true)
    }
    lastPos.current = pos
    e.preventDefault()
  }

  function endDraw() {
    setDrawing(false)
    lastPos.current = null
    // Save to formData
    const canvas = canvasRef.current
    if (canvas && hasSignature) {
      updateForm('signature_data', canvas.toDataURL())
      updateForm('signature_date', new Date().toISOString().split('T')[0])
    }
  }

  function clearSig() {
    const canvas = canvasRef.current; if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    updateForm('signature_data', '')
    updateForm('signature_date', '')
  }

  const allRequired = formData.consent_treatment && formData.consent_privacy && formData.consent_hipaa
  const canSubmit   = allRequired && hasSignature && !submitting

  const consents: { field: keyof ProfileFormData; label: string; required: boolean }[] = [
    { field: 'consent_treatment',  label: tr('consentTreatment'),  required: true  },
    { field: 'consent_privacy',    label: tr('consentPrivacy'),     required: true  },
    { field: 'consent_hipaa',      label: tr('consentHipaa'),       required: true  },
    { field: 'consent_telehealth', label: tr('consentTelehealth'),  required: false },
  ]

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: '#e8eaf0', marginBottom: 6 }}>{tr('consentSignature')}</h2>
        <p style={{ color: '#8a9bc0', fontSize: 14 }}>Please review and sign the consents below to complete your profile.</p>
      </div>

      {/* Consent checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {consents.map(c => (
          <label key={c.field} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', background: 'rgba(10,22,40,0.6)', border: '1px solid #3a4a6a', borderRadius: 8, padding: '14px 16px' }}>
            <input type="checkbox" className="hud-checkbox" style={{ marginTop: 1 }}
              checked={formData[c.field] as boolean}
              onChange={e => updateForm(c.field, e.target.checked as any)}
            />
            <div>
              <span style={{ color: '#e8eaf0', fontSize: 14 }}>{c.label}</span>
              {c.required && <span style={{ color: '#ff6b6b', marginLeft: 4, fontSize: 12 }}>*</span>}
            </div>
          </label>
        ))}
      </div>

      {/* Signature pad */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label className="field-label" style={{ margin: 0 }}>
            {tr('signatureLabel')} <span style={{ color: '#ff6b6b' }}>*</span>
          </label>
          {hasSignature && (
            <button onClick={clearSig} className="btn-ghost" style={{ fontSize: 12, padding: '4px 12px' }}>
              {tr('clearSignature')}
            </button>
          )}
        </div>

        <div style={{ position: 'relative', border: `1px solid ${hasSignature ? '#c9a96e' : '#3a4a6a'}`, borderRadius: 8, overflow: 'hidden', background: 'rgba(10,22,40,0.9)', transition: 'border-color 0.2s' }}>
          <canvas
            ref={canvasRef}
            width={640}
            height={160}
            style={{ display: 'block', width: '100%', height: 120, cursor: 'crosshair', touchAction: 'none' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          {!hasSignature && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ color: '#3a4a6a', fontSize: 14, fontStyle: 'italic' }}>Sign here with your finger or mouse</span>
            </div>
          )}
        </div>

        {formData.signature_date && (
          <div style={{ fontSize: 12, color: '#8a9bc0', marginTop: 6, fontFamily: 'DM Mono,monospace' }}>
            Signed: {formData.signature_date}
          </div>
        )}
      </div>

      {/* HIPAA footer */}
      <div style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 12, color: '#8a9bc0', display: 'flex', gap: 8 }}>
        <span>🔒</span>
        <div>
          Your information is protected under HIPAA. By submitting, you authorize this practice to collect, use, and share your health information as necessary to provide medical care. 
          {session?.orgId && <span> Org: {session.orgId.slice(0, 8)}…</span>}
        </div>
      </div>

      {submitError && (
        <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#ff6b6b', fontSize: 14 }}>
          ⚠️ {submitError}
        </div>
      )}

      {!allRequired && (
        <div style={{ fontSize: 13, color: '#fbbf24', marginBottom: 8 }}>
          Please check all required (*) consent boxes to continue.
        </div>
      )}
      {allRequired && !hasSignature && (
        <div style={{ fontSize: 13, color: '#fbbf24', marginBottom: 8 }}>
          Please sign above to complete your profile.
        </div>
      )}

      <StepNav
        isLast
        onBack={onBack}
        onSubmit={canSubmit ? onSubmit : undefined}
        nextLabel={submitting ? tr('submitting') : tr('submitProfile')}
        backLabel={'← ' + tr('back')}
        submitting={submitting}
      />
    </div>
  )
}
