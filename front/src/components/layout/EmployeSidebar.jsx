import { NavLink, useNavigate } from 'react-router-dom'
import { useSidebar } from '@/context/SidebarContext'
import { logoIcon } from '@/assets/images'

const navItems = [
  { to: '/employe', icon: 'ti-calendar-stats', label: 'Mes Congés', end: true },
  { to: '/employe/demande-conge', icon: 'ti-calendar-plus', label: 'Demande de congé', end: false },
  { to: '/employe/fiche-paie', icon: 'ti-file-invoice', label: 'Fiche de Paie', end: false },
  { to: '/employe/profil', icon: 'ti-user', label: 'Profil', end: false },
  { to: '/employe/chatbot', icon: 'ti-message-chatbot', label: 'Chatbot — privé', end: false },
]

const accountItems = [
  { to: '/signin', icon: 'ti-logout', label: 'Déconnexion' },
]

export default function EmployeSidebar() {
  const { collapsed, mobileOpen } = useSidebar()
  const navigate = useNavigate()

  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('firstLogin')
    navigate('/signin')
  }

  const sidebarClass = ['sidebar', collapsed && 'collapsed', mobileOpen && 'mobile-show']
    .filter(Boolean)
    .join(' ')

  return (
    <aside id="sidebar" className={sidebarClass}>
      <div className="logo-area">
        <NavLink to="/employe" className="d-inline-flex align-items-center text-decoration-none">
          <img src={logoIcon} alt="Logo icon" width="24" />
          <span className="logo-text ms-2 fw-bold text-dark fs-5">IntraCongés</span>
        </NavLink>
      </div>

      <ul className="nav flex-column">
        <li className="px-4 py-2">
          <small className="nav-text">Main</small>
        </li>

        {navItems.map(({ to, icon, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <i className={`ti ${icon}`} />
              <span className="nav-text">{label}</span>
            </NavLink>
          </li>
        ))}

        <li className="px-4 pt-4 pb-2">
          <small className="nav-text">Account</small>
        </li>

        {accountItems.map(({ to, icon, label }) => (
          <li key={to}>
            <button
              onClick={handleLogout}
              className="nav-link w-100 text-start border-0 bg-transparent d-flex align-items-center"
              style={{ cursor: 'pointer' }}
            >
              <i className={`ti ${icon} me-2`} />
              <span className="nav-text">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
