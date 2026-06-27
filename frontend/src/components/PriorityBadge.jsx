export default function PriorityBadge({ priority }) {
  const map = {
    low: { label: 'Low', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    high: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    urgent: { label: 'Urgent', color: '#dc2626', bg: 'rgba(220,38,38,0.15)' },
  }
  const p = map[priority] || map.medium
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 10px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 600,
      color: p.color,
      background: p.bg,
      border: `1px solid ${p.color}30`,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    }}>
      {p.label}
    </span>
  )
}
