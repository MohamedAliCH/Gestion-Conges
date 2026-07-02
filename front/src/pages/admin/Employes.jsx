import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEmploye } from '@/context/EmployeContext'
import Footer from '@/components/layout/Footer'

export default function Employes() {
  const { employes, desactiverEmploye, loading } = useEmploye()
  const [search, setSearch] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('Tous')
  const [filtreDept, setFiltreDept] = useState('Tous')
  const [filtrePoste, setFiltrePoste] = useState('Tous')
  const [confirmId, setConfirmId] = useState(null)
  const [detailEmp, setDetailEmp] = useState(null)
  const [deactivateError, setDeactivateError] = useState('')

  const departements = ['Tous', ...new Set(employes.map(e => e.departement).filter(Boolean))]
  const postes = ['Tous', ...new Set(employes.map(e => e.poste).filter(Boolean))]

  const filtered = useMemo(() =>
    employes.filter(e => {
      const matchSearch = `${e.prenom} ${e.nom} ${e.email}`.toLowerCase().includes(search.toLowerCase())
      const matchStatut = filtreStatut === 'Tous' || e.statut === filtreStatut
      const matchDept = filtreDept === 'Tous' || e.departement === filtreDept
      const matchPoste = filtrePoste === 'Tous' || e.poste === filtrePoste
      return matchSearch && matchStatut && matchDept && matchPoste
    }),
    [employes, search, filtreStatut, filtreDept, filtrePoste]
  )

  const actifs = employes.filter(e => e.statut === 'Actif').length
  const inactifs = employes.filter(e => e.statut === 'Inactif').length

  const handleDeactivateConfirm = async () => {
    setDeactivateError('')
    try {
      await desactiverEmploye(confirmId)
      setConfirmId(null)
    } catch {
      setDeactivateError('Erreur lors de la désactivation. Veuillez réessayer.')
    }
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="fs-3 mb-1">Gestion des employés</h1>
            <p className="text-secondary mb-0">Créez, modifiez ou désactivez les comptes employés</p>
          </div>
          <Link to="/admin/employes/nouveau" className="btn btn-primary">
            <i className="ti ti-user-plus me-2" />Ajouter un employé
          </Link>
        </div>
      </div>

      {/* Summary chips */}
      <div className="row g-3 mb-4">
        <div className="col-auto">
          <div className="card px-4 py-3 border-primary border-opacity-25 bg-primary bg-opacity-10">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-users fs-5 text-primary" />
              <div>
                <div className="fw-bold">{loading ? '...' : employes.length}</div>
                <small className="text-secondary">Total</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <div className="card px-4 py-3 border-success border-opacity-25 bg-success bg-opacity-10">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-user-check fs-5 text-success" />
              <div>
                <div className="fw-bold">{loading ? '...' : actifs}</div>
                <small className="text-secondary">Actifs</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <div className="card px-4 py-3 border-secondary border-opacity-25 bg-secondary bg-opacity-10">
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-user-off fs-5 text-secondary" />
              <div>
                <div className="fw-bold">{loading ? '...' : inactifs}</div>
                <small className="text-secondary">Inactifs</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3 flex-wrap justify-content-between">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher un employé…"
          style={{ maxWidth: 260 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="d-flex gap-2 flex-wrap">
          <select className="form-select form-select-sm" style={{ width: 'auto' }}
            value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
            <option>Tous</option>
            <option>Actif</option>
            <option>Inactif</option>
          </select>
          <select className="form-select form-select-sm" style={{ width: 'auto' }}
            value={filtreDept} onChange={e => setFiltreDept(e.target.value)}>
            {departements.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="form-select form-select-sm" style={{ width: 'auto' }}
            value={filtrePoste} onChange={e => setFiltrePoste(e.target.value)}>
            {postes.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card table-responsive mb-4">
        <table className="table mb-0 table-hover text-nowrap">
          <thead className="table-light">
            <tr>
              <th>Nom</th>
              <th>Département</th>
              <th>Poste</th>
              <th>Statut</th>
              <th>Mot de passe temp.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <div className="mt-2 text-secondary">Chargement des employés...</div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">Aucun employé trouvé.</td></tr>
            ) : filtered.map(emp => (
              /* Employé inactif affiché en grisé */
              <tr key={emp.id} className={`align-middle ${emp.statut === 'Inactif' ? 'opacity-50' : ''}`}>
                <td>
                  <div>
                    <div className="fw-medium">{emp.prenom} {emp.nom}</div>
                    <small className="text-secondary">{emp.email}</small>
                  </div>
                </td>
                <td>{emp.departement || <span className="text-muted">—</span>}</td>
                <td>{emp.poste || <span className="text-muted">—</span>}</td>
                <td>
                  <span className={`badge ${emp.statut === 'Actif'
                    ? 'bg-success-subtle text-success'
                    : 'bg-secondary-subtle text-secondary'}`}>
                    {emp.statut}
                  </span>
                </td>
                <td>
                  {emp.generatedPassword ? (
                    <code className="text-danger fw-bold">{emp.generatedPassword}</code>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  {/* Voir fiche */}
                  <button
                    className="btn btn-sm btn-outline-info me-1"
                    title="Voir fiche"
                    onClick={() => setDetailEmp(emp)}
                  >
                    <i className="ti ti-eye" />
                  </button>
                  {/* Modifier */}
                  <Link
                    to={`/admin/employes/${emp.id}/modifier`}
                    className="btn btn-sm btn-outline-secondary me-1"
                    title="Modifier"
                  >
                    <i className="ti ti-edit" />
                  </Link>
                  {/* Désactiver — seulement si actif */}
                  {emp.statut === 'Actif' && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Désactiver"
                      onClick={() => { setConfirmId(emp.id); setDeactivateError('') }}
                    >
                      <i className="ti ti-user-off" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal confirmation désactivation */}
      {confirmId && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmer la désactivation</h5>
                <button className="btn-close" onClick={() => setConfirmId(null)} />
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir désactiver cet employé ?</p>
                <p className="text-muted small mb-0">Il ne pourra plus accéder à l'application. Cette action ne supprime pas le compte.</p>
                {deactivateError && <div className="alert alert-danger mt-2 mb-0">{deactivateError}</div>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>Annuler</button>
                <button className="btn btn-danger" onClick={handleDeactivateConfirm}>
                  Désactiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal fiche détaillée */}
      {detailEmp && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Fiche employé</h5>
                <button className="btn-close" onClick={() => setDetailEmp(null)} />
              </div>
              <div className="modal-body">
                <dl className="row mb-0">
                  <dt className="col-5">Nom complet</dt>
                  <dd className="col-7">{detailEmp.prenom} {detailEmp.nom}</dd>

                  <dt className="col-5">Email</dt>
                  <dd className="col-7">{detailEmp.email}</dd>

                  <dt className="col-5">CIN</dt>
                  <dd className="col-7">{detailEmp.cin || '—'}</dd>

                  <dt className="col-5">Téléphone</dt>
                  <dd className="col-7">{detailEmp.telephone || '—'}</dd>

                  <dt className="col-5">Département</dt>
                  <dd className="col-7">{detailEmp.departement || '—'}</dd>

                  <dt className="col-5">Poste</dt>
                  <dd className="col-7">{detailEmp.poste || '—'}</dd>

                  <dt className="col-5">Date d'embauche</dt>
                  <dd className="col-7">{detailEmp.dateEmbauche || '—'}</dd>

                  <dt className="col-5">Solde annuel</dt>
                  <dd className="col-7"><span className="badge bg-primary-subtle text-primary border border-primary">{detailEmp.soldeAnnuel ?? 0} jours</span></dd>

                  <dt className="col-5">Solde maladie</dt>
                  <dd className="col-7"><span className="badge bg-info-subtle text-info border border-info">{detailEmp.soldeMaladie ?? 8} jours</span></dd>

                  <dt className="col-5">Salaire</dt>
                  <dd className="col-7">{detailEmp.salaire != null ? `${detailEmp.salaire} DT` : '—'}</dd>

                  <dt className="col-5">Rôle</dt>
                  <dd className="col-7">{detailEmp.role}</dd>

                  <dt className="col-5">Statut</dt>
                  <dd className="col-7">
                    <span className={`badge ${detailEmp.statut === 'Actif' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                      {detailEmp.statut}
                    </span>
                  </dd>
                </dl>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDetailEmp(null)}>Fermer</button>
                <Link to={`/admin/employes/${detailEmp.id}/modifier`} className="btn btn-primary" onClick={() => setDetailEmp(null)}>
                  Modifier
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
