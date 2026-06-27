import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../api/axios'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch {} finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)
    try {
      await api.post('/users', form)
      setSuccess('User created successfully.')
      setForm({ name: '', email: '', password: '', role: 'agent' })
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      const errors = err.response?.data?.errors
      setError(errors ? Object.values(errors).flat().join(' ') : 'Failed to create user.')
    } finally { setCreating(false) }
  }

  const roleColors = { admin: '#6366f1', agent: '#3b82f6', customer: '#10b981' }

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'var(--bg-primary)', border: '1px solid var(--border)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Team Members</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{users.length} members in your organization</p>
        </div>
        <button
          id="add-user-btn"
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 18px', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: '9px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Add Member
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
          <p style={{ fontWeight: 600, marginBottom: '16px' }}>Create New Member</p>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px', marginBottom: '14px', color: '#ef4444', fontSize: '0.82rem' }}>{error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '10px', marginBottom: '14px', color: '#10b981', fontSize: '0.82rem' }}>{success}</div>}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Name</label>
              <input id="user-name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} placeholder="Full name"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Email</label>
              <input id="user-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} placeholder="user@company.com"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Password</label>
              <input id="user-password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={inputStyle} placeholder="Min 8 characters"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Role</label>
              <select id="user-role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
              <button id="create-user-submit" type="submit" disabled={creating} style={{ padding: '9px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                {creating ? 'Creating…' : 'Create Member'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 100px 140px', padding: '10px 20px', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>Name</span><span>Email</span><span>Role</span><span>Joined</span>
        </div>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</div>
        ) : users.map(u => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 100px 140px', padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `${roleColors[u.role]}20`, border: `1px solid ${roleColors[u.role]}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: roleColors[u.role] }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</span>
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.email}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: roleColors[u.role], textTransform: 'capitalize', background: `${roleColors[u.role]}15`, padding: '3px 10px', borderRadius: '12px', display: 'inline-block' }}>{u.role}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
