import type { ReactNode } from 'react'

interface Props {
  label:    string
  required?: boolean
  error?:   string
  children: ReactNode
  half?:    boolean
}

export default function FieldRow({ label, required, error, children, half }: Props) {
  return (
    <div style={{ flex: half ? '1 1 calc(50% - 8px)' : '1 1 100%', minWidth: 0 }}>
      <label className="field-label">
        {label}{required && <span style={{ color: '#ff6b6b', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}
