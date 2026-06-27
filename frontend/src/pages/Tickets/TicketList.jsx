import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const btnBase = {
  padding: '6px 14px',
  borderRadius: '7px',
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-secondary)',
  fontSize: '0.8rem',
  cursor: 'pointer',
  transition: 'all 0.15s',
}

export default function TicketList() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1 })
  const [agents, setAgents] = useState([])

  useEffect(() => {
    if (user?.role !== 'customer') {
      api.get('/users').then(r => setAgents(r.data.filter(u => u.role === 'agent' || u.role === 'admin'))).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    fetchTickets()
  }, [filters])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.search) params.search = filters.search
      params.page = filters.page
      const res = await api.get('/tickets', { params })
      setTickets(res.data.data || [])
      setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total })
    } catch {} finally { setLoading(false) }
  }

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }))

  const selectStyle = {
    padding: '8px 12px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    cursor: 'pointer',
    outline: 'none',
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Tickets</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {meta.total ?? 0} total tickets
          </p>
        </div>
        <Link
          to="/tickets/new"
          id="new-ticket-btn"
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: '9px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          + New Ticket
        </Link>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          id="ticket-search"
          type="text"
          placeholder="Search tickets…"
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 14px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <select id="filter-status" value={filters.status} onChange={e => setFilter('status', e.target.value)} style={selectStyle}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select id="filter-priority" value={filters.priority} onChange={e => setFilter('priority', e.target.value)} style={selectStyle}>
          <option value="">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {(filters.status || filters.priority || filters.search) && (
          <button onClick={() => setFilters({ status: '', priority: '', search: '', page: 1 })} style={{ ...btnBase, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
            Clear
          </button>
        )}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>No tickets found.</p>
            <Link to="/tickets/new" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>Create the first one →</Link>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 90px 140px 110px',
              padding: '10px 20px',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              <span>Subject</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Assignee</span>
              <span>Created</span>
            </div>

            {tickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 90px 140px 110px',
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                  textDecoration: 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    #{ticket.id} {ticket.subject}
                  </p>
                  {ticket.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {ticket.tags.slice(0, 3).map(tag => (
                        <span key={tag.id} style={{
                          fontSize: '0.65rem', padding: '1px 7px', borderRadius: '10px',
                          background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                        }}>{tag.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <span style={{ fontSize: '0.82rem', color: ticket.assignee ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  {ticket.assignee?.name || 'Unassigned'}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </>
        )}
      </div>

      {meta.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            disabled={filters.page <= 1}
            style={{ ...btnBase, opacity: filters.page <= 1 ? 0.4 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ padding: '6px 14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {filters.page} / {meta.last_page}
          </span>
          <button
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            disabled={filters.page >= meta.last_page}
            style={{ ...btnBase, opacity: filters.page >= meta.last_page ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}
