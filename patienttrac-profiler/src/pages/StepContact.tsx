import { useState } from 'react'
import type { ProfileFormData } from '../types'
import FieldRow from '../components/FieldRow'
import StepNav from '../components/StepNav'

interface Props {
  formData:       ProfileFormData
  updateForm:     <K extends keyof ProfileFormData>(f: K, v: ProfileFormData[K]) => void
  updateFormMany: (u: Partial<ProfileFormData>) => void
  errors:         Partial<Record<keyof ProfileFormData, string>>
  setErrors:      (e: any) => void
  lang:           string
  tr:             (k: any) => string
  onNext:         () => void
  onBack:         () => void
  session:        any
}

const COUNTRIES = [
  { code: 'US', label: 'United States', phone: '+1', zip: 'ZIP Code', state: 'State' },
  { code: 'CO', label: 'Colombia',      phone: '+57', zip: 'Código Postal', state: 'Departamento' },
  { code: 'MX', label: 'Mexico',        phone: '+52', zip: 'Código Postal', state: 'Estado' },
  { code: 'BR', label: 'Brazil',        phone: '+55', zip: 'CEP', state: 'Estado' },
  { code: 'VE', label: 'Venezuela',     phone: '+58', zip: 'Código Postal', state: 'Estado' },
  { code: 'CA', label: 'Canada',        phone: '+1',  zip: 'Postal Code', state: 'Province' },
  { code: 'GT', label: 'Guatemala',     phone: '+502', zip: 'Código Postal', state: 'Departamento' },
  { code: 'HN', label: 'Honduras',      phone: '+504', zip: 'Código Postal', state: 'Departamento' },
  { code: 'DO', label: 'Dominican Rep.',phone: '+1',   zip: 'Código Postal', state: 'Provincia' },
  { code: 'CU', label: 'Cuba',          phone: '+53',  zip: 'Código Postal', state: 'Provincia' },
  { code: 'HT', label: 'Haiti',         phone: '+509', zip: 'Code Postal',   state: 'Département' },
  { code: 'FR', label: 'France',        phone: '+33',  zip: 'Code Postal',   state: 'Région' },
  { code: 'ES', label: 'Spain',         phone: '+34',  zip: 'Código Postal', state: 'Provincia' },
  { code: 'OTHER', label: 'Other',      phone: '+',    zip: 'Postal Code',   state: 'State/Province' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR','VI','GU','AS','MP',
]

export default function StepContact({ formData, updateForm, updateFormMany, errors, setErrors, tr, onNext, onBack }: Props) {
  const [zipLoading, setZipLoading] = useState(false)
  const country = COUNTRIES.find(c => c.code === formData.country_code) ?? COUNTRIES[0]

  async function handleZipBlur() {
    if (!formData.is_us_resident || formData.zip_postal.length !== 5) return
    setZipLoading(true)
    try {
      const res  = await fetch(`https://api.zippopotam.us/us/${formData.zip_postal}`)
      if (!res.ok) return
      const data = await res.json()
      const place = data.places?.[0]
      if (place) updateFormMany({ city: place['place name'], state_province: place['state abbreviation'] })
    } catch { /* noop */ } finally {
      setZipLoading(false)
    }
  }

  function validate() {
    const e: any = {}
    if (!formData.email.trim())      e.email      = tr('fieldRequired')
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = tr('invalidEmail')
    if (!formData.cell_phone.trim()) e.cell_phone = tr('fieldRequired')
    if (!formData.address1.trim())   e.address1   = tr('fieldRequired')
    if (!formData.city.trim())       e.city       = tr('fieldRequired')
    if (!formData.zip_postal.trim()) e.zip_postal = tr('fieldRequired')
    if (Object.keys(e).length) { setErrors((prev: any) => ({ ...prev, ...e })); return false }
    return true
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: '#e8eaf0', marginBottom: 6 }}>{tr('contactAddress')}</h2>
        <p style={{ color: '#8a9bc0', fontSize: 14 }}>How can we reach you?</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>

        <FieldRow label={tr('email')} required error={errors.email as string}>
          <input className={`hud-input${errors.email ? ' error' : ''}`}
            type="email" value={formData.email}
            onChange={e => updateForm('email', e.target.value)}
            placeholder="maria@example.com"
            autoComplete="email" inputMode="email"
          />
        </FieldRow>

        <FieldRow label={tr('cellPhone')} required error={errors.cell_phone as string} half>
          <input className={`hud-input${errors.cell_phone ? ' error' : ''}`}
            type="tel" value={formData.cell_phone}
            onChange={e => updateForm('cell_phone', e.target.value)}
            placeholder={`${country.phone} (555) 000-0000`}
            autoComplete="tel" inputMode="tel"
          />
        </FieldRow>

        <FieldRow label={tr('homePhone')} half>
          <input className="hud-input" type="tel" value={formData.home_phone}
            onChange={e => updateForm('home_phone', e.target.value)}
            placeholder={`${country.phone} (555) 000-0000`}
            autoComplete="tel-national" inputMode="tel"
          />
        </FieldRow>

        {/* US Resident toggle */}
        <div style={{ flex: '1 1 100%' }}>
          <div style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid #3a4a6a', borderRadius: 8, padding: '14px 16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" className="hud-checkbox"
                checked={formData.is_us_resident}
                onChange={e => updateForm('is_us_resident', e.target.checked)}
              />
              <div>
                <div style={{ color: '#e8eaf0', fontWeight: 500 }}>{tr('usResident')}</div>
                <div style={{ color: '#8a9bc0', fontSize: 12 }}>
                  {formData.is_us_resident ? 'US address & SSN fields will show' : 'International address & passport fields will show'}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Country (intl only) */}
        {!formData.is_us_resident && (
          <FieldRow label={tr('country')} required>
            <select className="hud-input" value={formData.country_code}
              onChange={e => updateForm('country_code', e.target.value)}>
              {COUNTRIES.filter(c => c.code !== 'US').map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </FieldRow>
        )}

        <FieldRow label={tr('address1')} required error={errors.address1 as string}>
          <input className={`hud-input${errors.address1 ? ' error' : ''}`}
            value={formData.address1}
            onChange={e => updateForm('address1', e.target.value)}
            placeholder="123 Main St" autoComplete="address-line1"
          />
        </FieldRow>

        <FieldRow label={tr('address2')}>
          <input className="hud-input" value={formData.address2}
            onChange={e => updateForm('address2', e.target.value)}
            placeholder="Apt 4B" autoComplete="address-line2"
          />
        </FieldRow>

        <FieldRow label={country.zip} required error={errors.zip_postal as string} half>
          <div style={{ position: 'relative' }}>
            <input className={`hud-input${errors.zip_postal ? ' error' : ''}`}
              value={formData.zip_postal}
              onChange={e => updateForm('zip_postal', e.target.value)}
              onBlur={handleZipBlur}
              placeholder={formData.is_us_resident ? '12345' : ''}
              inputMode="numeric" autoComplete="postal-code"
            />
            {zipLoading && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#8a9bc0' }}>⌛</span>}
          </div>
        </FieldRow>

        <FieldRow label={tr('city')} required error={errors.city as string} half>
          <input className={`hud-input${errors.city ? ' error' : ''}`}
            value={formData.city}
            onChange={e => updateForm('city', e.target.value)}
            placeholder="Miami" autoComplete="address-level2"
          />
        </FieldRow>

        <FieldRow label={country.state} half>
          {formData.is_us_resident ? (
            <select className="hud-input" value={formData.state_province}
              onChange={e => updateForm('state_province', e.target.value)}>
              <option value="">— State —</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input className="hud-input" value={formData.state_province}
              onChange={e => updateForm('state_province', e.target.value)}
              placeholder={country.state}
            />
          )}
        </FieldRow>

      </div>

      <StepNav onBack={onBack} onNext={() => { if (validate()) onNext() }} nextLabel={tr('next') + ' →'} backLabel={'← ' + tr('back')} />
    </div>
  )
}
