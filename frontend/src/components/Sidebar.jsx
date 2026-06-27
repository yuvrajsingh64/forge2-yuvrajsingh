import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈' },
  { to: '/tickets', label: 'Tickets', icon: '◉' },
  { to: '/tickets/new', label: 'New Ticket', icon: '⊕' },
]

const adminItems = [
  { to: '/users', label: 'Users', icon: '◎' },
  { to: '/sla', label: 'SLA Policies', icon: '◷' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'var(--accent)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 700,
            color: '#fff',
          }}>P</div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            PulseDesk
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 8px 4px' }}>Menu</p>
        {navItems
          .filter(item => !(item.label === 'New Ticket' && user?.role === 'admin'))
          .map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent)' : 'transparent',
                transition: 'all 0.15s',
                textDecoration: 'none',
              })}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

        {(user?.role === 'admin' || user?.role === 'agent') && (
          <>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 8px 4px' }}>Admin</p>
            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                })}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'var(--bg-card)',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef444430' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
