// ── Completion Notifications → PatientTracForge ───────────────────────────
// Fires when a patient submits their profile. Calls the send-notification
// edge function on the scheduling app's Supabase project.

const SUPABASE_URL     = 'https://mskormozwekezjmtcylv.supabase.co'
const EDGE_FN_URL      = `${SUPABASE_URL}/functions/v1/send-notification`
const SCHEDULING_URL   = 'https://patienttracforge.com'

export interface CompletionPayload {
  patientId:    number
  patientName:  string
  email:        string
  orgId:        string
  submittedAt:  string
  chiefComplaint?: string
  consentSigned:  boolean
  intakeToken?:   string
}

/**
 * Notifies the PatientTracForge scheduling app that a patient
 * has completed their profiler intake. Triggers:
 *  1. Email to practice staff via send-notification edge function
 *  2. Supabase realtime event on cr.patient_intake (auto — from DB update)
 *  3. HubSpot contact update via hubspot-crm edge function
 */
export async function notifyCompletion(payload: CompletionPayload): Promise<void> {
  const promises: Promise<any>[] = []

  // 1. Staff email notification via send-notification edge function
  promises.push(
    fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:       'profiler_completed',
        org_id:     payload.orgId,
        patient_id: payload.patientId,
        message:    `Patient ${payload.patientName} has completed their intake profile.`,
        email:      'staff-notifications@patienttrac.com', // override per org in saas.config
        metadata: {
          patient_name:    payload.patientName,
          patient_email:   payload.email,
          submitted_at:    payload.submittedAt,
          chief_complaint: payload.chiefComplaint ?? 'Not provided',
          consent_signed:  payload.consentSigned,
          view_url:        `${SCHEDULING_URL}/patients/${payload.patientId}`,
          profiler_source: 'patienttracprofiler.com',
        },
      }),
    }).catch(e => console.warn('Notification edge fn failed:', e))
  )

  // 2. HubSpot CRM sync — update contact as "intake completed"
  promises.push(
    fetch(`${SUPABASE_URL}/functions/v1/hubspot-crm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action:     'update_contact_intake_status',
        email:      payload.email,
        properties: {
          hs_lead_status:            'IN_PROGRESS',
          intake_completed:          'true',
          intake_completed_date:     payload.submittedAt,
          patienttrac_patient_id:    String(payload.patientId),
          patienttrac_org_id:        payload.orgId,
        },
      }),
    }).catch(e => console.warn('HubSpot sync failed:', e))
  )

  // Fire all notifications in parallel — don't block the UI
  await Promise.allSettled(promises)
}

/**
 * Sends a confirmation email to the patient after profile submission.
 * Uses the send-notification edge function with patient email.
 */
export async function notifyPatient(payload: CompletionPayload): Promise<void> {
  try {
    await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:    'patient_intake_confirmation',
        org_id:  payload.orgId,
        email:   payload.email,
        message: `Your patient profile has been received.`,
        metadata: {
          patient_name:    payload.patientName,
          submitted_at:    payload.submittedAt,
          scheduling_url:  SCHEDULING_URL,
          support_email:   'support@patienttrac.com',
        },
      }),
    })
  } catch (e) {
    console.warn('Patient confirmation email failed:', e)
  }
}
