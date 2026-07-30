import { NavLink, useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import './SidebarNav.css'

const navItems = [
  { label: 'Dashboard',    path: '/dashboard' },
  { label: 'History',      path: '/history'   },
  { label: 'Profile',      path: '/profile'   },
]

export default function SidebarNav() {
  const navigate = useNavigate()
  const { clearCurrentSession } = useSession()

  const handleNewSession = () => {
    clearCurrentSession()
    navigate('/mode')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="label-caps sidebar-brand-label">Executive Laboratory</span>
        <span className="sidebar-brand-name font-serif">PitchIt</span>
      </div>

      <hr className="divider" />

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link label-caps${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <hr className="divider" />
        <button className="sidebar-cta label-caps" onClick={handleNewSession}>
          + New Session
        </button>
        <span className="sidebar-version label-caps">v1.0</span>
      </div>
    </aside>
  )
}
