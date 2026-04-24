# PatientTrac Profiler

**Live:** https://profiler.patienttracforge.com  
**Repo:** github.com/PatientTrac/patienttrac-profiler  
**Deployed:** Netlify → auto-deploy on push to `master`  
**Database:** Supabase `mskormozwekezjmtcylv` · us-east-1 (shared with PatientTracForge)

---

## Overview

Patient-facing profile completion app. Patients fill out their complete health profile **before their visit** — demographics, medical history, medications, allergies, insurance, review of systems, and consent/signature. All data saves directly into the shared Supabase database.

**Two entry modes:**

1. **Token mode** — patient receives an emailed link `profiler.patienttracforge.com?token=xxx` (48h expiry). Token is validated against `cr.patient_intake`. Prefills existing patient data.
2. **Standalone** — new patient walks in and registers at `profiler.patienttracforge.com` or with `?email=xxx`.

**Languages:** English · Español · Français (auto-detected, switchable)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS + custom HUD CSS variables |
| State | React hooks (no external store) |
| Backend | Supabase PostgreSQL (same project as scheduling) |
| Auth | Token-based (no Supabase Auth — patients are unauthenticated) |
| Hosting | Netlify Pro · profiler.patienttracforge.com |

---

## Data Written

| Table | What |
|---|---|
| `cr.patient` | Full demographics, contact, address, emergency contact |
| `cr.patient_intake` | Chief complaint, allergies, meds, ROS, consent, signature |
| `cr.patient_insurance` | Primary/secondary/tertiary coverage |
| `cr.medications` | Current medication list |

---

## Progress Persistence

Patient progress auto-saves to `localStorage` every 1.5 seconds. If patient closes the browser and returns via the same link, they resume where they left off. Progress is cleared on successful submit.

Storage key: `ptrac_profiler_progress_{token|email|standalone}`

---

## 8-Step Flow

| # | Step | Required |
|---|---|---|
| 1 | Personal Info | ✅ |
| 2 | Contact & Address | ✅ |
| 3 | Identity & Demographics | ✅ |
| 4 | Emergency Contact | ✅ |
| 5 | Medical History | ✅ |
| 6 | Review of Systems | Optional |
| 7 | Insurance | Optional |
| 8 | Consent & Signature | ✅ |

---

## Development Setup

```bash
git clone https://github.com/PatientTrac/patienttrac-profiler
cd patienttrac-profiler
npm install
cp .env.example .env.local
npm run dev   # → http://localhost:5175
```

**Test token mode:**
```
http://localhost:5175/?token=TEST_TOKEN
```

**Test standalone:**
```
http://localhost:5175/
http://localhost:5175/?email=patient@example.com
```

**Test language:**
```
http://localhost:5175/?lang=es
http://localhost:5175/?lang=fr
```

---

## Netlify Environment Variables

Set in Netlify dashboard under Site → Environment Variables:

```
VITE_SUPABASE_URL=https://mskormozwekezjmtcylv.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_DEV_ORG_ID=00000000-0000-0000-0000-000000000001
VITE_SCHEDULING_URL=https://patienttracforge.com
```

---

## Deploy

```bash
git add -A
git commit -m "feat: patient profiler — 8-step trilingual profile completion"
git push origin master
```

Netlify auto-deploys on push to `master`.

---

## Security

- No Supabase Auth — patients are unauthenticated
- Token validated server-side against `cr.patient_intake.intake_token`
- HIPAA security headers in `netlify.toml`
- No PII in URL beyond token (opaque UUID)
- Anon key is Supabase public key (RLS enforces all data isolation)
- Signature stored as base64 data URL in `patient_intake.signature_data`

---

*PatientTrac Patient Profiler · HIPAA Compliant · v1.0.0*
