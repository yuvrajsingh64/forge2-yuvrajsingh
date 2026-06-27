export default function StatusBadge({ status }) {
  const map = {
    open: { label: 'Open', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    resolved: { label: 'Resolved', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    closed: { label: 'Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  }
  const s = map[status] || map.open
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.color}30`,
      textTransform: 'uppercase',
    }}>
      {s.label}
    </span>
  )
}
