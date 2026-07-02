import { useState } from 'react'
import Footer from '@/components/layout/Footer'

const PAY_SLIPS = [
  { id: 1, period: 'Juin 2026', gross: '4 800 €', deductions: '720 €', net: '4 080 €', status: 'En cours', statusColor: 'warning' },
  { id: 2, period: 'Mai 2026', gross: '4 800 €', deductions: '720 €', net: '4 080 €', status: 'Payé', statusColor: 'success' },
  { id: 3, period: 'Avril 2026', gross: '4 800 €', deductions: '680 €', net: '4 120 €', status: 'Payé', statusColor: 'success' },
  { id: 4, period: 'Mars 2026', gross: '4 800 €', deductions: '680 €', net: '4 120 €', status: 'Payé', statusColor: 'success' },
  { id: 5, period: 'Février 2026', gross: '4 500 €', deductions: '675 €', net: '3 825 €', status: 'Payé', statusColor: 'success' },
]

const summaryCards = [
  { label: 'Salaire Brut', value: '4 800 €', sub: 'Mois en cours', color: 'primary', icon: 'ti-cash' },
  { label: 'Déductions Totales', value: '720 €', sub: 'Impôts + Assurance', color: 'danger', icon: 'ti-minus' },
  { label: 'Salaire Net', value: '4 080 €', sub: 'Montant versé', color: 'success', icon: 'ti-wallet' },
]

export default function EmployeFichePaie() {
  const [selected, setSelected] = useState(PAY_SLIPS[0].id)
  const slip = PAY_SLIPS.find(s => s.id === selected)

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Fiche de Paie</h1>
          <p className="text-secondary mb-0">Consultez vos détails de salaire et fiches de paie</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        {summaryCards.map(c => (
          <div key={c.label} className="col-12 col-sm-4">
            <div className={`card p-4 bg-${c.color} bg-opacity-10 border border-${c.color} border-opacity-25`}>
              <div className="d-flex gap-3">
                <div className={`icon-shape icon-md bg-${c.color} text-white rounded-2`}>
                  <i className={`ti ${c.icon} fs-4`} />
                </div>
                <div>
                  <h6 className="mb-2">{c.label}</h6>
                  <h3 className="fw-bold mb-0">{c.value}</h3>
                  <p className={`text-${c.color} mb-0 small`}>{c.sub}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Pay slip detail */}
        <div className="col-12 col-lg-5">
          <div className="card h-100">
            <div className="card-header bg-white px-4 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Détail de la Fiche de Paie</h5>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={selected}
                onChange={e => setSelected(Number(e.target.value))}
              >
                {PAY_SLIPS.map(s => (
                  <option key={s.id} value={s.id}>{s.period}</option>
                ))}
              </select>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <span className="text-secondary">Période de paie</span>
                <span className="fw-medium">{slip.period}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <span className="text-secondary">Salaire Brut</span>
                <span className="fw-medium">{slip.gross}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <span className="text-secondary">Déductions</span>
                <span className="fw-medium text-danger">{slip.deductions}</span>
              </div>
              <div className="d-flex justify-content-between pb-3 mb-4">
                <span className="fw-semibold">Net Payé</span>
                <span className="fw-bold text-primary fs-5">{slip.net}</span>
              </div>
              <button className="btn btn-outline-primary w-100">
                <i className="ti ti-download me-2" />
                Télécharger le PDF
              </button>
            </div>
          </div>
        </div>

        {/* History table */}
        <div className="col-12 col-lg-7">
          <div className="card">
            <div className="card-header bg-white px-4 py-3">
              <h5 className="mb-0">Historique des Fiches de Paie</h5>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 table-hover text-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>Période</th>
                    <th>Brut</th>
                    <th>Déductions</th>
                    <th>Net Payé</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {PAY_SLIPS.map(s => (
                    <tr
                      key={s.id}
                      className={`align-middle${selected === s.id ? ' table-active' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelected(s.id)}
                    >
                      <td className="fw-medium">{s.period}</td>
                      <td>{s.gross}</td>
                      <td>{s.deductions}</td>
                      <td className="fw-semibold">{s.net}</td>
                      <td>
                        <span className={`badge bg-${s.statusColor}-subtle text-${s.statusColor}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
