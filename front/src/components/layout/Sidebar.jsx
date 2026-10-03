import { NavLink } from 'react-router-dom'
import { useSidebar } from '@/context/SidebarContext'
import { logoIcon } from '@/assets/images'

const sections = [
  {
    label: 'GESTION EMPLOYÉS',
    items: [
      { to: '/admin/employes', icon: 'ti-users', label: 'Employés', end: true },
      { to: '/admin/employes/nouveau', icon: 'ti-user-plus', label: 'Nouvel employé' },
      { to: '/admin/conges', icon: 'ti-calendar-check', label: 'Validation congés' },
      { to: '/admin/calendrier', icon: 'ti-calendar-month', label: 'Calendrier absences' },
    ],
  },
  {
    label: 'BASE DOCUMENTAIRE',
    items: [
      { to: '/admin/documents', icon: 'ti-files', label: 'Documents RH' },
    ],
  },
  {
    label: 'CHATBOT RH',
    items: [
      { to: '/admin/chatbot', icon: 'ti-message-chatbot', label: 'Chatbot RH' },
    ],
  },
]

export default function Sidebar() {
  const { collapsed, mobileOpen } = useSidebar()

  const sidebarClass = [
    'sidebar',
    collapsed ? 'collapsed' : '',
    mobileOpen ? 'mobile-show' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside id="sidebar" className={sidebarClass}>
      <div className="logo-area">
        <NavLink to="/admin" className="d-inline-flex align-items-center text-decoration-none">
          <img src={logoIcon} alt="Logo icon" width="24" />
          <span className="logo-text ms-2 fw-bold text-dark fs-5">IntraCongés</span>
        </NavLink>
      </div>

      <ul className="nav flex-column">
        {sections.map(({ label, items }) => (
          <li key={label}>
            <div className="px-4 pt-4 pb-2">
              <small className="nav-text" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', fontWeight: 600 }}>
                {label}
              </small>
            </div>
            <ul className="nav flex-column">
              {items.map(({ to, icon, label: lbl, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  >
                    <i className={`ti ${icon}`} />
                    <span className="nav-text">{lbl}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  )
}
