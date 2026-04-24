export default function CheckoutSuccess() {
  const C = { navy950: '#020a14', navy800: '#0a1628', gold: '#c9a96e', text: '#e8eaf0', muted: '#8a9bc0', green: '#4ade80' }

  return (
    <div style={{ minHeight: '100dvh', background: C.navy950, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', gap: 20 }}>
      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 24, fontWeight: 700, color: C.gold }}>PatientTrac</div>

      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
        ✓
      </div>

      <div>
        <h1 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 32, color: C.green, marginBottom: 12 }}>
          Welcome to PatientTrac Profiler!
        </h1>
        <p style={{ color: C.muted, maxWidth: 400, lineHeight: 1.7, fontSize: 16 }}>
          Your subscription is active. Check your email for setup instructions and your admin login link.
        </p>
      </div>

      <div style={{ background: C.navy800, border: '1px solid rgba(201,169,110,0.15)', borderRadius: 12, padding: '24px 32px', maxWidth: 420, width: '100%' }}>
        <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 16 }}>Next steps</div>
        {[
          ['1', 'Check your email for your admin login link'],
          ['2', 'Connect PatientTrac Profiler to your scheduling app'],
          ['3', 'Send your first patient intake link'],
        ].map(([n, step]) => (
          <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontFamily: 'DM Mono,monospace', color: C.gold, flexShrink: 0 }}>{n}</div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}>{step}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="https://patienttracforge.com" style={{ background: C.gold, color: C.navy950, padding: '12px 24px', borderRadius: 8, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', letterSpacing: '0.04em' }}>
          GO TO SCHEDULING APP →
        </a>
        <a href="mailto:support@patienttrac.com" style={{ border: '1px solid rgba(201,169,110,0.2)', color: C.muted, padding: '12px 24px', borderRadius: 8, fontSize: 14, textDecoration: 'none' }}>
          Contact Support
        </a>
      </div>

      <p style={{ fontSize: 12, color: '#3a4a6a', fontFamily: 'DM Mono,monospace' }}>
        Questions? support@patienttrac.com
      </p>
    </div>
  )
}
