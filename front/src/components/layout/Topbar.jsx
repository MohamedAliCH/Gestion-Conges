import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSidebar } from '@/context/SidebarContext'
import { notifications, currentUser } from '@/data/mockData'

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

export default function Topbar() {
  const { collapsed, toggle, openMobile } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const profilePath = location.pathname.startsWith('/admin') ? '/admin/profil' : '/employee/profil'

  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [readIds, setReadIds] = useState([])

  const notifRef = useRef()
  const userRef = useRef()
  useClickOutside(notifRef, () => setNotifOpen(false))
  useClickOutside(userRef, () => setUserOpen(false))

  const unread = notifications.filter(n => !readIds.includes(n.id)).length
  const markAllRead = () => setReadIds(notifications.map(n => n.id))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    setUserOpen(false)
    navigate('/signin')
  }

  return (
    <nav
      id="topbar"
      className={`navbar bg-white border-bottom fixed-top topbar px-3${collapsed ? ' full' : ''}`}
    >
      {/* Desktop sidebar toggle */}
      <button
        className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm"
        onClick={toggle}
        aria-label="Toggle sidebar"
      >
        <i className="ti ti-layout-sidebar-left-expand" />
      </button>

      {/* Mobile sidebar toggle */}
      <button
        className="btn btn-light btn-icon btn-sm d-lg-none me-2"
        onClick={openMobile}
        aria-label="Open sidebar"
      >
        <i className="ti ti-layout-sidebar-left-expand" />
      </button>

      <ul className="list-unstyled d-flex align-items-center mb-0 gap-1 ms-auto">

        {/* Notification bell */}
        <li className="position-relative" ref={notifRef}>
          <button
            className="btn btn-light btn-icon btn-sm rounded-circle position-relative"
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false) }}
          >
            <i className="ti ti-bell fs-5" />
            {unread > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.6rem', marginTop: 4, marginLeft: -8 }}>
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="dropdown-menu show dropdown-menu-end p-0"
              style={{ minWidth: 320, right: 0, left: 'auto', top: '110%' }}>
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                <strong className="small">Notifications</strong>
                {unread > 0 && (
                  <button className="btn btn-link btn-sm p-0 text-primary small" onClick={markAllRead}>
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              <ul className="list-unstyled p-0 m-0">
                {notifications.map(n => (
                  <li key={n.id}
                    className={`p-3 border-bottom ${!readIds.includes(n.id) ? 'bg-primary bg-opacity-10' : ''}`}
                    style={{ cursor: 'default' }}>
                    <div className="d-flex gap-3">
                      <img src={n.avatar} alt="" className="avatar avatar-sm rounded-circle" />
                      <div className="flex-grow-1 small">
                        <p className="mb-0 fw-medium">{n.title}</p>
                        <p className="mb-1 text-secondary">{n.message}</p>
                        <div className="text-secondary" style={{ fontSize: '0.72rem' }}>{n.time}</div>
                      </div>
                      {!readIds.includes(n.id) && (
                        <span className="bg-primary rounded-circle flex-shrink-0"
                          style={{ width: 8, height: 8, marginTop: 4 }} />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {unread === 0 && (
                <p className="text-center text-secondary small py-3 mb-0">Tout est à jour !</p>
              )}
            </div>
          )}
        </li>

        {/* User menu */}
        <li className="ms-2 position-relative" ref={userRef}>
          <button
            className="btn p-0 border-0 bg-transparent"
            onClick={() => { setUserOpen(o => !o); setNotifOpen(false) }}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="avatar avatar-sm rounded-circle"
              style={{ cursor: 'pointer' }}
            />
          </button>

          {userOpen && (
            <div className="dropdown-menu show dropdown-menu-end p-0"
              style={{ minWidth: 210, right: 0, left: 'auto', top: '110%' }}>
              <div className="d-flex gap-3 align-items-center border-bottom px-3 py-3">
                <img src={currentUser.avatar} alt={currentUser.name}
                  className="avatar avatar-md rounded-circle" />
                <div>
                  <div className="fw-medium small">{currentUser.name}</div>
                  <div className="text-secondary small">{currentUser.username}</div>
                </div>
              </div>
              <div className="p-2 d-flex flex-column gap-1">
                <button
                  className="btn btn-light text-start w-100 d-flex align-items-center gap-2 small"
                  onClick={() => { setUserOpen(false); navigate(profilePath) }}
                >
                  <i className="ti ti-user-circle fs-5" />Mon profil
                </button>
                <button
                  className="btn btn-light text-start w-100 d-flex align-items-center gap-2 small"
                  onClick={() => { setUserOpen(false); navigate(profilePath + '?tab=password') }}
                >
                  <i className="ti ti-lock fs-5" />Changer le mot de passe
                </button>
                <hr className="my-1" />
                <button
                  className="btn btn-light text-start w-100 d-flex align-items-center gap-2 small text-danger"
                  onClick={handleLogout}
                >
                  <i className="ti ti-logout fs-5" />Se déconnecter
                </button>
              </div>
            </div>
          )}
        </li>
      </ul>
    </nav>
  )
}
