import { useState, useEffect } from 'react'
import { supabase, ORG_ID } from '../lib/supabase'
import type { ProfilerSession } from '../types'

interface TokenResult {
  session:  ProfilerSession | null
  loading:  boolean
  error:    string | null
}

/**
 * Resolves a profiler session from:
 *  - ?token=xxx  → validate against cr.patient_intake tokens (pre-visit link)
 *  - ?email=xxx  → standalone new-patient with org default
 *  - no params   → standalone new-patient
 */
export function useToken(): TokenResult {
  const [session, setSession] = useState<ProfilerSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    async function resolve() {
      const params  = new URLSearchParams(window.location.search)
      const token   = params.get('token')
      const email   = params.get('email')
      const langParam = params.get('lang')

      // Store language preference if in URL
      if (langParam && ['en', 'es', 'fr'].includes(langParam)) {
        sessionStorage.setItem('ptrac_lang', langParam)
      }

      if (!token) {
        // Standalone mode — no token required
        setSession({
          mode:   'standalone',
          email:  email ?? undefined,
          orgId:  ORG_ID,
        })
        setLoading(false)
        return
      }

      try {
        // Validate token against cr.patient_intake
        const { data, error: dbErr } = await supabase
          .from('patient_intake')
          .select('patient_id, org_id, appointment_id, expires_at, status')
          .eq('intake_token', token)
          .eq('org_id', ORG_ID)
          .single()

        if (dbErr || !data) {
          setError('This link is invalid or has expired. Please contact your provider\'s office.')
          setLoading(false)
          return
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError('This link has expired (links are valid for 48 hours). Please contact your provider\'s office.')
          setLoading(false)
          return
        }

        // Optionally fetch appointment info for personalization
        let apptDate: string | undefined
        let providerName: string | undefined

        if (data.appointment_id) {
          const { data: appt } = await supabase
            .from('appointments')
            .select('scheduled_date, providers(first_name, last_name)')
            .eq('appointment_id', data.appointment_id)
            .single()

          if (appt) {
            apptDate = appt.scheduled_date
            const p = (appt as any).providers
            if (p) providerName = `${p.first_name} ${p.last_name}`
          }
        }

        setSession({
          mode:        'token',
          token,
          patientId:   data.patient_id,
          orgId:       data.org_id,
          apptDate,
          providerName,
        })
      } catch (e) {
        setError('Unable to verify your link. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    resolve()
  }, [])

  return { session, loading, error }
}
