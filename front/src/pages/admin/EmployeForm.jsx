import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEmploye } from '@/context/EmployeContext'
import Footer from '@/components/layout/Footer'
import { DEPARTEMENTS, POSTES } from '@/data/hrData'

const EMPTY = {
  prenom: '', nom: '', email: '', telephone: '',
  departement: '', poste: '', dateEmbauche: '', statut: 'Actif', role: '',
  soldeConges: { annuel: 0, maladie: 8, personnel: 0 },
  cin: '', address: '', salaire: '',
}

export default function EmployeForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { employes, ajouterEmploye, modifierEmploye } = useEmploye()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      const found = employes.find(e => e.id === Number(id))
      if (found) {
        setForm({
          ...found,
          cin: found.cin || '',
          address: found.address || '',
          salaire: found.salaire ?? '',
          role: found.role === 'Admin' ? 'Admin' : 'Employé',
          telephone: found.telephone || '',
        })
      }
    }
  }, [id, employes, isEdit])

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(er => ({ ...er, [field]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!isEdit && (!form.cin || !/^[0-9]{8}$/.test(form.cin))) e.cin = 'CIN : 8 chiffres exactement.'
    if (!form.prenom.trim()) e.prenom = 'Prénom requis.'
    if (!form.nom.trim()) e.nom = 'Nom requis.'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide.'
    if (!form.role) e.role = 'Rôle requis.'
    if (!form.departement) e.departement = 'Département requis.'
    if (!form.poste.trim()) e.poste = 'Poste requis.'
    if (!form.dateEmbauche) e.dateEmbauche = 'Date d\'embauche requise.'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      if (isEdit) {
        await modifierEmploye(form)
      } else {
        await ajouterEmploye(form)
      }
      navigate('/admin/employes')
    } catch (err) {
      console.error(err)
      const serverMsg = err.response?.data?.message || err.response?.data?.erreur || err.response?.data?.error || ''
      if (serverMsg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: serverMsg }))
      } else if (serverMsg.toLowerCase().includes('cin')) {
        setErrors(prev => ({ ...prev, cin: serverMsg }))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h1 className="fs-3 mb-1">
              {isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
            </h1>
            <p className="text-secondary mb-0">
              {isEdit ? 'Modifiez les informations et le solde de congés' : 'Renseignez les informations du nouvel employé'}
            </p>
          </div>
          <Link to="/admin/employes" className="btn btn-outline-secondary">
            <i className="ti ti-arrow-left me-2" />Retour à la liste
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          {/* Personal info */}
          <div className="col-12 col-lg-8">
            <div className="card mb-3">
              <div className="card-header bg-white px-4 py-3">
                <h5 className="mb-0">Informations personnelles</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {!isEdit && (
                    <div className="col-md-6">
                      <label className="form-label">CIN *</label>
                      <input type="text"
                        className={`form-control${errors.cin ? ' is-invalid' : ''}`}
                        value={form.cin} onChange={e => set('cin', e.target.value)}
                        placeholder="12345678" maxLength={8} />
                      {errors.cin && <div className="invalid-feedback">{errors.cin}</div>}
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label">Prénom *</label>
                    <input type="text"
                      className={`form-control${errors.prenom ? ' is-invalid' : ''}`}
                      value={form.prenom} onChange={e => set('prenom', e.target.value)}
                      placeholder="Marie" />
                    {errors.prenom && <div className="invalid-feedback">{errors.prenom}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Nom *</label>
                    <input type="text"
                      className={`form-control${errors.nom ? ' is-invalid' : ''}`}
                      value={form.nom} onChange={e => set('nom', e.target.value)}
                      placeholder="Dupont" />
                    {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email professionnel *</label>
                    <input type="email"
                      className={`form-control${errors.email ? ' is-invalid' : ''}`}
                      value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="marie.dupont@company.com" />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Téléphone</label>
                    <input type="text" className="form-control"
                      value={form.telephone} onChange={e => set('telephone', e.target.value)}
                      placeholder="06 01 02 03 04" />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Salaire (DT)</label>
                    <input type="number" className="form-control"
                      value={form.salaire} onChange={e => set('salaire', e.target.value)}
                      placeholder="2500" min="0" step="0.01" />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Adresse</label>
                    <textarea className="form-control" rows="2"
                      value={form.address} onChange={e => set('address', e.target.value)}
                      placeholder="123 rue de la Liberté, Tunis" />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Rôle *</label>
                    <div className="d-flex gap-2">
                      {[
                        { value: 'Admin', icon: 'ti-shield-lock', desc: 'Accès complet à l\'espace RH admin' },
                        { value: 'Employé', icon: 'ti-user', desc: 'Accès à l\'espace employé uniquement' },
                      ].map(({ value, icon, desc }) => (
                        <label
                          key={value}
                          className={`d-flex align-items-center gap-3 border rounded-3 px-4 py-3 flex-grow-1 ${
                            form.role === value
                              ? 'border-primary bg-primary bg-opacity-10'
                              : 'border-secondary-subtle'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={value}
                            checked={form.role === value}
                            onChange={() => {
                              set('role', value)
                            }}
                            className="visually-hidden"
                          />
                          <i className={`ti ${icon} fs-4 ${form.role === value ? 'text-primary' : 'text-secondary'}`} />
                          <div>
                            <div className={`fw-medium small ${form.role === value ? 'text-primary' : ''}`}>{value}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{desc}</div>
                          </div>
                          {form.role === value && (
                            <i className="ti ti-circle-check text-primary ms-auto fs-5" />
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.role && <div className="text-danger small mt-1">{errors.role}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Département *</label>
                    <select
                      className={`form-select${errors.departement ? ' is-invalid' : ''}`}
                      value={form.departement} onChange={e => set('departement', e.target.value)}>
                      <option value="">Sélectionner…</option>
                      {DEPARTEMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    {errors.departement && <div className="invalid-feedback">{errors.departement}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Poste *</label>
                    <input type="text"
                      className={`form-control${errors.poste ? ' is-invalid' : ''}`}
                      value={form.poste} onChange={e => set('poste', e.target.value)}
                      list="postes-list" placeholder="Ex : Développeur" />
                    <datalist id="postes-list">
                      {POSTES.map(p => <option key={p} value={p} />)}
                    </datalist>
                    {errors.poste && <div className="invalid-feedback">{errors.poste}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date d'embauche *</label>
                    <input type="date"
                      className={`form-control${errors.dateEmbauche ? ' is-invalid' : ''}`}
                      value={form.dateEmbauche} onChange={e => set('dateEmbauche', e.target.value)} />
                    {errors.dateEmbauche && <div className="invalid-feedback">{errors.dateEmbauche}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Statut</label>
                    <select className="form-select" value={form.statut}
                      onChange={e => set('statut', e.target.value)}>
                      <option>Actif</option>
                      <option>Inactif</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave balance — read-only, set by backend */}
          <div className="col-12 col-lg-4">
            <div className="card">
              <div className="card-header bg-white px-4 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Solde de congés</h5>
                <span className="badge bg-secondary-subtle text-secondary border">
                  <i className="ti ti-lock me-1" />Géré par le backend
                </span>
              </div>
              <div className="card-body p-4">
                {[
                  { label: 'Congés annuels', value: form.soldeAnnuel ?? 0, color: 'primary' },
                  { label: 'Congés maladie', value: form.soldeMaladie ?? 8, color: 'danger' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <span className="small text-secondary">{label}</span>
                    <span className={`badge bg-${color}-subtle text-${color} border border-${color}`}>
                      {value} jours
                    </span>
                  </div>
                ))}
                <p className="text-secondary small mt-3 mb-0">
                  <i className="ti ti-info-circle me-1" />
                  {isEdit
                    ? 'Solde calculé depuis la date d\'embauche.'
                    : 'Calculé automatiquement depuis la date d\'embauche.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2 mt-3 mb-6">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Enregistrement...</>
            ) : (
              <><i className={`ti ${isEdit ? 'ti-device-floppy' : 'ti-user-plus'} me-2`} />{isEdit ? 'Enregistrer les modifications' : "Créer l'employé"}</>
            )}
          </button>
          <Link to="/admin/employes" className="btn btn-secondary">Annuler</Link>
        </div>
      </form>

      <Footer />
    </div>
  )
}
