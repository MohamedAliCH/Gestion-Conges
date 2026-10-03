/**
 * Colored stat card used at the top of the Dashboard.
 * @param {string} label
 * @param {string} value
 * @param {string} change  - e.g. "+5% since last month"
 * @param {'primary'|'success'|'info'|'warning'|'danger'} color
 * @param {string} icon    - Tabler icon class, e.g. "ti-report-analytics"
 */
export default function StatCard({ label, value, change, color, icon }) {
  return (
    <div
      className={`card p-4 bg-${color} bg-opacity-10 border border-${color} border-opacity-25 rounded-2`}
    >
      <div className="d-flex gap-3">
        <div className={`icon-shape icon-md bg-${color} text-white rounded-2`}>
          <i className={`ti ${icon} fs-4`} />
        </div>
        <div>
          <h2 className="mb-3 fs-6">{label}</h2>
          <h3 className="fw-bold mb-0">{value}</h3>
          <p className={`text-${color} mb-0 small`}>{change}</p>
        </div>
      </div>
    </div>
  )
}
