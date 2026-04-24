import type { ProfileFormData } from '../types'
import FieldRow from '../components/FieldRow'
import StepNav from '../components/StepNav'

interface Props {
  formData:    ProfileFormData
  updateForm:  <K extends keyof ProfileFormData>(f: K, v: ProfileFormData[K]) => void
  errors:      Partial<Record<keyof ProfileFormData, string>>
  setErrors:   (e: any) => void
  lang:        string
  tr:          (k: any) => string
  onNext:      () => void
  onBack:      () => void
  session:     any
}

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other']
const PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'Prefer not to say']
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'ht', label: 'Kreyòl Ayisyen' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'other', label: 'Other' },
]

export default function StepPersonal({ formData, updateForm, errors, setErrors, tr, onNext, onBack }: Props) {

  function validate() {
    const e: any = {}
    if (!formData.first_name.trim()) e.first_name = tr('fieldRequired')
    if (!formData.last_name.trim())  e.last_name  = tr('fieldRequired')
    if (!formData.birth)             e.birth      = tr('fieldRequired')
    if (!formData.gender)            e.gender     = tr('fieldRequired')
    if (Object.keys(e).length) { setErrors((prev: any) => ({ ...prev, ...e })); return false }
    return true
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: '#e8eaf0', marginBottom: 6 }}>
          {tr('personalInfo')}
        </h2>
        <p style={{ color: '#8a9bc0', fontSize: 14 }}>Tell us a bit about yourself.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>

        <FieldRow label={tr('firstName')} required error={errors.first_name as string} half>
          <input className={`hud-input${errors.first_name ? ' error' : ''}`}
            value={formData.first_name}
            onChange={e => updateForm('first_name', e.target.value)}
            placeholder="Maria"
            autoComplete="given-name"
          />
        </FieldRow>

        <FieldRow label={tr('lastName')} required error={errors.last_name as string} half>
          <input className={`hud-input${errors.last_name ? ' error' : ''}`}
            value={formData.last_name}
            onChange={e => updateForm('last_name', e.target.value)}
            placeholder="García"
            autoComplete="family-name"
          />
        </FieldRow>

        <FieldRow label={tr('middleName')} half>
          <input className="hud-input" value={formData.middle_name}
            onChange={e => updateForm('middle_name', e.target.value)}
            placeholder="Isabel" autoComplete="additional-name"
          />
        </FieldRow>

        <FieldRow label={tr('dateOfBirth')} required error={errors.birth as string} half>
          <input className={`hud-input${errors.birth ? ' error' : ''}`}
            type="date" value={formData.birth}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => updateForm('birth', e.target.value)}
          />
        </FieldRow>

        <FieldRow label={tr('gender')} required error={errors.gender as string} half>
          <select className={`hud-input${errors.gender ? ' error' : ''}`}
            value={formData.gender}
            onChange={e => updateForm('gender', e.target.value)}
          >
            <option value="">— Select —</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </FieldRow>

        <FieldRow label={tr('pronoun')} half>
          <select className="hud-input" value={formData.preferred_pronoun}
            onChange={e => updateForm('preferred_pronoun', e.target.value)}>
            <option value="">— Select —</option>
            {PRONOUNS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </FieldRow>

        <FieldRow label={tr('preferredLanguage')}>
          <select className="hud-input" value={formData.preferred_language}
            onChange={e => updateForm('preferred_language', e.target.value)}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </FieldRow>

        <FieldRow label="">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" className="hud-checkbox"
              checked={formData.interpreter_needed}
              onChange={e => updateForm('interpreter_needed', e.target.checked)}
            />
            <span style={{ color: '#e8eaf0', fontSize: 14 }}>{tr('interpreterNeeded')}</span>
          </label>
        </FieldRow>

      </div>

      <StepNav isFirst onNext={() => { if (validate()) onNext() }} nextLabel={tr('next') + ' →'} onBack={onBack} />
    </div>
  )
}
