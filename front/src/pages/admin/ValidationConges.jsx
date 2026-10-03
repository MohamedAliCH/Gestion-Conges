import { useState } from 'react'
import { useEmploye } from '@/context/EmployeContext'
import Footer from '@/components/layout/Footer'

const STATUT_COLOR = {
  'En attente': 'warning',
  'Approuvé': 'success',
  'Refusé': 'danger',
}

const TYPE_COLOR = {
  'Congé Annuel': 'primary',
  'Congé Maladie': 'danger',
  'Congé Personnel': 'warning',
  'RTT': 'info',
  'Congé Maternité': 'info',
}

export default function ValidationConges() {
  const { conges, approuverConge, refuserConge, loading } = useEmploye()
  const [filtre, setFiltre] = useState('Tous')
  const [refusModal, setRefusModal] = useState(null)
  const [refusMotif, setRefusMotif] = useState('')
  const [motifError, setMotifError] = useState(false)

  const enAttente = conges.filter(c => c.statut === 'En attente').length
  const approuves = conges.filter(c => c.statut === 'Approuvé').length
  const refuses = conges.filter(c => c.statut === 'Refusé').length

  const filtered = filtre === 'Tous' ? conges : conges.filter(c => c.statut === filtre)

  const openRefus = conge => {
    setRefusModal(conge)
    setRefusMotif('')
    setMotifError(false)
  }

  const confirmRefus = () => {
    if (!refusMotif.trim()) { setMotifError(true); return }
    refuserConge(refusModal.id, refusMotif)
    setRefusModal(null)
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Validation des congés</h1>
          <p className="text-secondary mb-0">Consultez et traitez toutes les demandes de congés</p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-auto">
          <div className="card px-4 py-3 border-warning border-opacity-25 bg-warning bg-opacity-10">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-clock fs-5 text-warning" />
              <div>
                <div className="fw-bold fs-5">{loading ? '...' : enAttente}</div>
                <small className="text-secondary">En attente</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <div className="card px-4 py-3 border-success border-opacity-25 bg-success bg-opacity-10">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-circle-check fs-5 text-success" />
              <div>
                <div className="fw-bold fs-5">{loading ? '...' : approuves}</div>
                <small className="text-secondary">Approuvés</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <div className="card px-4 py-3 border-danger border-opacity-25 bg-danger bg-opacity-10">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-circle-x fs-5 text-danger" />
              <div>
                <div className="fw-bold fs-5">{loading ? '...' : refuses}</div>
                <small className="text-secondary">Refusés</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {['Tous', 'En attente', 'Approuvé', 'Refusé'].map(s => (
          <button key={s}
            className={`btn btn-sm ${filtre === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFiltre(s)}>
            {s}
            {s !== 'Tous' && (
              <span className="ms-1 badge bg-white text-dark">
                {loading ? '...' : conges.filter(c => c.statut === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card table-responsive mb-4">
        <table className="table mb-0 table-hover text-nowrap">
          <thead className="table-light">
            <tr>
              <th>Employé</th>
              <th>Type</th>
              <th>Du</th>
              <th>Au</th>
              <th>Jours</th>
              <th>Motif</th>
              <th>Soumis le</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <div className="mt-2 text-secondary">Chargement des demandes de congés...</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="9" className="text-center py-4 text-muted">Aucune demande.</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="align-middle">
                <td className="fw-medium">{c.employeNom}</td>
                <td>
                  <span className={`badge bg-${TYPE_COLOR[c.type] ?? 'secondary'}-subtle text-${TYPE_COLOR[c.type] ?? 'secondary'} border border-${TYPE_COLOR[c.type] ?? 'secondary'}`}>
                    {c.type}
                  </span>
                </td>
                <td>{c.du}</td>
                <td>{c.au}</td>
                <td><span className="fw-medium">{c.jours}j</span></td>
                <td style={{ maxWidth: 200, whiteSpace: 'normal' }}>
                  <small>{c.motif}</small>
                  {c.refusMotif && (
                    <div><small className="text-danger"><i className="ti ti-info-circle me-1" />{c.refusMotif}</small></div>
                  )}
                </td>
                <td><small>{c.soumis}</small></td>
                <td>
                  <span className={`badge bg-${STATUT_COLOR[c.statut]}-subtle text-${STATUT_COLOR[c.statut]}`}>
                    {c.statut}
                  </span>
                </td>
                <td>
                  {c.statut === 'En attente' && (
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-success"
                        title="Approuver"
                        onClick={() => approuverConge(c.id)}
                      >
                        <i className="ti ti-check" />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        title="Refuser"
                        onClick={() => openRefus(c)}
                      >
                        <i className="ti ti-x" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refusal reason modal */}
      {refusModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom">
                <h5 className="modal-title">Motif de refus</h5>
                <button className="btn-close" onClick={() => setRefusModal(null)} />
              </div>
              <div className="modal-body">
                <p className="text-secondary small mb-3">
                  Vous refusez la demande de <strong>{refusModal.employeNom}</strong> —
                  {' '}{refusModal.type} du {refusModal.du} au {refusModal.au}.
                </p>
                <label className="form-label">Motif du refus *</label>
                <textarea
                  className={`form-control${motifError ? ' is-invalid' : ''}`}
                  rows="3"
                  placeholder="Expliquez la raison du refus (ce motif sera visible par l'employé)…"
                  value={refusMotif}
                  onChange={e => { setRefusMotif(e.target.value); setMotifError(false) }}
                />
                {motifError && <div className="invalid-feedback d-block">Le motif est obligatoire.</div>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setRefusModal(null)}>Annuler</button>
                <button className="btn btn-danger" onClick={confirmRefus}>
                  <i className="ti ti-x me-1" />Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
