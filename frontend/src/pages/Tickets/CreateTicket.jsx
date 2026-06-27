import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function CreateTicket() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [agents, setAgents] = useState([])
  const [form, setForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    assignee_id: '',
    tags: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role !== 'customer') {
      api.get('/users').then(r => setAgents(r.data.filter(u => u.role === 'agent' || u.role === 'admin'))).catch(() => {})
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        assignee_id: form.assignee_id || null,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      const res = await api.post('/tickets', payload)
      navigate(`/tickets/${res.data.id}`)
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : 'Failed to create ticket.')
    } finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '9px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '680px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>New Ticket</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Describe the issue clearly for faster resolution.</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '20px',
              color: '#ef4444', fontSize: '0.85rem',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '7px' }}>
                Subject <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="ticket-subject"
                type="text"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                required
                placeholder="Brief summary of the issue"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '7px' }}>
                Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="ticket-description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                placeholder="Detailed description of the issue, including steps to reproduce, expected vs actual behaviour…"
                rows={6}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '7px' }}>Priority</label>
                <select
                  id="ticket-priority"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {user?.role !== 'customer' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '7px' }}>Assignee</label>
                  <select
                    id="ticket-assignee"
                    value={form.assignee_id}
                    onChange={e => setForm({ ...form, assignee_id: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Unassigned</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '7px' }}>
                Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma-separated)</span>
              </label>
              <input
                id="ticket-tags"
                type="text"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="billing, api, urgent"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
              <button
                id="create-ticket-submit"
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: loading ? 'var(--text-muted)' : 'var(--accent)',
                  color: '#fff', border: 'none', borderRadius: '9px',
                  fontSize: '0.9rem', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--accent)' }}
              >
                {loading ? 'Creating…' : 'Create Ticket'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                style={{
                  padding: '11px 20px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: '9px', fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
