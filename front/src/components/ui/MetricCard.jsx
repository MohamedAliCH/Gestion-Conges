/**
 * Simple metric card with a big value and a trend indicator.
 * Used in Dashboard (middle row) and Reports.
 * @param {string} label
 * @param {string} value
 * @param {string} change       - e.g. "+35%"
 * @param {'success'|'danger'|'warning'} changeType
 * @param {string} [icon]       - Tabler icon class (Dashboard use only)
 * @param {string} [iconColor]  - Bootstrap text-color class, e.g. "text-primary"
 */
export default function MetricCard({ label, value, change, changeType, icon, iconColor }) {
  const arrow = changeType === 'success' ? 'ti-arrow-up' : 'ti-arrow-down'

  return (
    <div className="card h-100">
      <div className="card-body p-4">
        {icon ? (
          <>
            <div className="d-flex justify-content-between border-bottom pb-5 mb-3">
              <div>
                <h3 className="fw-bold h4">{value}</h3>
                <span>{label}</span>
              </div>
              <div>
                <i className={`ti ${icon} fs-1 ${iconColor}`} />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center small">
              <div className="text-muted">
                <span className={`text-${changeType}`}>{change}</span> vs Last Month
              </div>
              <div>
                <a href="#" className="link-primary text-decoration-underline">View</a>
              </div>
            </div>
          </>
        ) : (
          <>
            <h6 className="mb-4">{label}</h6>
            <h3 className="mb-1 fw-bold">{value}</h3>
            <p className={`mb-0 text-${changeType} small`}>
              <i className={`ti ${arrow}`} /> {change}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
