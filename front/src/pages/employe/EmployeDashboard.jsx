import { useState, useEffect } from 'react'
import Footer from '@/components/layout/Footer'
import api from '@/services/api'
import { useToast } from '@/context/ToastContext'

export default function EmployeDashboard() {
  const [history, setHistory] = useState([])
  const [soldes, setSoldes] = useState({ soldeAnnuel: 0, soldeMaladie: 8 })
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    Promise.all([fetchLeaves(), fetchSoldes()])
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/api/employe/conges')
      setHistory(response.data)
    } catch (error) {
      console.error('Error fetching leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSoldes = async () => {
    try {
      const response = await api.get('/api/employe/profil')
      setSoldes({ soldeAnnuel: response.data.soldeAnnuel, soldeMaladie: response.data.soldeMaladie })
    } catch (error) {
      console.error('Error fetching soldes:', error)
    }
  }

  const getUsedDays = (type) => {
    return history
      .filter(h => h.type === type && h.status === 'Approuvé')
      .reduce((sum, h) => sum + h.days, 0)
  }

  const getPendingDays = () => {
    return history
      .filter(h => h.status === 'En attente')
      .reduce((sum, h) => sum + h.days, 0)
  }

  const usedAnnuel = getUsedDays('Congé Annuel')
  const usedMaladie = getUsedDays('Congé Maladie')
  const totalAcquisAnnuel = soldes.soldeAnnuel + usedAnnuel
  const totalAcquisMaladie = soldes.soldeMaladie + usedMaladie
  const enCoursValidation = getPendingDays()

  const soldeGlobal = soldes.soldeAnnuel + soldes.soldeMaladie
  const totalGlobal = totalAcquisAnnuel + totalAcquisMaladie
  const progressPercentageGlobal = totalGlobal > 0 ? ((usedAnnuel + usedMaladie) / totalGlobal) * 100 : 0

  const dynamicBalances = [
    { label: 'Congé Annuel', used: usedAnnuel, total: totalAcquisAnnuel, remaining: soldes.soldeAnnuel, color: 'primary' },
    { label: 'Congé Maladie', used: usedMaladie, total: totalAcquisMaladie, remaining: soldes.soldeMaladie, color: 'info' },
    { label: 'Congé Sans Solde', used: getUsedDays('Congé Sans Solde'), total: null, remaining: null, color: 'warning' },
  ]


  const handleCancel = async (id) => {
    if (window.confirm('Voulez-vous vraiment annuler cette demande de congé ?')) {
      try {
        await api.delete(`/api/employe/conges/${id}`)
        toast.success("Demande de congé annulée avec succès !");
        await Promise.all([fetchLeaves(), fetchSoldes()])
      } catch (error) {
        console.error('Error cancelling leave:', error)
        toast.error("Erreur lors de l'annulation de la demande.");
      }
    }
  }

  const progressPercentage = progressPercentageGlobal

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Gestion des Congés</h1>
          <p className="text-secondary mb-0">Suivez votre solde et l'historique de vos demandes</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Progress Ring Card */}
        <div className="col-12 col-md-4">
          <div className="card h-100 text-center p-4 d-flex flex-column justify-content-center align-items-center shadow-sm border-0">
            <h6 className="mb-4 text-muted">Solde Global</h6>
            <div className="position-relative d-inline-block" style={{ width: 150, height: 150 }}>
              <svg viewBox="0 0 36 36" className="w-100 h-100">
                <path
                  className="text-light"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-primary"
                  strokeDasharray={`${loading ? 0 : progressPercentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  style={{ animation: 'progress 1s ease-out forwards' }}
                />
              </svg>
              <div className="position-absolute top-50 start-50 translate-middle text-center">
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                ) : (
                  <>
                    <h3 className="mb-0 fw-bold">{soldeGlobal}</h3>
                    <small className="text-secondary">Jours<br/>Restants</small>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 d-flex justify-content-between w-100 px-3 text-start small">
              <div><span className="text-muted">Acquis:</span> <strong>{loading ? '...' : totalGlobal}</strong></div>
              <div><span className="text-muted">Utilisés:</span> <strong>{loading ? '...' : (usedAnnuel + usedMaladie)}</strong></div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Cards */}
        <div className="col-12 col-md-8">
          <div className="row g-3">
            {dynamicBalances.map(b => (
              <div key={b.label} className="col-12 col-sm-6">
                <div className={`card p-4 h-100 bg-${b.color} bg-opacity-10 border border-${b.color} border-opacity-25 shadow-sm`}>
                  <h6 className="mb-3">{b.label}</h6>
                  <div className="d-flex justify-content-between align-items-end mb-2">
                    {loading ? (
                      <h3 className="fw-bold mb-0 text-muted">...</h3>
                    ) : b.remaining !== null ? (
                      <h3 className="fw-bold mb-0">{b.remaining} jours</h3>
                    ) : (
                      <h3 className="fw-bold mb-0">{b.used} jours utilisés</h3>
                    )}
                    {!loading && b.total !== null && (
                      <small className={`text-${b.color}`}>{b.used}/{b.total} utilisés</small>
                    )}
                  </div>
                  {!loading && b.total !== null && (
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className={`progress-bar bg-${b.color}`}
                        style={{ width: b.total > 0 ? `${(b.used / b.total) * 100}%` : '0%' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="col-12 col-sm-6">
              <div className="card p-4 h-100 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 shadow-sm">
                <h6 className="mb-3">En cours de validation</h6>
                <div className="d-flex justify-content-between align-items-end mb-2">
                  <h3 className="fw-bold mb-0 text-secondary">{loading ? '...' : `${enCoursValidation} jour(s)`}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* History table */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white px-4 py-3 border-bottom-0">
              <h5 className="mb-0 text-primary">Historique des demandes</h5>
            </div>
            <div className="table-responsive">
              <table className="table mb-0 table-hover text-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>Du</th>
                    <th>Au</th>
                    <th>Jours</th>
                    <th>Statut</th>
                    <th>Motif de refus</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                        <div className="mt-2 text-secondary">Chargement de l'historique des congés...</div>
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-secondary">
                        Aucune demande trouvée.
                      </td>
                    </tr>
                  ) : (
                    history.map(h => (
                      <tr key={h.id} className="align-middle">
                        <td>{h.type}</td>
                        <td>{h.from}</td>
                        <td>{h.to}</td>
                        <td>{h.days}</td>
                        <td>
                          <span className={`badge bg-${h.statusColor}-subtle text-${h.statusColor}`}>
                            {h.status}
                          </span>
                        </td>
                        <td>
                          {h.status === 'Refusé' && h.refusMotif ? (
                            <span className="text-danger small d-flex align-items-center gap-1">
                              <i className="ti ti-alert-circle" />
                              {h.refusMotif}
                            </span>
                          ) : (
                            <span className="text-secondary small">—</span>
                          )}
                        </td>
                        <td className="text-end">
                          {h.status === 'En attente' && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(h.id)}>
                              Annuler
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
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
