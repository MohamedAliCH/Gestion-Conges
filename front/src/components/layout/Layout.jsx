import { Outlet } from 'react-router-dom'
import { useSidebar } from '@/context/SidebarContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar()

  return (
    <>
      {mobileOpen && (
        <div className="overlay show" onClick={closeMobile} />
      )}

      <Topbar />
      <Sidebar />

      <main
        id="content"
        className={`content py-10${collapsed ? ' full' : ''}`}
      >
        <Outlet />
      </main>
    </>
  )
}
