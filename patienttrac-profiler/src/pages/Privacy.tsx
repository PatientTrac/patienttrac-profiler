import { useState } from 'react'
import type { Lang } from '../types'

const C = {
  navy950: '#020a14', navy900: '#060e1c', navy800: '#0a1628', navy700: '#0f2040',
  gold: '#c9a96e', goldLt: '#e8cc9a', text: '#e8eaf0', muted: '#8a9bc0', subtle: '#3a4a6a', cyan: '#00d4ff', green: '#4ade80',
}

const CONTENT: Record<Lang, { title: string; subtitle: string; updated: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: 'Privacy Policy',
    subtitle: 'How PatientTrac collects, uses, and protects your information.',
    updated: 'Last updated: April 24, 2026',
    sections: [
      { heading: '1. Who We Are', body: 'PatientTrac Corp ("PatientTrac," "we," "us," or "our") operates the PatientTrac Patient Profiler platform at patienttracprofiler.com. We are a healthcare technology company providing HIPAA-compliant patient intake and profile management services to medical practices and their patients.' },
      { heading: '2. Information We Collect', body: 'We collect information you provide directly, including: full name, date of birth, gender, contact information (email, phone, address), insurance details, medical history, current medications, known allergies, surgical history, family medical history, social history, review of systems responses, and electronic signatures on consent forms. We also collect technical data including IP address, browser type, device type, and session duration for security and performance purposes.' },
      { heading: '3. How We Use Your Information', body: 'We use your information to: (a) populate your electronic health record in your provider\'s practice management system; (b) verify your identity and insurance eligibility; (c) send appointment reminders and intake links via email and SMS; (d) process electronic consent forms; (e) improve platform performance and security; (f) comply with applicable laws and regulations including HIPAA. We do not sell your personal or health information to any third party for marketing purposes.' },
      { heading: '4. HIPAA and Protected Health Information', body: 'PatientTrac is a Business Associate of covered healthcare entities under the Health Insurance Portability and Accountability Act (HIPAA). We treat all health-related information as Protected Health Information (PHI) and comply with the HIPAA Privacy Rule, Security Rule, and Breach Notification Rule. We sign a Business Associate Agreement (BAA) with every covered entity that uses our platform. PHI is encrypted at rest (AES-256) and in transit (TLS 1.3) at all times.' },
      { heading: '5. Data Sharing', body: 'We share your information only: (a) with your healthcare provider and their authorized staff; (b) with our technology subprocessors (Supabase for database hosting, Netlify for web hosting) under strict data processing agreements; (c) with HubSpot for CRM contact management, limited to non-PHI contact information; (d) as required by law, court order, or regulatory authority; (e) in connection with a merger, acquisition, or sale of assets, with equivalent privacy protections maintained.' },
      { heading: '6. Data Retention', body: 'Patient health information is retained for a minimum of 7 years from the date of last service, or longer if required by applicable state law. You may request deletion of non-PHI account data at any time by contacting us at privacy@patienttrac.com. Note that PHI subject to HIPAA retention requirements cannot be deleted on request.' },
      { heading: '7. Your Rights', body: 'Under HIPAA, you have the right to: access and receive a copy of your PHI; request corrections to your PHI; request restrictions on certain uses and disclosures; receive an accounting of disclosures; receive a paper copy of this notice. Under applicable state privacy laws (including CCPA for California residents), you may have additional rights including the right to know, delete, and opt-out of certain data processing.' },
      { heading: '8. Security', body: 'We implement industry-standard security measures including: AES-256 encryption at rest; TLS 1.3 encryption in transit; role-based access control (RBAC); multi-factor authentication for all staff accounts; audit logging of all data access events; regular penetration testing and security assessments; HIPAA-compliant cloud infrastructure.' },
      { heading: '9. Cookies and Tracking', body: 'We use essential cookies to maintain your session and save your intake progress locally. We do not use advertising or tracking cookies. We do not use Google Analytics, Facebook Pixel, or any third-party behavioral tracking on patient-facing pages. Session data is stored in your browser\'s localStorage and is never transmitted to advertising networks.' },
      { heading: '10. Children\'s Privacy', body: 'Our platform is not directed to children under 13. Minors\' health information is collected only when provided by a parent or legal guardian acting on their behalf. If you believe we have inadvertently collected information from a child under 13 without parental consent, please contact us immediately at privacy@patienttrac.com.' },
      { heading: '11. Changes to This Policy', body: 'We may update this Privacy Policy from time to time. We will notify affected users via email at least 30 days before material changes take effect. Continued use of the platform after that date constitutes acceptance of the updated policy. The "Last Updated" date at the top of this page reflects the most recent revision.' },
      { heading: '12. Contact Us', body: 'For privacy inquiries, data requests, or to report a potential breach:\n\nPatientTrac Corp — Privacy Office\nEmail: privacy@patienttrac.com\nSupport: support@patienttrac.com\nMailing: PatientTrac Corp, Privacy Office, Miami, FL, USA' },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    subtitle: 'Cómo PatientTrac recopila, usa y protege su información.',
    updated: 'Última actualización: 24 de abril de 2026',
    sections: [
      { heading: '1. Quiénes Somos', body: 'PatientTrac Corp ("PatientTrac," "nosotros" o "nuestro") opera la plataforma PatientTrac Patient Profiler en patienttracprofiler.com. Somos una empresa de tecnología de salud que proporciona servicios de gestión de perfiles de pacientes y admisión que cumplen con HIPAA a prácticas médicas y sus pacientes.' },
      { heading: '2. Información que Recopilamos', body: 'Recopilamos información que usted proporciona directamente, incluyendo: nombre completo, fecha de nacimiento, género, información de contacto (correo electrónico, teléfono, dirección), detalles del seguro médico, historial médico, medicamentos actuales, alergias conocidas, historial quirúrgico, historial médico familiar, historial social, respuestas de revisión de sistemas y firmas electrónicas en formularios de consentimiento.' },
      { heading: '3. Cómo Usamos su Información', body: 'Usamos su información para: (a) completar su historial clínico en el sistema de su proveedor; (b) verificar su identidad y elegibilidad de seguro; (c) enviar recordatorios de citas y enlaces de admisión; (d) procesar formularios de consentimiento electrónico; (e) mejorar el rendimiento y la seguridad de la plataforma; (f) cumplir con las leyes aplicables incluyendo HIPAA. No vendemos su información personal o de salud a terceros.' },
      { heading: '4. HIPAA e Información de Salud Protegida', body: 'PatientTrac es un Asociado Comercial de entidades cubiertas de atención médica bajo HIPAA. Tratamos toda la información relacionada con la salud como Información de Salud Protegida (PHI) y cumplimos con la Regla de Privacidad, Regla de Seguridad y Regla de Notificación de Violaciones de HIPAA. Firmamos un Acuerdo de Asociado Comercial (BAA) con cada entidad cubierta. La PHI está encriptada en reposo (AES-256) y en tránsito (TLS 1.3) en todo momento.' },
      { heading: '5. Compartir Datos', body: 'Compartimos su información únicamente: (a) con su proveedor de salud y su personal autorizado; (b) con nuestros subprocesadores de tecnología (Supabase, Netlify) bajo acuerdos estrictos de procesamiento de datos; (c) con HubSpot para gestión de contactos CRM, limitado a información de contacto no PHI; (d) según lo requiera la ley o autoridad regulatoria.' },
      { heading: '6. Retención de Datos', body: 'La información de salud del paciente se conserva por un mínimo de 7 años desde la fecha del último servicio. Puede solicitar la eliminación de datos de cuenta no PHI en cualquier momento contactándonos en privacy@patienttrac.com.' },
      { heading: '7. Sus Derechos', body: 'Bajo HIPAA, tiene derecho a: acceder y recibir una copia de su PHI; solicitar correcciones a su PHI; solicitar restricciones en ciertos usos y divulgaciones; recibir un registro de divulgaciones. Los residentes de California tienen derechos adicionales bajo la CCPA.' },
      { heading: '8. Seguridad', body: 'Implementamos medidas de seguridad estándar de la industria incluyendo: encriptación AES-256 en reposo; encriptación TLS 1.3 en tránsito; control de acceso basado en roles; autenticación multifactor para todas las cuentas de personal; registro de auditoría de todos los eventos de acceso a datos.' },
      { heading: '9. Cookies y Rastreo', body: 'Usamos cookies esenciales para mantener su sesión y guardar su progreso de admisión localmente. No usamos cookies publicitarias o de rastreo. No usamos Google Analytics, Facebook Pixel ni ningún rastreo de comportamiento de terceros en páginas de cara al paciente.' },
      { heading: '10. Privacidad de Menores', body: 'Nuestra plataforma no está dirigida a menores de 13 años. La información de salud de menores solo se recopila cuando la proporciona un padre o tutor legal. Contáctenos en privacy@patienttrac.com si cree que hemos recopilado información de un menor sin consentimiento parental.' },
      { heading: '11. Cambios a Esta Política', body: 'Podemos actualizar esta Política de Privacidad periódicamente. Notificaremos a los usuarios afectados por correo electrónico al menos 30 días antes de que los cambios importantes entren en vigor.' },
      { heading: '12. Contáctenos', body: 'Para consultas de privacidad o solicitudes de datos:\n\nPatientTrac Corp — Oficina de Privacidad\nCorreo: privacy@patienttrac.com\nSoporte: support@patienttrac.com' },
    ],
  },
  fr: {
    title: 'Politique de Confidentialité',
    subtitle: 'Comment PatientTrac collecte, utilise et protège vos informations.',
    updated: 'Dernière mise à jour: 24 avril 2026',
    sections: [
      { heading: '1. Qui Nous Sommes', body: 'PatientTrac Corp ("PatientTrac," "nous" ou "notre") exploite la plateforme PatientTrac Patient Profiler sur patienttracprofiler.com. Nous sommes une entreprise de technologie de santé fournissant des services de gestion de profils patients conformes à HIPAA.' },
      { heading: '2. Informations que Nous Collectons', body: 'Nous collectons les informations que vous fournissez directement, notamment: nom complet, date de naissance, genre, coordonnées (email, téléphone, adresse), détails de l\'assurance, antécédents médicaux, médicaments actuels, allergies connues, antécédents chirurgicaux, histoire familiale médicale, histoire sociale, réponses de revue des systèmes et signatures électroniques.' },
      { heading: '3. Utilisation de Vos Informations', body: 'Nous utilisons vos informations pour: (a) renseigner votre dossier médical électronique; (b) vérifier votre identité et votre éligibilité à l\'assurance; (c) envoyer des rappels de rendez-vous; (d) traiter les formulaires de consentement électronique; (e) améliorer les performances de la plateforme; (f) nous conformer aux lois applicables dont HIPAA. Nous ne vendons pas vos informations personnelles ou de santé.' },
      { heading: '4. HIPAA et Informations de Santé Protégées', body: 'PatientTrac est un Associé Commercial d\'entités de soins de santé couvertes en vertu de HIPAA. Nous traitons toutes les informations liées à la santé comme des Informations de Santé Protégées (PHI) et nous nous conformons aux Règles de Confidentialité, de Sécurité et de Notification de Violation de HIPAA. Les PHI sont chiffrées au repos (AES-256) et en transit (TLS 1.3).' },
      { heading: '5. Partage des Données', body: 'Nous partageons vos informations uniquement: (a) avec votre prestataire de soins et son personnel autorisé; (b) avec nos sous-traitants technologiques (Supabase, Netlify) sous accords stricts; (c) avec HubSpot pour la gestion CRM, limité aux informations de contact non-PHI; (d) selon les exigences légales.' },
      { heading: '6. Conservation des Données', body: 'Les informations de santé des patients sont conservées pendant au moins 7 ans à compter de la date du dernier service. Vous pouvez demander la suppression des données de compte non-PHI à tout moment en nous contactant à privacy@patienttrac.com.' },
      { heading: '7. Vos Droits', body: 'En vertu de HIPAA, vous avez le droit d\'accéder à vos PHI, de demander des corrections, de demander des restrictions sur certaines utilisations et de recevoir un compte rendu des divulgations.' },
      { heading: '8. Sécurité', body: 'Nous mettons en œuvre des mesures de sécurité standard de l\'industrie: chiffrement AES-256 au repos; TLS 1.3 en transit; contrôle d\'accès basé sur les rôles; authentification multifacteur; journalisation des audits.' },
      { heading: '9. Cookies et Suivi', body: 'Nous utilisons des cookies essentiels pour maintenir votre session. Nous n\'utilisons pas de cookies publicitaires ou de suivi comportemental sur les pages destinées aux patients.' },
      { heading: '10. Confidentialité des Enfants', body: 'Notre plateforme n\'est pas destinée aux enfants de moins de 13 ans. Contactez-nous à privacy@patienttrac.com si vous pensez que nous avons collecté des informations d\'un enfant sans consentement parental.' },
      { heading: '11. Modifications de Cette Politique', body: 'Nous pouvons mettre à jour cette politique périodiquement. Nous informerons les utilisateurs concernés par email au moins 30 jours avant l\'entrée en vigueur des changements importants.' },
      { heading: '12. Nous Contacter', body: 'Pour toute question de confidentialité:\n\nPatientTrac Corp — Bureau de la Confidentialité\nEmail: privacy@patienttrac.com\nSupport: support@patienttrac.com' },
    ],
  },
}

export default function Privacy() {
  const [lang, setLang] = useState<Lang>(() => {
    const nav = navigator.language?.slice(0, 2)
    if (nav === 'es') return 'es'
    if (nav === 'fr') return 'fr'
    return 'en'
  })
  const content = CONTENT[lang]

  return <LegalPage lang={lang} setLang={setLang} content={content} color={C.cyan} badge="PRIVACY POLICY" />
}

export function LegalPage({ lang, setLang, content, color, badge }: {
  lang: Lang; setLang: (l: Lang) => void
  content: { title: string; subtitle: string; updated: string; sections: { heading: string; body: string }[] }
  color: string; badge: string
}) {
  return (
    <div style={{ minHeight: '100dvh', background: C.navy950, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: C.navy900, borderBottom: `1px solid rgba(201,169,110,0.12)`, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 20, color: C.gold, textDecoration: 'none' }}>PatientTrac</a>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['en', 'es', 'fr'] as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? C.gold : 'transparent', color: lang === l ? C.navy950 : C.muted, border: `1px solid ${lang === l ? C.gold : C.subtle}`, borderRadius: 4, padding: '4px 9px', fontSize: 11, fontFamily: 'DM Mono,monospace', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>{l}</button>
          ))}
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: C.navy900, borderBottom: `1px solid rgba(201,169,110,0.08)`, padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 4, padding: '4px 12px', fontSize: 10, fontFamily: 'DM Mono,monospace', color, letterSpacing: '0.1em', marginBottom: 20 }}>{badge}</div>
          <h1 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: C.text, marginBottom: 12 }}>{content.title}</h1>
          <p style={{ color: C.muted, fontSize: 16, marginBottom: 16 }}>{content.subtitle}</p>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: C.subtle }}>{content.updated}</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* HIPAA badge */}
        <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, padding: '16px 20px', marginBottom: 40, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: C.green, letterSpacing: '0.08em', marginBottom: 4 }}>HIPAA COMPLIANT PLATFORM</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>PatientTrac is fully HIPAA compliant. All patient health information is treated as Protected Health Information (PHI) and handled under a Business Associate Agreement (BAA) with your practice.</div>
          </div>
        </div>

        {content.sections.map((sec, i) => (
          <div key={i} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: i < content.sections.length - 1 ? `1px solid rgba(201,169,110,0.06)` : 'none' }}>
            <h2 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 20, color: C.gold, marginBottom: 14 }}>{sec.heading}</h2>
            <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.85, whiteSpace: 'pre-line' }}>{sec.body}</p>
          </div>
        ))}

        {/* Footer links */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingTop: 24, borderTop: `1px solid rgba(201,169,110,0.08)` }}>
          {[['Terms of Service', '/terms'], ['HIPAA Notice', '/hipaa'], ['Contact', '/contact'], ['Home', '/']].map(([label, href]) => (
            <a key={label} href={href} style={{ color: C.muted, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.gold}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}>
              {label}
            </a>
          ))}
        </div>
        <div style={{ marginTop: 20, fontSize: 12, color: C.subtle, fontFamily: 'DM Mono,monospace' }}>© {new Date().getFullYear()} PATIENTTRAC CORP · support@patienttrac.com</div>
      </div>
    </div>
  )
}
