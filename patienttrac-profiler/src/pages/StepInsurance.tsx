import type { ProfileFormData, InsuranceEntry } from '../types'
import FieldRow from '../components/FieldRow'
import StepNav from '../components/StepNav'

interface Props {
  formData: ProfileFormData; updateForm: <K extends keyof ProfileFormData>(f: K, v: ProfileFormData[K]) => void
  errors: any; setErrors: any; lang: string; tr: (k: any) => string; onNext: () => void; onBack: () => void; session: any
}

const PRIORITIES: InsuranceEntry['priority'][] = ['primary', 'secondary', 'tertiary']
const PRIORITY_LABELS = { primary: 'Primary Insurance', secondary: 'Secondary Insurance', tertiary: 'Tertiary Insurance' }
const PRIORITY_COLORS = { primary: '#c9a96e', secondary: '#00d4ff', tertiary: '#8a9bc0' }
const RELATIONSHIPS = ['Self', 'Spouse', 'Child', 'Parent', 'Other']

const COMPANIES = [
  'Aetna', 'Blue Cross Blue Shield', 'Cigna', 'UnitedHealthcare', 'Humana',
  'Medicare', 'Medicaid', 'Tricare', 'Molina Healthcare', 'Oscar Health',
  'Anthem', 'Kaiser Permanente', 'Ambetter', 'Self-Pay / Uninsured', 'Other',
]

const EMPTY_INS: InsuranceEntry = {
  priority: 'primary', company_name: '', plan_name: '', member_id: '', group_number: '',
  subscriber_name: '', subscriber_dob: '', relationship: 'Self', phone: '', copay: null, deductible: null,
}

export default function StepInsurance({ formData, updateForm, tr, onNext, onBack }: Props) {
  const ins = formData.insurance

  function addInsurance() {
    const used = ins.map(i => i.priority)
    const next = PRIORITIES.find(p => !used.includes(p))
    if (!next) return
    updateForm('insurance', [...ins, { ...EMPTY_INS, priority: next }])
  }

  function removeIns(i: number) {
    updateForm('insurance', ins.filter((_, idx) => idx !== i))
  }

  function updateIns<K extends keyof InsuranceEntry>(i: number, field: K, val: InsuranceEntry[K]) {
    const next = ins.map((entry, idx) => idx === i ? { ...entry, [field]: val } : entry)
    updateForm('insurance', next)
  }

  const canAdd = ins.length < 3

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: '#e8eaf0', marginBottom: 6 }}>{tr('insurance')}</h2>
        <p style={{ color: '#8a9bc0', fontSize: 14 }}>Add your insurance information. You can skip this and add it at check-in.</p>
      </div>

      {ins.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#3a4a6a', border: '1px dashed #3a4a6a', borderRadius: 10, marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏥</div>
          <div style={{ fontSize: 15 }}>No insurance added</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>You can also provide this at check-in</div>
        </div>
      )}

      {ins.map((entry, i) => {
        const color = PRIORITY_COLORS[entry.priority]
        return (
          <div key={i} style={{ background: 'rgba(10,22,40,0.7)', border: `1px solid ${color}33`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 600, fontSize: 15, color: '#e8eaf0' }}>
                  {PRIORITY_LABELS[entry.priority]}
                </span>
              </div>
              <button onClick={() => removeIns(i)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 13 }}>✕ Remove</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <FieldRow label={tr('companyName')} required>
                <select className="hud-input" value={entry.company_name} onChange={e => updateIns(i, 'company_name', e.target.value)}>
                  <option value="">— Select Insurance —</option>
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FieldRow>

              <FieldRow label={tr('planName')} half>
                <input className="hud-input" value={entry.plan_name}
                  onChange={e => updateIns(i, 'plan_name', e.target.value)}
                  placeholder="HMO Gold Plus"
                />
              </FieldRow>

              <FieldRow label={tr('memberId')} half>
                <input className="hud-input" value={entry.member_id}
                  onChange={e => updateIns(i, 'member_id', e.target.value)}
                  placeholder="W12345678"
                />
              </FieldRow>

              <FieldRow label={tr('groupNumber')} half>
                <input className="hud-input" value={entry.group_number}
                  onChange={e => updateIns(i, 'group_number', e.target.value)}
                  placeholder="GRP-001234"
                />
              </FieldRow>

              <FieldRow label={tr('relationship')} half>
                <select className="hud-input" value={entry.relationship} onChange={e => updateIns(i, 'relationship', e.target.value)}>
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </FieldRow>

              {entry.relationship !== 'Self' && (
                <>
                  <FieldRow label={tr('subscriberName')} half>
                    <input className="hud-input" value={entry.subscriber_name}
                      onChange={e => updateIns(i, 'subscriber_name', e.target.value)}
                      placeholder="John García"
                    />
                  </FieldRow>
                  <FieldRow label={tr('subscriberDob')} half>
                    <input className="hud-input" type="date" value={entry.subscriber_dob}
                      onChange={e => updateIns(i, 'subscriber_dob', e.target.value)}
                    />
                  </FieldRow>
                </>
              )}

              <FieldRow label={tr('copay')} half>
                <input className="hud-input" type="number" value={entry.copay ?? ''}
                  onChange={e => updateIns(i, 'copay', e.target.value ? Number(e.target.value) : null)}
                  placeholder="25" min={0} inputMode="decimal"
                />
              </FieldRow>

              <FieldRow label={tr('deductible')} half>
                <input className="hud-input" type="number" value={entry.deductible ?? ''}
                  onChange={e => updateIns(i, 'deductible', e.target.value ? Number(e.target.value) : null)}
                  placeholder="1500" min={0} inputMode="decimal"
                />
              </FieldRow>
            </div>
          </div>
        )
      })}

      {canAdd && (
        <button onClick={addInsurance} className="btn-ghost" style={{ width: '100%', marginBottom: 8, padding: '12px 0' }}>
          {tr('addInsurance')}
        </button>
      )}

      <StepNav onBack={onBack} onNext={onNext} nextLabel={tr('next') + ' →'} backLabel={'← ' + tr('back')} />
    </div>
  )
}
