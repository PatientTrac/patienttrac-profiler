import type { ProfileFormData } from '../types'
import FieldRow from '../components/FieldRow'
import StepNav from '../components/StepNav'

interface Props {
  formData: ProfileFormData; updateForm: <K extends keyof ProfileFormData>(f: K, v: ProfileFormData[K]) => void
  errors: any; setErrors: any; lang: string; tr: (k: any) => string; onNext: () => void; onBack: () => void; session: any
}

const RACES = ['American Indian/Alaska Native', 'Asian', 'Black/African American', 'Native Hawaiian/Pacific Islander', 'White', 'Multiracial', 'Other', 'Prefer not to say']
const ETHNICITIES = ['Hispanic or Latino', 'Not Hispanic or Latino', 'Prefer not to say']
const MARITAL = ['Single', 'Married', 'Divorced', 'Widowed', 'Domestic Partner', 'Separated', 'Prefer not to say']
const EMPLOYMENT = ['Employed Full-Time', 'Employed Part-Time', 'Self-Employed', 'Unemployed', 'Student', 'Retired', 'Disabled', 'Prefer not to say']
const TAX_IDS_US  = ['SSN', 'ITIN', 'EIN']
const TAX_IDS_INTL = ['ITIN', 'NIT', 'RFC', 'CPF', 'RIF', 'Passport', 'Other']

export default function StepIdentity({ formData, updateForm, tr, onNext, onBack }: Props) {
  const taxIds = formData.is_us_resident ? TAX_IDS_US : TAX_IDS_INTL

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: '#e8eaf0', marginBottom: 6 }}>{tr('identityDemo')}</h2>
        <p style={{ color: '#8a9bc0', fontSize: 14 }}>This information helps us provide the best care and meet federal reporting requirements.</p>
      </div>

      {/* Notice */}
      <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#8a9bc0', display: 'flex', gap: 8 }}>
        <span>ℹ️</span>
        <span>All identity fields are optional. Providing them helps ensure accurate records and avoid billing delays.</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>

        <FieldRow label={tr('race')} half>
          <select className="hud-input" value={formData.race} onChange={e => updateForm('race', e.target.value)}>
            <option value="">— Select —</option>
            {RACES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </FieldRow>

        <FieldRow label={tr('ethnicity')} half>
          <select className="hud-input" value={formData.ethnicity} onChange={e => updateForm('ethnicity', e.target.value)}>
            <option value="">— Select —</option>
            {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </FieldRow>

        <FieldRow label={tr('maritalStatus')} half>
          <select className="hud-input" value={formData.marital_status} onChange={e => updateForm('marital_status', e.target.value)}>
            <option value="">— Select —</option>
            {MARITAL.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </FieldRow>

        <FieldRow label={tr('employmentStatus')} half>
          <select className="hud-input" value={formData.employment_status} onChange={e => updateForm('employment_status', e.target.value)}>
            <option value="">— Select —</option>
            {EMPLOYMENT.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </FieldRow>

        {/* Tax ID section */}
        <div style={{ flex: '1 1 100%', background: 'rgba(10,22,40,0.6)', border: '1px solid #3a4a6a', borderRadius: 8, padding: 16 }}>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a9bc0', marginBottom: 12 }}>
            Tax Identification {formData.is_us_resident ? '(US)' : '(International)'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: '0 0 140px' }}>
              <label className="field-label">{tr('taxIdType')}</label>
              <select className="hud-input" value={formData.tax_id_type} onChange={e => updateForm('tax_id_type', e.target.value)}>
                {taxIds.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {formData.is_us_resident && formData.tax_id_type === 'SSN' && (
              <div style={{ flex: 1 }}>
                <label className="field-label">{tr('ssnLast4')}</label>
                <input className="hud-input" value={formData.ssn_last4}
                  onChange={e => updateForm('ssn_last4', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4 digits only" inputMode="numeric" maxLength={4}
                />
              </div>
            )}
          </div>
        </div>

        {/* Passport (non-US) */}
        {!formData.is_us_resident && (
          <>
            <FieldRow label={tr('passportNumber')} half>
              <input className="hud-input" value={formData.passport_number}
                onChange={e => updateForm('passport_number', e.target.value)}
                placeholder="AB1234567"
              />
            </FieldRow>
            <FieldRow label={tr('passportCountry')} half>
              <input className="hud-input" value={formData.passport_country}
                onChange={e => updateForm('passport_country', e.target.value)}
                placeholder="Colombia"
              />
            </FieldRow>
          </>
        )}

      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel={tr('next') + ' →'} backLabel={'← ' + tr('back')} />
    </div>
  )
}
