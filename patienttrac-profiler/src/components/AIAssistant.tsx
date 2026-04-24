import { useState, useEffect, useRef, useCallback } from 'react'
import type { Lang } from '../types'

const C = {
  navy950: '#020a14', navy900: '#060e1c', navy800: '#0a1628', navy700: '#0f2040',
  gold: '#c9a96e', goldLt: '#e8cc9a', text: '#e8eaf0', muted: '#8a9bc0',
  subtle: '#3a4a6a', cyan: '#00d4ff', green: '#4ade80', red: '#ff6b6b', amber: '#fbbf24',
}

interface Message { role: 'user' | 'assistant'; content: string; ts: Date }

interface AIAssistantProps {
  lang:           Lang
  currentSection: string   // Which intake section patient is on
  patientName?:   string
  onClose:        () => void
}

// ── System prompt per language ────────────────────────────────────────────
function buildSystemPrompt(lang: Lang, section: string, name?: string): string {
  const greet = name ? (lang === 'es' ? `El paciente se llama ${name}.` : lang === 'fr' ? `Le patient s'appelle ${name}.` : `The patient's name is ${name}.`) : ''

  if (lang === 'es') return `Eres un asistente médico amigable y empático de PatientTrac que ayuda a los pacientes a completar su perfil de salud. ${greet} El paciente está actualmente en la sección: "${section}". Habla siempre en español. Responde en lenguaje claro y simple, evita jerga médica compleja. Si el paciente tiene preguntas sobre términos médicos, explícalos de forma sencilla. Si el paciente parece angustiado, sé compasivo. NUNCA diagnostiques ni recomiendes medicamentos. Si hay una emergencia médica, diles que llamen al 911 inmediatamente. Mantén las respuestas concisas (2-4 oraciones máximo) para una mejor experiencia móvil.`

  if (lang === 'fr') return `Vous êtes un assistant médical amical et empathique de PatientTrac qui aide les patients à compléter leur profil de santé. ${greet} Le patient est actuellement dans la section: "${section}". Répondez toujours en français. Utilisez un langage clair et simple, évitez le jargon médical complexe. Si le patient a des questions sur des termes médicaux, expliquez-les simplement. Si le patient semble anxieux, soyez compatissant. Ne diagnostiquez JAMAIS ni ne recommandez de médicaments. En cas d'urgence médicale, dites-leur d'appeler le 911 immédiatement. Gardez les réponses concises (2-4 phrases maximum) pour une meilleure expérience mobile.`

  return `You are a friendly, empathetic medical intake assistant for PatientTrac helping patients complete their health profile. ${greet} The patient is currently on the "${section}" section of the intake form. Always respond in English. Use clear, simple language — avoid complex medical jargon. If a patient asks about medical terms, explain them simply. If a patient seems distressed, be compassionate and supportive. NEVER diagnose conditions or recommend medications. If there is a medical emergency, tell them to call 911 immediately. Keep responses concise (2-4 sentences max) for a better mobile experience. Help them understand what information is needed in the current section.`
}

// ── Voice Input Hook ──────────────────────────────────────────────────────
function useVoiceInput(lang: Lang, onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recogRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SpeechRecognition)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recog = new SpeechRecognition()
    recog.lang        = lang === 'es' ? 'es-US' : lang === 'fr' ? 'fr-CA' : 'en-US'
    recog.continuous  = false
    recog.interimResults = false

    recog.onstart   = () => setListening(true)
    recog.onend     = () => setListening(false)
    recog.onerror   = () => setListening(false)
    recog.onresult  = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      onResult(transcript)
    }

    recogRef.current = recog
    recog.start()
  }, [lang, onResult])

  const stopListening = useCallback(() => {
    recogRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, supported, startListening, stopListening }
}

// ── Text-to-Speech ────────────────────────────────────────────────────────
function speak(text: string, lang: Lang) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt  = new SpeechSynthesisUtterance(text)
  utt.lang   = lang === 'es' ? 'es-US' : lang === 'fr' ? 'fr-CA' : 'en-US'
  utt.rate   = 0.9
  utt.pitch  = 1
  window.speechSynthesis.speak(utt)
}

// ── Main Component ────────────────────────────────────────────────────────
export default function AIAssistant({ lang, currentSection, patientName, onClose }: AIAssistantProps) {
  const [messages,  setMessages]  = useState<Message[]>([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [ttsOn,     setTtsOn]     = useState(false)
  const [expanded,  setExpanded]  = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const PLACEHOLDER = {
    en: 'Ask me anything about this section...',
    es: 'Pregúntame cualquier cosa sobre esta sección...',
    fr: 'Posez-moi une question sur cette section...',
  }[lang]

  const GREETING = {
    en: `Hi${patientName ? ` ${patientName}` : ''}! 👋 I'm your PatientTrac assistant. I'm here to help you complete your health profile. What questions do you have about the **${currentSection}** section?`,
    es: `¡Hola${patientName ? ` ${patientName}` : ''}! 👋 Soy tu asistente de PatientTrac. Estoy aquí para ayudarte a completar tu perfil de salud. ¿Tienes alguna pregunta sobre la sección **${currentSection}**?`,
    fr: `Bonjour${patientName ? ` ${patientName}` : ''} ! 👋 Je suis votre assistant PatientTrac. Je suis là pour vous aider à compléter votre profil de santé. Avez-vous des questions sur la section **${currentSection}** ?`,
  }[lang]

  // Set greeting on mount / section change
  useEffect(() => {
    setMessages([{ role: 'assistant', content: GREETING, ts: new Date() }])
  }, [currentSection, lang]) // eslint-disable-line

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const { listening, supported: voiceSupported, startListening, stopListening } = useVoiceInput(lang, (text) => {
    setInput(text)
    // Auto-send after voice
    setTimeout(() => sendMessage(text), 300)
  })

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content, ts: new Date() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system:     buildSystemPrompt(lang, currentSection, patientName),
          messages:   nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()
      const reply = data?.content?.[0]?.text ?? (
        lang === 'es' ? 'Lo siento, intenta de nuevo.' :
        lang === 'fr' ? 'Désolé, veuillez réessayer.' :
        'Sorry, I had trouble answering that. Please try again.'
      )

      const assistantMsg: Message = { role: 'assistant', content: reply, ts: new Date() }
      setMessages(prev => [...prev, assistantMsg])

      if (ttsOn) speak(reply, lang)

    } catch {
      const errMsg: Message = {
        role: 'assistant',
        content: lang === 'es' ? 'Lo siento, ocurrió un error. Por favor intenta de nuevo.' :
                 lang === 'fr' ? 'Désolé, une erreur s\'est produite. Veuillez réessayer.' :
                 'Sorry, something went wrong. Please try again.',
        ts: new Date(),
      }
      setMessages(prev => [...prev, errMsg])
    }
    setLoading(false)
  }

  // Quick question chips per section
  const QUICK_QUESTIONS: Record<string, string[]> = {
    en: {
      demographics:      ['What does "preferred pronouns" mean?', 'Why do you need my date of birth?', 'What is an interpreter?'],
      contact:           ['Why do you need my address?', 'What is an emergency contact?', 'Is my phone number secure?'],
      insurance:         ['What is a group number?', 'What if I don\'t have insurance?', 'What is a subscriber?'],
      medical_history:   ['What is a chronic condition?', 'Should I list all my conditions?', 'What if I\'m not sure of my diagnosis?'],
      medications:       ['Do I include vitamins?', 'What if I don\'t know the dose?', 'Should I list over-the-counter meds?'],
      allergies:         ['What\'s the difference between allergy and sensitivity?', 'What does NKDA mean?', 'What types of allergies should I list?'],
      surgical_history:  ['Does a biopsy count as surgery?', 'How far back should I go?', 'What if I don\'t remember the exact year?'],
      review_of_systems: ['What does "review of systems" mean?', 'Should I list past symptoms too?', 'What if I\'m not sure?'],
      consent:           ['Is my electronic signature legally binding?', 'Can I change my mind after signing?', 'What is HIPAA?'],
    }[lang] ?? [],
  }

  const chips = (QUICK_QUESTIONS[currentSection.toLowerCase().replace(/ /g, '_')] ?? []).slice(0, 3)

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 200,
        background: C.gold, color: C.navy950, border: 'none',
        width: 56, height: 56, borderRadius: '50%', fontSize: 24, cursor: 'pointer',
        boxShadow: '0 4px 24px rgba(201,169,110,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse-dot 3s ease-in-out infinite',
      }} title={lang === 'es' ? 'Asistente IA' : lang === 'fr' ? 'Assistant IA' : 'AI Assistant'}>
        🤖
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 200,
      width: 'min(380px, calc(100vw - 32px))',
      background: C.navy800,
      border: `1px solid rgba(201,169,110,0.25)`,
      borderRadius: 14,
      boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column',
      maxHeight: 'min(560px, 80dvh)',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{ background: C.navy900, borderBottom: `1px solid rgba(201,169,110,0.12)`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
          <div>
            <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14, color: C.gold }}>
              {lang === 'es' ? 'Asistente PatientTrac' : lang === 'fr' ? 'Assistant PatientTrac' : 'PatientTrac Assistant'}
            </div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 9, color: C.green, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
              {lang === 'es' ? 'EN LÍNEA' : lang === 'fr' ? 'EN LIGNE' : 'ONLINE'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* TTS toggle */}
          <button onClick={() => { setTtsOn(t => !t); if (ttsOn) window.speechSynthesis?.cancel() }}
            title={ttsOn ? 'Mute voice' : 'Enable voice readback'}
            style={{ background: ttsOn ? 'rgba(0,212,255,0.15)' : 'transparent', border: `1px solid ${ttsOn ? C.cyan : C.subtle}`, color: ttsOn ? C.cyan : C.subtle, width: 28, height: 28, borderRadius: 5, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {ttsOn ? '🔊' : '🔇'}
          </button>
          <button onClick={() => { setMessages([{ role: 'assistant', content: GREETING, ts: new Date() }]) }}
            title="Clear chat"
            style={{ background: 'transparent', border: `1px solid ${C.subtle}`, color: C.subtle, width: 28, height: 28, borderRadius: 5, cursor: 'pointer', fontSize: 12 }}>
            ↺
          </button>
          <button onClick={() => setExpanded(false)}
            style={{ background: 'transparent', border: `1px solid ${C.subtle}`, color: C.subtle, width: 28, height: 28, borderRadius: 5, cursor: 'pointer', fontSize: 14 }}>
            −
          </button>
          <button onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: C.subtle, width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}>
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🤖</div>
            )}
            <div style={{
              maxWidth: '80%',
              background: msg.role === 'user' ? 'rgba(201,169,110,0.15)' : C.navy700,
              border: `1px solid ${msg.role === 'user' ? 'rgba(201,169,110,0.25)' : 'rgba(201,169,110,0.08)'}`,
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              padding: '10px 13px',
              fontSize: 14,
              color: msg.role === 'user' ? C.goldLt : C.text,
              lineHeight: 1.6,
            }}>
              {/* Render **bold** markdown */}
              {msg.content.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                j % 2 === 1 ? <strong key={j} style={{ color: C.gold }}>{part}</strong> : part
              )}
              {msg.role === 'assistant' && (
                <button onClick={() => speak(msg.content, lang)}
                  style={{ display: 'block', marginTop: 6, background: 'none', border: 'none', color: C.subtle, cursor: 'pointer', fontSize: 11, padding: 0 }}>
                  🔊 {lang === 'es' ? 'Escuchar' : lang === 'fr' ? 'Écouter' : 'Listen'}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
            <div style={{ background: C.navy700, border: `1px solid rgba(201,169,110,0.08)`, borderRadius: '12px 12px 12px 4px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold, opacity: 0.4, animation: `pulse-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick chips */}
      {chips.length > 0 && messages.length <= 1 && (
        <div style={{ padding: '0 14px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {chips.map(chip => (
            <button key={chip} onClick={() => sendMessage(chip)} style={{
              background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.18)',
              color: C.cyan, fontSize: 11, padding: '5px 10px', borderRadius: 14, cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4, textAlign: 'left',
            }}>{chip}</button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: '10px 12px', borderTop: `1px solid rgba(201,169,110,0.08)`, flexShrink: 0 }}>
        {listening && (
          <div style={{ textAlign: 'center', fontSize: 12, color: C.red, fontFamily: 'DM Mono,monospace', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, display: 'inline-block', animation: 'pulse-dot 1s ease-in-out infinite' }} />
            {lang === 'es' ? 'ESCUCHANDO...' : lang === 'fr' ? 'ÉCOUTE EN COURS...' : 'LISTENING...'}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={PLACEHOLDER}
            rows={1}
            style={{
              flex: 1, background: C.navy700, border: `1px solid ${C.subtle}`, color: C.text,
              borderRadius: 8, padding: '9px 12px', fontSize: 14, resize: 'none',
              fontFamily: "'DM Sans',sans-serif", outline: 'none', lineHeight: 1.5,
              maxHeight: 80, overflowY: 'auto',
            }}
          />

          {/* Voice button */}
          {voiceSupported && (
            <button
              onClick={listening ? stopListening : startListening}
              title={lang === 'es' ? 'Hablar' : lang === 'fr' ? 'Parler' : 'Speak'}
              style={{
                width: 38, height: 38, borderRadius: 8, border: `1px solid ${listening ? C.red : C.subtle}`,
                background: listening ? 'rgba(255,107,107,0.15)' : 'transparent',
                color: listening ? C.red : C.muted, cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'all 0.2s',
              }}>
              {listening ? '⏹' : '🎤'}
            </button>
          )}

          {/* Send button */}
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: 8, border: 'none',
              background: input.trim() && !loading ? C.gold : C.navy700,
              color: input.trim() && !loading ? C.navy950 : C.subtle,
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'all 0.2s',
            }}>
            ↑
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 10, color: C.subtle, marginTop: 8, fontFamily: 'DM Mono,monospace' }}>
          {lang === 'es' ? 'NO DIAGNÓSTICO MÉDICO · HIPAA SEGURO' : lang === 'fr' ? 'PAS DE DIAGNOSTIC MÉDICAL · CONFORME HIPAA' : 'NO MEDICAL DIAGNOSIS · HIPAA SECURE'}
        </div>
      </div>
    </div>
  )
}
