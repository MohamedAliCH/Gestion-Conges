import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { useSidebar } from '@/context/SidebarContext'
import EmployeSidebar from './EmployeSidebar'
import Topbar from './Topbar'

export default function EmployeLayout() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar()
  const location = useLocation()

  const isFirstLogin = localStorage.getItem('firstLogin') === 'true'
  if (isFirstLogin) {
    return <Navigate to="/change-password" replace />
  }

  return (
    // .theme-employe scopes all navy blue overrides defined in _employe-theme.scss
    <div className="theme-employe">
      {mobileOpen && <div className="overlay show" onClick={closeMobile} />}

      <Topbar />
      <EmployeSidebar />

      <main
        id="content"
        className={`content py-10${collapsed ? ' full' : ''}`}
      >
        <Outlet />
      </main>
    </div>
  )
}
