import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

function MetricCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '24px',
      flex: 1,
      minWidth: '160px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: color,
        borderRadius: '14px 14px 0 0',
      }} />
      <p style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        {label}
      </p>
      <p style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value ?? '—'}
      </p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</p>}
    </div>
  )
}

function BarChart({ data }) {
  if (!data || data.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet.</p>
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px', marginTop: '12px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '100%',
            height: `${(d.count / max) * 72}px`,
            background: 'var(--accent)',
            borderRadius: '4px 4px 0 0',
            minHeight: '4px',
            opacity: 0.8,
          }} />
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            {d.date ? d.date.slice(5) : ''}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/metrics'),
      api.get('/tickets?per_page=5'),
    ]).then(([m, t]) => {
      setMetrics(m.data)
      setRecentTickets(t.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading dashboard…</div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Support operations overview</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <MetricCard label="Total Open" value={metrics?.total_open} color="#6366f1" sub="open + pending" />
        <MetricCard label="Open" value={metrics?.by_status?.open ?? 0} color="#3b82f6" />
        <MetricCard label="Pending" value={metrics?.by_status?.pending ?? 0} color="#f59e0b" />
        <MetricCard label="Resolved" value={metrics?.by_status?.resolved ?? 0} color="#10b981" />
        <MetricCard label="SLA Breach" value={`${metrics?.sla_breach_rate ?? 0}%`} color="#ef4444" sub="of open tickets" />
        <MetricCard label="Avg Response" value={metrics?.avg_first_response_minutes ? `${metrics.avg_first_response_minutes}m` : '—'} color="#8b5cf6" sub="first reply time" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Tickets — Last 7 Days</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Daily volume</p>
          <BarChart data={metrics?.daily_volume} />
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>By Priority</p>
          {['urgent', 'high', 'medium', 'low'].map(p => {
            const count = metrics?.by_priority?.[p] ?? 0
            const colors = { urgent: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
            const total = Object.values(metrics?.by_priority || {}).reduce((a, b) => a + b, 0) || 1
            return (
              <div key={p} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', width: `${(count / total) * 100}%`, background: colors[p], borderRadius: '2px', transition: 'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent Tickets</p>
          <Link to="/tickets" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>View all →</Link>
        </div>
        {recentTickets.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tickets yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {recentTickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  transition: 'background 0.15s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ticket.subject}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {ticket.requester?.name} · {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
