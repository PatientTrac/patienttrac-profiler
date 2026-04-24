import { useState } from 'react'
import type { Lang } from '../types'
import { LegalPage } from './Privacy'

const C = { gold: '#c9a96e', amber: '#fbbf24' }

const CONTENT: Record<Lang, { title: string; subtitle: string; updated: string; sections: { heading: string; body: string }[] }> = {
  en: {
    title: 'Terms of Service',
    subtitle: 'The agreement between you and PatientTrac Corp when using our platform.',
    updated: 'Last updated: April 24, 2026',
    sections: [
      { heading: '1. Acceptance of Terms', body: 'By accessing or using the PatientTrac Patient Profiler platform ("Service") at patienttracprofiler.com, you agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of a medical practice or organization, you represent that you have authority to bind that entity to these Terms. If you do not agree to these Terms, do not use the Service.' },
      { heading: '2. Description of Service', body: 'PatientTrac Patient Profiler is a HIPAA-compliant patient intake and profile management platform that allows patients to complete their health profile digitally before medical appointments. The platform collects demographics, medical history, insurance information, review of systems, and consent forms, and syncs this data to your healthcare provider\'s electronic health record system.' },
      { heading: '3. Eligibility', body: 'You must be at least 18 years of age to use this Service independently. Minors may use the Service only when a parent or legal guardian provides information on their behalf. By using the Service, you represent that you are 18 or older, or are a parent/guardian acting on behalf of a minor patient.' },
      { heading: '4. Patient Use', body: 'As a patient using this Service, you agree to: (a) provide accurate, complete, and current information; (b) promptly update any information that changes; (c) maintain the security of your intake link and not share it with unauthorized persons; (d) acknowledge that information submitted becomes part of your medical record; (e) understand that your provider will have access to all submitted information.' },
      { heading: '5. Practice / Provider Use', body: 'As a healthcare provider or practice using this Service, you agree to: (a) maintain a valid Business Associate Agreement (BAA) with PatientTrac; (b) use the Service only for lawful healthcare purposes; (c) train staff on appropriate use and patient privacy; (d) promptly report any suspected security incidents; (e) maintain appropriate safeguards as required by HIPAA; (f) not use the Service for any patient population without proper clinical oversight.' },
      { heading: '6. Prohibited Uses', body: 'You may not: (a) use the Service for any unlawful purpose or in violation of HIPAA; (b) submit false or misleading health information; (c) attempt to access another patient\'s profile or data; (d) reverse engineer, decompile, or attempt to extract source code; (e) use automated scripts, bots, or crawlers on the platform; (f) share, sell, or transfer your access credentials; (g) use the Service to send unsolicited communications; (h) interfere with or disrupt the Service or its infrastructure.' },
      { heading: '7. Intellectual Property', body: 'The Service, including its design, code, content, features, and functionality, is owned by PatientTrac Corp and is protected by copyright, trademark, patent, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service solely for its intended purpose. Nothing in these Terms transfers any intellectual property rights to you.' },
      { heading: '8. Health Information Disclaimer', body: 'The Service is a data collection and management tool — it is NOT a medical advice, diagnosis, or treatment platform. Information submitted through the Service is for your healthcare provider\'s use. PatientTrac Corp does not review, validate, or provide medical opinions on any information submitted. Always consult a qualified healthcare professional for medical decisions.' },
      { heading: '9. Availability and Uptime', body: 'We strive to maintain 99.9% uptime but do not guarantee uninterrupted access to the Service. We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) with reasonable notice. We are not liable for any loss resulting from Service unavailability.' },
      { heading: '10. Limitation of Liability', body: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, PATIENTTRAC CORP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL. OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT PAID BY YOU (OR YOUR PRACTICE) IN THE 12 MONTHS PRECEDING THE CLAIM.' },
      { heading: '11. Indemnification', body: 'You agree to indemnify, defend, and hold harmless PatientTrac Corp and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable legal fees) arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any applicable law or third-party rights; (d) inaccurate information you submit through the Service.' },
      { heading: '12. Termination', body: 'PatientTrac may terminate or suspend your access to the Service at any time, with or without cause, with or without notice. Upon termination, your right to use the Service immediately ceases. Provisions of these Terms that by their nature should survive termination shall survive, including intellectual property, limitation of liability, and indemnification.' },
      { heading: '13. Governing Law', body: 'These Terms shall be governed by and construed in accordance with the laws of the State of Florida, United States, without regard to conflict of law provisions. Any disputes shall be resolved in the state or federal courts located in Miami-Dade County, Florida. You consent to personal jurisdiction in those courts.' },
      { heading: '14. Changes to Terms', body: 'We reserve the right to modify these Terms at any time. We will provide notice of material changes via email at least 30 days in advance. Your continued use of the Service after changes take effect constitutes your acceptance of the new Terms.' },
      { heading: '15. Contact', body: 'Questions about these Terms:\n\nPatientTrac Corp — Legal\nEmail: legal@patienttrac.com\nSupport: support@patienttrac.com\nSales: sales@patienttrac.com' },
    ],
  },
  es: {
    title: 'Términos de Servicio',
    subtitle: 'El acuerdo entre usted y PatientTrac Corp al usar nuestra plataforma.',
    updated: 'Última actualización: 24 de abril de 2026',
    sections: [
      { heading: '1. Aceptación de los Términos', body: 'Al acceder o usar la plataforma PatientTrac Patient Profiler ("Servicio") en patienttracprofiler.com, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con estos Términos, no use el Servicio.' },
      { heading: '2. Descripción del Servicio', body: 'PatientTrac Patient Profiler es una plataforma de gestión de admisión de pacientes que cumple con HIPAA, que permite a los pacientes completar su perfil de salud digitalmente antes de las citas médicas.' },
      { heading: '3. Elegibilidad', body: 'Debe tener al menos 18 años para usar este Servicio de forma independiente. Los menores solo pueden usar el Servicio cuando un padre o tutor legal proporciona información en su nombre.' },
      { heading: '4. Uso del Paciente', body: 'Como paciente que usa este Servicio, usted acepta: (a) proporcionar información precisa y completa; (b) actualizar cualquier información que cambie; (c) mantener la seguridad de su enlace de admisión; (d) reconocer que la información enviada forma parte de su historial médico.' },
      { heading: '5. Uso de la Práctica / Proveedor', body: 'Como proveedor de atención médica, usted acepta: (a) mantener un Acuerdo de Asociado Comercial (BAA) válido con PatientTrac; (b) usar el Servicio solo para fines de atención médica legales; (c) capacitar al personal sobre el uso apropiado y la privacidad del paciente.' },
      { heading: '6. Usos Prohibidos', body: 'No puede: (a) usar el Servicio para ningún propósito ilegal o en violación de HIPAA; (b) enviar información de salud falsa o engañosa; (c) intentar acceder al perfil de otro paciente; (d) realizar ingeniería inversa del servicio; (e) usar scripts automatizados o bots.' },
      { heading: '7. Propiedad Intelectual', body: 'El Servicio es propiedad de PatientTrac Corp y está protegido por leyes de propiedad intelectual. Se le otorga una licencia limitada para usar el Servicio únicamente para su propósito previsto.' },
      { heading: '8. Descargo de Responsabilidad de Información de Salud', body: 'El Servicio es una herramienta de recopilación de datos, NO una plataforma de consejos médicos, diagnóstico o tratamiento. Siempre consulte a un profesional de salud calificado para decisiones médicas.' },
      { heading: '9. Disponibilidad', body: 'Nos esforzamos por mantener una disponibilidad del 99.9% pero no garantizamos acceso ininterrumpido. Nos reservamos el derecho de modificar o suspender el Servicio con aviso razonable.' },
      { heading: '10. Limitación de Responsabilidad', body: 'EN LA MEDIDA MÁXIMA PERMITIDA POR LA LEY, PATIENTTRAC CORP NO SERÁ RESPONSABLE DE DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS. NUESTRA RESPONSABILIDAD TOTAL NO EXCEDERÁ EL MONTO PAGADO EN LOS 12 MESES ANTERIORES AL RECLAMO.' },
      { heading: '11. Indemnización', body: 'Usted acepta indemnizar y eximir de responsabilidad a PatientTrac Corp de cualquier reclamo que surja de: (a) su uso del Servicio; (b) su violación de estos Términos; (c) información inexacta que envíe.' },
      { heading: '12. Terminación', body: 'PatientTrac puede terminar o suspender su acceso al Servicio en cualquier momento. Al terminar, su derecho a usar el Servicio cesa inmediatamente.' },
      { heading: '13. Ley Aplicable', body: 'Estos Términos se regirán por las leyes del Estado de Florida, Estados Unidos. Cualquier disputa se resolverá en los tribunales de Miami-Dade County, Florida.' },
      { heading: '14. Cambios en los Términos', body: 'Nos reservamos el derecho de modificar estos Términos en cualquier momento. Proporcionaremos aviso de cambios importantes con al menos 30 días de anticipación por correo electrónico.' },
      { heading: '15. Contacto', body: 'Preguntas sobre estos Términos:\n\nPatientTrac Corp — Legal\nCorreo: legal@patienttrac.com\nSoporte: support@patienttrac.com' },
    ],
  },
  fr: {
    title: 'Conditions d\'Utilisation',
    subtitle: 'L\'accord entre vous et PatientTrac Corp lors de l\'utilisation de notre plateforme.',
    updated: 'Dernière mise à jour: 24 avril 2026',
    sections: [
      { heading: '1. Acceptation des Conditions', body: 'En accédant ou en utilisant la plateforme PatientTrac Patient Profiler ("Service") sur patienttracprofiler.com, vous acceptez d\'être lié par ces Conditions d\'Utilisation. Si vous n\'acceptez pas ces Conditions, n\'utilisez pas le Service.' },
      { heading: '2. Description du Service', body: 'PatientTrac Patient Profiler est une plateforme de gestion des admissions de patients conforme à HIPAA, permettant aux patients de compléter leur profil de santé numériquement avant les rendez-vous médicaux.' },
      { heading: '3. Éligibilité', body: 'Vous devez avoir au moins 18 ans pour utiliser ce Service de manière indépendante. Les mineurs ne peuvent utiliser le Service que lorsqu\'un parent ou tuteur légal fournit des informations en leur nom.' },
      { heading: '4. Utilisation par le Patient', body: 'En tant que patient utilisant ce Service, vous acceptez de: (a) fournir des informations exactes et complètes; (b) mettre à jour toute information qui change; (c) maintenir la sécurité de votre lien d\'admission; (d) reconnaître que les informations soumises font partie de votre dossier médical.' },
      { heading: '5. Utilisation par le Prestataire', body: 'En tant que prestataire de soins, vous acceptez de: (a) maintenir un Accord d\'Associé Commercial (BAA) valide avec PatientTrac; (b) utiliser le Service uniquement à des fins médicales légales; (c) former le personnel à l\'utilisation appropriée et à la confidentialité.' },
      { heading: '6. Utilisations Interdites', body: 'Vous ne pouvez pas: (a) utiliser le Service à des fins illégales ou en violation de HIPAA; (b) soumettre des informations de santé fausses; (c) tenter d\'accéder au profil d\'un autre patient; (d) faire de la rétro-ingénierie du service; (e) utiliser des scripts automatisés ou des robots.' },
      { heading: '7. Propriété Intellectuelle', body: 'Le Service est la propriété de PatientTrac Corp et est protégé par les lois sur la propriété intellectuelle. Une licence limitée vous est accordée pour utiliser le Service uniquement à sa fin prévue.' },
      { heading: '8. Avis de Non-Responsabilité Médicale', body: 'Le Service est un outil de collecte de données — ce N\'EST PAS une plateforme de conseils médicaux, de diagnostic ou de traitement. Consultez toujours un professionnel de santé qualifié pour les décisions médicales.' },
      { heading: '9. Disponibilité', body: 'Nous nous efforçons de maintenir une disponibilité de 99,9% mais ne garantissons pas un accès ininterrompu. Nous nous réservons le droit de modifier ou suspendre le Service avec un préavis raisonnable.' },
      { heading: '10. Limitation de Responsabilité', body: 'DANS LA MESURE MAXIMALE PERMISE PAR LA LOI, PATIENTTRAC CORP NE SERA PAS RESPONSABLE DES DOMMAGES INDIRECTS, ACCESSOIRES, SPÉCIAUX OU CONSÉCUTIFS. NOTRE RESPONSABILITÉ TOTALE NE DÉPASSERA PAS LE MONTANT PAYÉ AU COURS DES 12 MOIS PRÉCÉDANT LA RÉCLAMATION.' },
      { heading: '11. Indemnisation', body: 'Vous acceptez d\'indemniser PatientTrac Corp de toute réclamation découlant de: (a) votre utilisation du Service; (b) votre violation de ces Conditions; (c) des informations inexactes que vous soumettez.' },
      { heading: '12. Résiliation', body: 'PatientTrac peut résilier ou suspendre votre accès au Service à tout moment. À la résiliation, votre droit d\'utiliser le Service cesse immédiatement.' },
      { heading: '13. Droit Applicable', body: 'Ces Conditions sont régies par les lois de l\'État de Floride, États-Unis. Tout litige sera résolu devant les tribunaux de Miami-Dade County, Floride.' },
      { heading: '14. Modifications des Conditions', body: 'Nous nous réservons le droit de modifier ces Conditions à tout moment. Nous informerons des changements importants au moins 30 jours à l\'avance par email.' },
      { heading: '15. Contact', body: 'Questions concernant ces Conditions:\n\nPatientTrac Corp — Juridique\nEmail: legal@patienttrac.com\nSupport: support@patienttrac.com' },
    ],
  },
}

export default function Terms() {
  const [lang, setLang] = useState<Lang>(() => {
    const nav = navigator.language?.slice(0, 2)
    if (nav === 'es') return 'es'
    if (nav === 'fr') return 'fr'
    return 'en'
  })
  return <LegalPage lang={lang} setLang={setLang} content={CONTENT[lang]} color={C.amber} badge="TERMS OF SERVICE" />
}
