import { useNavigate } from 'react-router-dom'
import { logoIcon } from '@/assets/images'

export default function RoleSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light px-3">
      {/* Logo */}
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center gap-2 mb-3">
          <img src={logoIcon} alt="" width="36" />
          <span className="fw-bold text-dark fs-4">IntraCongés</span>
        </div>
        <h1 className="h4 fw-semibold mb-1">Welcome to IntraCongés</h1>
        <p className="text-secondary mb-0">Select your portal to continue</p>
      </div>

      {/* Role cards */}
      <div className="row g-4 justify-content-center w-100" style={{ maxWidth: 680 }}>
        {/* Admin card — orange accent */}
        <div className="col-12 col-sm-6">
          <button
            className="card border-0 shadow-sm w-100 text-start p-0"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin')}
          >
            <div
              className="card-body p-4 rounded-3"
              style={{ borderLeft: '4px solid #E66239' }}
            >
              <div
                className="icon-shape icon-md rounded-2 mb-3"
                style={{ background: 'rgba(230,98,57,0.12)', color: '#E66239' }}
              >
                <i className="ti ti-shield-check fs-4" />
              </div>
              <h2 className="h5 fw-semibold mb-1">Admin Dashboard</h2>
              <p className="text-secondary small mb-3">
                Manage HR, leaves, payroll and system settings.
              </p>
              <span className="btn btn-sm btn-primary">Enter as Admin →</span>
            </div>
          </button>
        </div>

        {/* Employee card — navy accent */}
        <div className="col-12 col-sm-6 theme-employee">
          <button
            className="card border-0 shadow-sm w-100 text-start p-0"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/employee')}
          >
            <div
              className="card-body p-4 rounded-3"
              style={{ borderLeft: '4px solid #1B3A6B' }}
            >
              <div
                className="icon-shape icon-md rounded-2 mb-3"
                style={{ background: 'rgba(27,58,107,0.12)', color: '#1B3A6B' }}
              >
                <i className="ti ti-user-circle fs-4" />
              </div>
              <h2 className="h5 fw-semibold mb-1">Employee Dashboard</h2>
              <p className="text-secondary small mb-3">
                View your tasks, leave balance, payroll and schedule.
              </p>
              <span className="btn btn-sm btn-primary">Enter as Employee →</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
