import type { ProfileFormData, MedicationEntry } from '../types'
import FieldRow from '../components/FieldRow'
import StepNav from '../components/StepNav'

interface Props {
  formData: ProfileFormData; updateForm: <K extends keyof ProfileFormData>(f: K, v: ProfileFormData[K]) => void
  errors: any; setErrors: any; lang: string; tr: (k: any) => string; onNext: () => void; onBack: () => void; session: any
}

const EMPTY_MED: MedicationEntry = { name: '', dose: '', frequency: '', reason: '' }
const FREQUENCIES = ['Once daily', 'Twice daily', '3x daily', '4x daily', 'As needed', 'Weekly', 'Monthly', 'Other']

export default function StepMedical({ formData, updateForm, tr, onNext, onBack }: Props) {
  const meds = formData.current_medications

  function addMed() {
    updateForm('current_medications', [...meds, { ...EMPTY_MED }])
  }

  function removeMed(i: number) {
    updateForm('current_medications', meds.filter((_, idx) => idx !== i))
  }

  function updateMed(i: number, field: keyof MedicationEntry, val: string) {
    const next = meds.map((m, idx) => idx === i ? { ...m, [field]: val } : m)
    updateForm('current_medications', next)
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: '#e8eaf0', marginBottom: 6 }}>{tr('medicalHistory')}</h2>
        <p style={{ color: '#8a9bc0', fontSize: 14 }}>Help us understand your health background.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Chief Complaint */}
        <div>
          <label className="field-label">{tr('chiefComplaint')}</label>
          <textarea className="hud-input" rows={3}
            value={formData.chief_complaint}
            onChange={e => updateForm('chief_complaint', e.target.value)}
            placeholder="Describe your main reason for visiting today..."
            style={{ minHeight: 88 }}
          />
        </div>

        {/* Allergies */}
        <div>
          <label className="field-label">{tr('allergies')}</label>
          <textarea className="hud-input" rows={2}
            value={formData.allergies}
            onChange={e => updateForm('allergies', e.target.value)}
            placeholder="e.g. Penicillin (hives), Sulfa (rash), Peanuts (anaphylaxis), NKDA"
            style={{ minHeight: 72 }}
          />
        </div>

        {/* Medications */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <label className="field-label" style={{ margin: 0 }}>{tr('currentMedications')}</label>
            <button onClick={addMed} className="btn-ghost" style={{ fontSize: 13, padding: '6px 14px' }}>{tr('addMedication')}</button>
          </div>

          {meds.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#3a4a6a', fontSize: 14, border: '1px dashed #3a4a6a', borderRadius: 8 }}>
              No medications added yet
            </div>
          )}

          {meds.map((med, i) => (
            <div key={i} style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid #3a4a6a', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: '#8a9bc0' }}>MED {i + 1}</span>
                <button onClick={() => removeMed(i)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 13 }}>✕ Remove</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <FieldRow label={tr('medicationName')} half>
                  <input className="hud-input" value={med.name}
                    onChange={e => updateMed(i, 'name', e.target.value)}
                    placeholder="Metformin"
                  />
                </FieldRow>
                <FieldRow label={tr('dose')} half>
                  <input className="hud-input" value={med.dose}
                    onChange={e => updateMed(i, 'dose', e.target.value)}
                    placeholder="500mg"
                  />
                </FieldRow>
                <FieldRow label={tr('frequency')} half>
                  <select className="hud-input" value={med.frequency}
                    onChange={e => updateMed(i, 'frequency', e.target.value)}>
                    <option value="">— Select —</option>
                    {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </FieldRow>
                <FieldRow label={tr('reason')} half>
                  <input className="hud-input" value={med.reason}
                    onChange={e => updateMed(i, 'reason', e.target.value)}
                    placeholder="Type 2 Diabetes"
                  />
                </FieldRow>
              </div>
            </div>
          ))}
        </div>

        {/* Surgical History */}
        <div>
          <label className="field-label">{tr('surgicalHistory')}</label>
          <textarea className="hud-input" rows={3}
            value={formData.surgical_history}
            onChange={e => updateForm('surgical_history', e.target.value)}
            placeholder="e.g. Appendectomy 2015, C-section 2019, Tonsillectomy childhood"
            style={{ minHeight: 88 }}
          />
        </div>

        {/* Family History */}
        <div>
          <label className="field-label">{tr('familyHistory')}</label>
          <textarea className="hud-input" rows={3}
            value={formData.family_history}
            onChange={e => updateForm('family_history', e.target.value)}
            placeholder="e.g. Father: hypertension, diabetes. Mother: breast cancer. No family history of heart disease."
            style={{ minHeight: 88 }}
          />
        </div>

        {/* Social History */}
        <div>
          <label className="field-label">{tr('socialHistory')}</label>
          <textarea className="hud-input" rows={3}
            value={formData.social_history}
            onChange={e => updateForm('social_history', e.target.value)}
            placeholder="e.g. Non-smoker. Occasional alcohol. Exercises 3x/week. Works as teacher. Lives with spouse and 2 children."
            style={{ minHeight: 88 }}
          />
        </div>

      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel={tr('next') + ' →'} backLabel={'← ' + tr('back')} />
    </div>
  )
}
