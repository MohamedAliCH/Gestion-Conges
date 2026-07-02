import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { avatar1 } from '@/assets/images'
import Footer from '@/components/layout/Footer'
import api from '@/services/api'

const INITIAL = {
  prenom: 'Marie',
  nom: 'Dupont',
  email: 'marie.dupont@company.com',
  telephone: '06 01 02 03 04',
  poste: 'Responsable RH',
  departement: 'Ressources Humaines',
  langue: 'fr',
  notifications: true,
}

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const backPath = location.pathname.startsWith('/admin') ? '/admin/employes' : '/employee'

  const [form, setForm] = useState(INITIAL)
  const [pwForm, setPwForm] = useState({ current: '', nouveau: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const setPw = (field, value) => {
    setPwForm(f => ({ ...f, [field]: value }))
    setPwErrors(e => ({ ...e, [field]: undefined }))
  }

  const saveProfile = e => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const savePassword = async e => {
    e.preventDefault()
    const errs = {}
    if (!pwForm.current) errs.current = 'Mot de passe actuel requis.'
    if (!pwForm.nouveau || pwForm.nouveau.length < 6) errs.nouveau = 'Au moins 6 caractères.'
    if (pwForm.nouveau !== pwForm.confirm) errs.confirm = 'Les mots de passe ne correspondent pas.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    try {
      await api.post('/api/auth/change-password', {
        oldPassword: pwForm.current,
        newPassword: pwForm.nouveau,
      })
      setPwSaved(true)
      setPwForm({ current: '', nouveau: '', confirm: '' })
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err) {
      const msg = err.response?.data?.erreur || 'Mot de passe actuel incorrect.'
      setPwErrors({ current: msg })
    }
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1 className="fs-3 mb-1">Mon profil</h1>
            <p className="text-secondary mb-0">Gérez vos informations personnelles et vos préférences</p>
          </div>
          <button className="btn btn-outline-secondary" onClick={() => navigate(backPath)}>
            <i className="ti ti-arrow-left me-2" />Retour
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Avatar + summary */}
        <div className="col-12 col-lg-3">
          <div className="card text-center p-4">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <img src={avatar1} alt="Avatar" className="rounded-circle" width="96" height="96"
                style={{ objectFit: 'cover' }} />
              <button
                className="btn btn-sm btn-primary rounded-circle position-absolute bottom-0 end-0"
                style={{ width: 28, height: 28, padding: 0 }}
                title="Changer la photo"
              >
                <i className="ti ti-camera" style={{ fontSize: 13 }} />
              </button>
            </div>
            <h5 className="mb-0">{form.prenom} {form.nom}</h5>
            <small className="text-secondary">{form.poste}</small>
            <hr />
            <ul className="list-unstyled text-start small text-secondary mb-0">
              <li className="mb-1"><i className="ti ti-mail me-2" />{form.email}</li>
              <li className="mb-1"><i className="ti ti-phone me-2" />{form.telephone}</li>
              <li><i className="ti ti-building me-2" />{form.departement}</li>
            </ul>
          </div>
        </div>

        <div className="col-12 col-lg-9">
          {/* Personal info */}
          <div className="card mb-4">
            <div className="card-header bg-white px-4 py-3">
              <h5 className="mb-0">Informations personnelles</h5>
            </div>
            <div className="card-body p-4">
              {saved && (
                <div className="alert alert-success py-2 small mb-3">
                  <i className="ti ti-circle-check me-2" />Profil mis à jour avec succès.
                </div>
              )}
              <form onSubmit={saveProfile} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Prénom</label>
                    <input type="text" className="form-control"
                      value={form.prenom} onChange={e => set('prenom', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Nom</label>
                    <input type="text" className="form-control"
                      value={form.nom} onChange={e => set('nom', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email professionnel</label>
                    <input type="email" className="form-control"
                      value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Téléphone</label>
                    <input type="text" className="form-control"
                      value={form.telephone} onChange={e => set('telephone', e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Poste</label>
                    <input type="text" className="form-control bg-light text-secondary"
                      value={form.poste} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Département</label>
                    <input type="text" className="form-control bg-light text-secondary"
                      value={form.departement} readOnly />
                  </div>
                </div>
                <div className="mt-3">
                  <button type="submit" className="btn btn-primary">
                    <i className="ti ti-device-floppy me-2" />Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Password */}
          <div className="card mb-4">
            <div className="card-header bg-white px-4 py-3">
              <h5 className="mb-0">Changer de mot de passe</h5>
            </div>
            <div className="card-body p-4">
              {pwSaved && (
                <div className="alert alert-success py-2 small mb-3">
                  <i className="ti ti-circle-check me-2" />Mot de passe mis à jour.
                </div>
              )}
              <form onSubmit={savePassword} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Mot de passe actuel</label>
                    <input type="password"
                      className={`form-control${pwErrors.current ? ' is-invalid' : ''}`}
                      value={pwForm.current}
                      onChange={e => setPw('current', e.target.value)}
                      placeholder="••••••••" />
                    {pwErrors.current && <div className="invalid-feedback">{pwErrors.current}</div>}
                  </div>
                  <div className="col-md-6" />
                  <div className="col-md-6">
                    <label className="form-label">Nouveau mot de passe</label>
                    <input type="password"
                      className={`form-control${pwErrors.nouveau ? ' is-invalid' : ''}`}
                      value={pwForm.nouveau}
                      onChange={e => setPw('nouveau', e.target.value)}
                      placeholder="••••••••" />
                    {pwErrors.nouveau && <div className="invalid-feedback">{pwErrors.nouveau}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirmer le mot de passe</label>
                    <input type="password"
                      className={`form-control${pwErrors.confirm ? ' is-invalid' : ''}`}
                      value={pwForm.confirm}
                      onChange={e => setPw('confirm', e.target.value)}
                      placeholder="••••••••" />
                    {pwErrors.confirm && <div className="invalid-feedback">{pwErrors.confirm}</div>}
                  </div>
                </div>
                <div className="mt-3">
                  <button type="submit" className="btn btn-primary">
                    <i className="ti ti-lock me-2" />Mettre à jour le mot de passe
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preferences */}
          <div className="card mb-4">
            <div className="card-header bg-white px-4 py-3">
              <h5 className="mb-0">Préférences</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Langue de l'interface</label>
                  <select className="form-select"
                    value={form.langue} onChange={e => set('langue', e.target.value)}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="notifSwitch"
                      checked={form.notifications}
                      onChange={e => set('notifications', e.target.checked)} />
                    <label className="form-check-label" htmlFor="notifSwitch">
                      Recevoir les notifications par email
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <button className="btn btn-primary" onClick={saveProfile}>
                  <i className="ti ti-device-floppy me-2" />Enregistrer les préférences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
