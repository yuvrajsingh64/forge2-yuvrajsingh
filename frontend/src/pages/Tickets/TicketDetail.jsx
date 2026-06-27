import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function TicketDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentBody, setCommentBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [posting, setPosting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAll()
    if (user?.role !== 'customer') {
      api.get('/users').then(r => setAgents(r.data.filter(u => u.role === 'agent' || u.role === 'admin'))).catch(() => {})
    }
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [t, c] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`),
      ])
      setTicket(t.data)
      setEditForm({ status: t.data.status, priority: t.data.priority, assignee_id: t.data.assignee_id || '' })
      setComments(c.data)
    } catch (e) {
      if (e.response?.status === 403) navigate('/tickets')
    } finally { setLoading(false) }
  }

  const postComment = async (e) => {
    e.preventDefault()
    if (!commentBody.trim()) return
    setPosting(true)
    try {
      const res = await api.post(`/tickets/${id}/comments`, { body: commentBody, is_internal: isInternal })
      setComments(c => [...c, res.data])
      setCommentBody('')
    } catch {} finally { setPosting(false) }
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const payload = { ...editForm }
      if (!payload.assignee_id) payload.assignee_id = null
      const res = await api.put(`/tickets/${id}`, payload)
      setTicket(res.data)
      setEditing(false)
    } catch {} finally { setSaving(false) }
  }

  const deleteTicket = async () => {
    if (!window.confirm('Delete this ticket?')) return
    await api.delete(`/tickets/${id}`)
    navigate('/tickets')
  }

  const selectStyle = {
    padding: '7px 10px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '7px',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    outline: 'none',
    width: '100%',
  }

  const sla = ticket?.sla_status

  if (loading) return <DashboardLayout><div style={{ padding: '40px', color: 'var(--text-muted)', textAlign: 'center' }}>Loading…</div></DashboardLayout>
  if (!ticket) return <DashboardLayout><div style={{ padding: '40px', color: 'var(--text-muted)', textAlign: 'center' }}>Ticket not found.</div></DashboardLayout>

  const isStaff = user?.role === 'admin' || user?.role === 'agent'

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/tickets" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>← All Tickets</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>TICKET #{ticket.id}</p>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{ticket.subject}</h1>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '10px', marginBottom: '20px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
            </div>

            {ticket.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {ticket.tags.map(tag => (
                  <span key={tag.id} style={{
                    fontSize: '0.72rem', padding: '3px 10px', borderRadius: '12px',
                    background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                  }}>{tag.name}</span>
                ))}
              </div>
            )}

            {sla?.has_sla && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: sla.resolution_breached ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.07)',
                border: `1px solid ${sla.resolution_breached ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.2)'}`,
                display: 'flex',
                gap: '16px',
                fontSize: '0.8rem',
              }}>
                <span style={{ color: sla.resolution_breached ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                  {sla.resolution_breached ? '⚠ SLA Breached' : '✓ SLA Active'}
                </span>
                {!sla.resolution_breached && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    {sla.minutes_until_resolution}m until resolution deadline
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>
              Conversation <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>({comments.length})</span>
            </p>

            {comments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>No replies yet. Be the first.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {comments.map(c => (
                  <div
                    key={c.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: c.is_internal ? 'rgba(245,158,11,0.06)' : 'var(--bg-primary)',
                      border: c.is_internal ? '1px solid rgba(245,158,11,0.2)' : '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: 'var(--accent-glow)', border: '1px solid var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)',
                        }}>
                          {c.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.user?.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{c.user?.role}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {c.is_internal && (
                          <span style={{ fontSize: '0.68rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>
                            Internal Note
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.body}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={postComment}>
              <textarea
                id="comment-body"
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                placeholder={isInternal ? 'Internal note (agents only)…' : 'Reply to customer…'}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  border: `1px solid ${isInternal ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: '10px',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                }}
                onFocus={e => e.target.style.borderColor = isInternal ? '#f59e0b' : 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = isInternal ? 'rgba(245,158,11,0.3)' : 'var(--border)'}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isStaff && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      id="is-internal"
                      checked={isInternal}
                      onChange={e => setIsInternal(e.target.checked)}
                      style={{ accentColor: '#f59e0b', width: '14px', height: '14px' }}
                    />
                    Internal note
                  </label>
                )}
                <div />
                <button
                  id="post-comment"
                  type="submit"
                  disabled={posting || !commentBody.trim()}
                  style={{
                    padding: '9px 20px',
                    background: posting ? 'var(--text-muted)' : 'var(--accent)',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    fontSize: '0.85rem', fontWeight: 600,
                    cursor: posting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {posting ? 'Posting…' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>

          {ticket.activity_logs?.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>Activity Log</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ticket.activity_logs.map(log => (
                  <div key={log.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.78rem', color: 'var(--text-muted)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ minWidth: '110px' }}>{new Date(log.created_at).toLocaleString()}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{log.user?.name || 'System'}</span>
                    <span style={{ color: 'var(--accent)' }}>{log.action.replace(/_/g, ' ')}</span>
                    {log.metadata?.from && <span>: {log.metadata.from} → {log.metadata.to}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>Details</p>
              {isStaff && !editing && (
                <button
                  id="edit-ticket-btn"
                  onClick={() => setEditing(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={selectStyle}>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Priority</label>
                  <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} style={selectStyle}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Assignee</label>
                  <select value={editForm.assignee_id} onChange={e => setEditForm({ ...editForm, assignee_id: e.target.value })} style={selectStyle}>
                    <option value="">Unassigned</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={saveEdit} disabled={saving} style={{ flex: 1, padding: '8px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '8px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '0.82rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Status', val: <StatusBadge status={ticket.status} /> },
                  { label: 'Priority', val: <PriorityBadge priority={ticket.priority} /> },
                  { label: 'Requester', val: ticket.requester?.name },
                  { label: 'Assignee', val: ticket.assignee?.name || 'Unassigned' },
                  { label: 'Created', val: new Date(ticket.created_at).toLocaleDateString() },
                  { label: 'Updated', val: new Date(ticket.updated_at).toLocaleDateString() },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user?.role === 'admin' && (
            <button
              id="delete-ticket-btn"
              onClick={deleteTicket}
              style={{
                padding: '10px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px',
                color: '#ef4444',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            >
              Delete Ticket
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
