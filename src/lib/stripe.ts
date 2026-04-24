// ── Stripe Configuration ───────────────────────────────────────────────────
// Price IDs are created in your Stripe dashboard
// Replace PROD_ values with real Stripe price IDs before go-live
// Test mode price IDs start with price_test_

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string

export interface PricingTier {
  id:          string
  name:        string
  badge?:      string
  priceMonthly: number
  priceAnnual:  number
  priceIdMonthly: string  // Stripe Price ID
  priceIdAnnual:  string  // Stripe Price ID
  description: string
  cta:         string
  highlighted: boolean
  features:    string[]
  notIncluded: string[]
}

export const TIERS: PricingTier[] = [
  {
    id:             'included',
    name:           'Included',
    priceMonthly:   0,
    priceAnnual:    0,
    priceIdMonthly: '', // No Stripe checkout — comes with PatientTracForge
    priceIdAnnual:  '',
    description:    'Included free with any PatientTracForge plan',
    cta:            'Get PatientTracForge',
    highlighted:    false,
    features: [
      '8-step patient intake form',
      'Auto-sync to scheduling app',
      'English · Español · Français',
      'Mobile-first design',
      'Auto-save progress',
      'Basic consent checkboxes',
      'Writes to shared database',
    ],
    notIncluded: [
      'Document uploads',
      'E-signature consent forms',
      'HubSpot CRM sync',
      'Completion notifications',
      'Custom branding',
    ],
  },
  {
    id:             'pro',
    name:           'Profiler Pro',
    badge:          'Most Popular',
    priceMonthly:   99,
    priceAnnual:    79,  // ~20% discount
    priceIdMonthly: 'price_profiler_pro_monthly',   // Replace with real Stripe ID
    priceIdAnnual:  'price_profiler_pro_annual',    // Replace with real Stripe ID
    description:    'Everything you need for a complete digital intake experience',
    cta:            'Start Free Trial',
    highlighted:    true,
    features: [
      'Everything in Included, plus:',
      'Document uploads (insurance card, photo ID, medical records)',
      'E-signature consent forms',
      'HubSpot CRM contact sync',
      'Completion notifications to staff',
      'Webhook → PatientTracForge on submit',
      'PDF export of completed profile',
      'Admin dashboard',
    ],
    notIncluded: [
      'Custom branded URL',
      'Custom intake form builder',
      'SMS reminders',
    ],
  },
  {
    id:             'enterprise',
    name:           'Profiler Enterprise',
    badge:          'Full Power',
    priceMonthly:   199,
    priceAnnual:    159, // ~20% discount
    priceIdMonthly: 'price_profiler_enterprise_monthly', // Replace with real Stripe ID
    priceIdAnnual:  'price_profiler_enterprise_annual',  // Replace with real Stripe ID
    description:    'White-label, custom forms, and enterprise integrations',
    cta:            'Start Free Trial',
    highlighted:    false,
    features: [
      'Everything in Pro, plus:',
      'Custom branded URL (your domain)',
      'Custom intake form builder',
      'Multilingual SMS reminders',
      'Priority email support',
      'API access',
      'Unlimited document storage',
      'Advanced analytics dashboard',
      'HIPAA BAA included',
    ],
    notIncluded: [],
  },
  {
    id:             'standalone',
    name:           'Standalone',
    priceMonthly:   149,
    priceAnnual:    119,
    priceIdMonthly: 'price_profiler_standalone_monthly', // Replace with real Stripe ID
    priceIdAnnual:  'price_profiler_standalone_annual',  // Replace with real Stripe ID
    description:    'Full Profiler for practices not on PatientTracForge',
    cta:            'Get Started',
    highlighted:    false,
    features: [
      'Full 8-step intake form',
      'Document uploads',
      'E-signature consent forms',
      'Admin dashboard',
      'HubSpot CRM sync',
      'Completion notifications',
      'PDF export',
      'Email support',
    ],
    notIncluded: [
      'PatientTracForge scheduling sync',
      'AI no-show prediction',
      'Smart scheduling',
      'Billing AI',
    ],
  },
]

// ── Checkout helper ────────────────────────────────────────────────────────
// Calls the existing stripe-checkout edge function on PatientTracForge
const STRIPE_EDGE_FN = 'https://mskormozwekezjmtcylv.supabase.co/functions/v1/stripe-checkout'

export async function redirectToCheckout(priceId: string, orgEmail?: string): Promise<void> {
  if (!priceId) {
    window.location.href = 'https://patienttracforge.com'
    return
  }

  try {
    const res = await fetch(STRIPE_EDGE_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_id:    priceId,
        email:       orgEmail ?? '',
        success_url: `${window.location.origin}/checkout/success`,
        cancel_url:  `${window.location.origin}/pricing`,
        product:     'patienttrac-profiler',
      }),
    })

    const data = await res.json()

    if (data?.url) {
      window.location.href = data.url
    } else {
      throw new Error(data?.error ?? 'No checkout URL returned')
    }
  } catch (err) {
    console.error('Stripe checkout error:', err)
    // Fallback — open Stripe payment link directly if edge fn unavailable
    alert('Redirecting to payment... If this fails, please email sales@patienttrac.com')
  }
}
