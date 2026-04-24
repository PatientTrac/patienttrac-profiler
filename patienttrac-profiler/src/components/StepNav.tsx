interface Props {
  onBack?:    () => void
  onNext?:    () => void
  onSubmit?:  () => void
  nextLabel?: string
  backLabel?: string
  submitting?: boolean
  isFirst?:   boolean
  isLast?:    boolean
}

export default function StepNav({ onBack, onNext, onSubmit, nextLabel = 'Next →', backLabel = '← Back', submitting, isFirst, isLast }: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(201,169,110,0.08)' }}>
      {!isFirst && (
        <button onClick={onBack} className="btn-ghost" style={{ flex: '0 0 auto' }}>
          {backLabel}
        </button>
      )}
      {isLast ? (
        <button onClick={onSubmit} className="btn-gold" style={{ flex: 1 }} disabled={submitting}>
          {submitting ? '⏳ Submitting...' : nextLabel}
        </button>
      ) : (
        <button onClick={onNext} className="btn-gold" style={{ flex: 1 }}>
          {nextLabel}
        </button>
      )}
    </div>
  )
}
