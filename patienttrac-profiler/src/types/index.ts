// ── Language ──────────────────────────────────────────────────────────────────
export type Lang = 'en' | 'es' | 'fr'

// ── Session / Token ───────────────────────────────────────────────────────────
export interface ProfilerSession {
  mode:        'token' | 'standalone'
  token?:      string
  email?:      string
  patientId?:  number
  orgId:       string
  apptDate?:   string
  providerName?: string
}

// ── Progress Persistence ──────────────────────────────────────────────────────
export interface SavedProgress {
  step:      number
  formData:  Partial<ProfileFormData>
  savedAt:   string
}

// ── Patient Form Data ─────────────────────────────────────────────────────────
export interface ProfileFormData {
  // Step 1 — Personal Info
  first_name:         string
  last_name:          string
  middle_name:        string
  birth:              string
  gender:             string
  preferred_pronoun:  string
  preferred_language: string
  interpreter_needed: boolean

  // Step 2 — Contact & Address
  email:            string
  cell_phone:       string
  home_phone:       string
  work_phone:       string
  is_us_resident:   boolean
  country_code:     string
  address1:         string
  address2:         string
  city:             string
  state_province:   string
  zip_postal:       string

  // Step 3 — Demographics & ID
  race:             string
  ethnicity:        string
  marital_status:   string
  employment_status: string
  ssn_last4:        string
  tax_id_type:      string
  passport_number:  string
  passport_country: string

  // Step 4 — Emergency Contact
  emergency_name:         string
  emergency_relationship: string
  emergency_phone:        string
  emergency_email:        string

  // Step 5 — Medical History
  chief_complaint:   string
  allergies:         string
  current_medications: MedicationEntry[]
  surgical_history:  string
  family_history:    string
  social_history:    string

  // Step 6 — Review of Systems
  ros_constitutional:   string[]
  ros_cardiovascular:   string[]
  ros_respiratory:      string[]
  ros_gastrointestinal: string[]
  ros_musculoskeletal:  string[]
  ros_neurological:     string[]
  ros_psychiatric:      string[]
  ros_skin:             string[]

  // Step 7 — Insurance
  insurance: InsuranceEntry[]

  // Step 8 — Consents
  consent_treatment:   boolean
  consent_privacy:     boolean
  consent_hipaa:       boolean
  consent_telehealth:  boolean
  signature_data:      string
  signature_date:      string
}

export interface MedicationEntry {
  name:      string
  dose:      string
  frequency: string
  reason:    string
}

export interface InsuranceEntry {
  priority:         'primary' | 'secondary' | 'tertiary'
  company_name:     string
  plan_name:        string
  member_id:        string
  group_number:     string
  subscriber_name:  string
  subscriber_dob:   string
  relationship:     string
  phone:            string
  copay:            number | null
  deductible:       number | null
}

// ── Step Definition ───────────────────────────────────────────────────────────
export interface StepConfig {
  id:       number
  key:      string
  titleEn:  string
  titleEs:  string
  titleFr:  string
  icon:     string
  required: boolean
}

export const STEPS: StepConfig[] = [
  { id: 1, key: 'personal',   titleEn: 'Personal Info',        titleEs: 'Información Personal',   titleFr: 'Informations Personnelles', icon: '👤', required: true  },
  { id: 2, key: 'contact',    titleEn: 'Contact & Address',     titleEs: 'Contacto y Dirección',   titleFr: 'Contact et Adresse',        icon: '📍', required: true  },
  { id: 3, key: 'identity',   titleEn: 'Identity & Demographics', titleEs: 'Identidad',            titleFr: 'Identité',                  icon: '🪪', required: true  },
  { id: 4, key: 'emergency',  titleEn: 'Emergency Contact',     titleEs: 'Contacto de Emergencia', titleFr: 'Contact d\'Urgence',         icon: '🚨', required: true  },
  { id: 5, key: 'medical',    titleEn: 'Medical History',       titleEs: 'Historia Médica',        titleFr: 'Antécédents Médicaux',       icon: '🩺', required: true  },
  { id: 6, key: 'systems',    titleEn: 'Review of Systems',     titleEs: 'Revisión de Sistemas',   titleFr: 'Revue des Systèmes',         icon: '📋', required: false },
  { id: 7, key: 'insurance',  titleEn: 'Insurance',             titleEs: 'Seguro Médico',          titleFr: 'Assurance',                  icon: '🏥', required: false },
  { id: 8, key: 'consent',    titleEn: 'Consent & Signature',   titleEs: 'Consentimiento',         titleFr: 'Consentement',               icon: '✍️', required: true  },
]
