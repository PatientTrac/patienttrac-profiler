import type { ProfileFormData } from '../types'
import StepNav from '../components/StepNav'

interface Props {
  formData: ProfileFormData; updateForm: <K extends keyof ProfileFormData>(f: K, v: ProfileFormData[K]) => void
  errors: any; setErrors: any; lang: string; tr: (k: any) => string; onNext: () => void; onBack: () => void; session: any
}

const ROS_SYSTEMS: { key: keyof ProfileFormData; label: string; icon: string; symptoms: string[] }[] = [
  { key: 'ros_constitutional', label: 'Constitutional', icon: '🌡️', symptoms: ['Fever', 'Chills', 'Night sweats', 'Fatigue', 'Weight loss', 'Weight gain', 'Appetite changes'] },
  { key: 'ros_cardiovascular', label: 'Cardiovascular', icon: '❤️', symptoms: ['Chest pain', 'Palpitations', 'Shortness of breath', 'Leg swelling', 'Irregular heartbeat', 'Fainting'] },
  { key: 'ros_respiratory', label: 'Respiratory', icon: '🫁', symptoms: ['Cough', 'Shortness of breath', 'Wheezing', 'Coughing blood', 'Sore throat', 'Runny nose', 'Sinus congestion'] },
  { key: 'ros_gastrointestinal', label: 'Gastrointestinal', icon: '🫀', symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal pain', 'Heartburn', 'Blood in stool', 'Difficulty swallowing'] },
  { key: 'ros_musculoskeletal', label: 'Musculoskeletal', icon: '🦴', symptoms: ['Joint pain', 'Joint swelling', 'Back pain', 'Muscle weakness', 'Muscle cramps', 'Limited range of motion'] },
  { key: 'ros_neurological', label: 'Neurological', icon: '🧠', symptoms: ['Headache', 'Dizziness', 'Numbness', 'Tingling', 'Seizures', 'Memory problems', 'Tremor', 'Balance problems'] },
  { key: 'ros_psychiatric', label: 'Psychiatric', icon: '💭', symptoms: ['Depression', 'Anxiety', 'Panic attacks', 'Sleep problems', 'Mood swings', 'Hallucinations', 'Suicidal thoughts'] },
  { key: 'ros_skin', label: 'Skin', icon: '🫸', symptoms: ['Rash', 'Itching', 'Hair loss', 'Nail changes', 'Skin lesion', 'Easy bruising', 'Wound healing problems'] },
]

export default function StepSystems({ formData, updateForm, tr, onNext, onBack }: Props) {

  function toggle(field: keyof ProfileFormData, symptom: string) {
    const current = (formData[field] as string[]) ?? []
    const next = current.includes(symptom)
      ? current.filter(s => s !== symptom)
      : [...current, symptom]
    updateForm(field, next as any)
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 24, color: '#e8eaf0', marginBottom: 6 }}>{tr('reviewSystems')}</h2>
        <p style={{ color: '#8a9bc0', fontSize: 14 }}>Select any symptoms you have experienced recently. Check all that apply.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ROS_SYSTEMS.map(sys => {
          const selected = (formData[sys.key] as string[]) ?? []
          const hasAny   = selected.length > 0
          return (
            <div key={sys.key} style={{ background: hasAny ? 'rgba(201,169,110,0.05)' : 'rgba(10,22,40,0.6)', border: `1px solid ${hasAny ? 'rgba(201,169,110,0.25)' : '#3a4a6a'}`, borderRadius: 10, padding: 16, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{sys.icon}</span>
                  <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 600, fontSize: 16, color: '#e8eaf0' }}>{sys.label}</span>
                </div>
                {hasAny
                  ? <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: '#c9a96e', background: 'rgba(201,169,110,0.1)', padding: '2px 8px', borderRadius: 4 }}>{selected.length} selected</span>
                  : <span style={{ fontFamily: 'DM Mono,monospace', fontSize: 10, color: '#3a4a6a' }}>none</span>
                }
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sys.symptoms.map(sym => {
                  const active = selected.includes(sym)
                  return (
                    <button key={sym} onClick={() => toggle(sys.key, sym)} style={{
                      background: active ? 'rgba(201,169,110,0.15)' : 'rgba(10,22,40,0.8)',
                      border: `1px solid ${active ? '#c9a96e' : '#3a4a6a'}`,
                      borderRadius: 20,
                      color: active ? '#c9a96e' : '#8a9bc0',
                      padding: '6px 14px',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      {active && <span style={{ fontSize: 10 }}>✓</span>}
                      {sym}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel={tr('next') + ' →'} backLabel={'← ' + tr('back')} />
    </div>
  )
}
