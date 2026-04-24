import type { ProfileFormData } from '../types'
import FieldRow from '../components/FieldRow'
import StepNav from '../components/StepNav'

interface Props {
  formData: ProfileFormData; updateForm: <K extends keyof ProfileFormData>(f: K, v: ProfileFormData[K]) => void
  errors: any; setErrors: any; lang: string; tr: (k: any) => string; onNext: () => void; onBack: () => void; session: any
}

const RELATIONSHIPS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Partner', 'Friend', 'Guardian', 'Other']

export default function StepEmergency({ formData, updateForm, errors, setErrors, tr, onNext, onBack }: Props) {

  function validate() {
    const e: any = {}
    if (!formData.emergency_name.trim())  e.emergency_name  = tr('fieldRequired')
    if (!formData.emergency_phone.trim()) e.emergency_phone = tr('fieldRequired')
    if (Object.keys(e).length) { setErrors((prev: any) => ({ ...prev, ...e })); return false }
    return true
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: '#e8eaf0', marginBottom: 6 }}>{tr('emergencyContact')}</h2>
        <p style={{ color: '#8a9bc0', fontSize: 14 }}>Who should we contact in case of an emergency?</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>

        <FieldRow label={tr('emergencyName')} required error={errors.emergency_name as string}>
          <input className={`hud-input${errors.emergency_name ? ' error' : ''}`}
            value={formData.emergency_name}
            onChange={e => updateForm('emergency_name', e.target.value)}
            placeholder="John García"
            autoComplete="off"
          />
        </FieldRow>

        <FieldRow label={tr('emergencyRelationship')} half>
          <select className="hud-input" value={formData.emergency_relationship}
            onChange={e => updateForm('emergency_relationship', e.target.value)}>
            <option value="">— Select —</option>
            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </FieldRow>

        <FieldRow label={tr('emergencyPhone')} required error={errors.emergency_phone as string} half>
          <input className={`hud-input${errors.emergency_phone ? ' error' : ''}`}
            type="tel" value={formData.emergency_phone}
            onChange={e => updateForm('emergency_phone', e.target.value)}
            placeholder="(305) 000-0000"
            inputMode="tel"
          />
        </FieldRow>

        <FieldRow label={tr('emergencyEmail')}>
          <input className="hud-input" type="email" value={formData.emergency_email}
            onChange={e => updateForm('emergency_email', e.target.value)}
            placeholder="john@example.com"
            autoComplete="off" inputMode="email"
          />
        </FieldRow>

      </div>

      <StepNav onBack={onBack} onNext={() => { if (validate()) onNext() }} nextLabel={tr('next') + ' →'} backLabel={'← ' + tr('back')} />
    </div>
  )
}
