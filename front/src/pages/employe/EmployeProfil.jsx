import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from '@/components/layout/Footer'
import api from '@/services/api'
import { useToast } from '@/context/ToastContext'

const HISTORY_TIMELINE = [
  { id: 1, year: '2026', title: 'Développeur Senior', description: 'Promu au rôle de Développeur Senior.' },
  { id: 2, year: '2024', title: 'Développeur Confirmé', description: 'Transition vers des responsabilités Full-stack.' },
  { id: 3, year: '2022', title: 'Développeur Junior', description: 'A rejoint l\'entreprise en tant que Développeur Web Junior.' },
]

export default function EmployeProfil() {
  const location = useLocation()
  const toast = useToast()

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [originalRole, setOriginalRole] = useState('ROLE_EMPLOYE')
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState('success')

  const [pwForm, setPwForm] = useState({ current: '', nouveau: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwSaved, setPwSaved] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/employe/profil')
      const { nom, prenom, email, phone, address, role } = response.data
      setProfile({
        name: `${prenom || ''} ${nom || ''}`.trim(),
        email: email || '',
        phone: phone || '',
        address: address || ''
      })
      setOriginalRole(role)
    } catch (error) {
      console.error('Error fetching profile:', error)
      const saved = localStorage.getItem('employeProfile')
      if (saved) {
        setProfile(JSON.parse(saved))
      } else {
        setProfile({
          name: 'John Doe',
          email: 'employe@intraspace.com',
          phone: '+216 55 123 456',
          address: '123 Avenue Habib Bourguiba, Tunis'
        })
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const nameParts = profile.name.trim().split(' ')
    const prenom = nameParts[0] || ''
    const nom = nameParts.slice(1).join(' ') || ''

    try {
      const response = await api.put('/api/employe/profil', {
        nom,
        prenom,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        role: originalRole
      })

      const updated = response.data
      setProfile({
        name: `${updated.prenom || ''} ${updated.nom || ''}`.trim(),
        email: updated.email || '',
        phone: updated.phone || '',
        address: updated.address || ''
      })

      localStorage.setItem('employeProfile', JSON.stringify(profile))
      setIsEditing(false)
      toast.success('Profil mis à jour avec succès !')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil.')
    }
  }

  const setPw = (field, value) => {
    setPwForm(f => ({ ...f, [field]: value }))
    setPwErrors(e => ({ ...e, [field]: undefined }))
  }

  const savePassword = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!pwForm.current) errs.current = 'Mot de passe actuel requis.'
    if (!pwForm.nouveau || pwForm.nouveau.length < 6) errs.nouveau = 'Au moins 6 caractères.'
    if (pwForm.nouveau !== pwForm.confirm) errs.confirm = 'Les mots de passe ne correspondent pas.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }

    try {
      await api.post('/api/auth/change-password', {
        oldPassword: pwForm.current,
        newPassword: pwForm.nouveau
      })
      setPwSaved(true)
      setPwForm({ current: '', nouveau: '', confirm: '' })
      toast.success("Votre mot de passe a été mis à jour !");
      setTimeout(() => setPwSaved(false), 3000)
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error.response?.data?.message || "Erreur lors du changement de mot de passe.");
    }
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Mon Profil</h1>
          <p className="text-secondary mb-0">Gerez vos informations personnelles et consultez votre historique</p>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${msgType}`}>{message}</div>
      )}

      <div className="row g-4">
        {/* Left Column - Personal Info & Password Card */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          {/* Profile Edit Form */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white px-4 py-3 d-flex justify-content-between align-items-center border-bottom-0">
              <h5 className="mb-0 text-primary">Informations Personnelles</h5>
              {!isEditing && (
                <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}>
                  <i className="ti ti-pencil me-1"></i> Modifier
                </button>
              )}
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label fw-medium">Nom Complet</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Telephone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium">Adresse</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows="3"
                  ></textarea>
                </div>
                {isEditing && (
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">Enregistrer</button>
                    <button type="button" className="btn btn-light" onClick={() => setIsEditing(false)}>Annuler</button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white px-4 py-3 border-bottom-0">
              <h5 className="mb-0 text-primary">Changer de mot de passe</h5>
            </div>
            <div className="card-body p-4">
              {pwSaved && (
                <div className="alert alert-success py-2 small mb-3">
                  <i className="ti ti-circle-check me-2" />Mot de passe mis à jour.
                </div>
              )}
              <form onSubmit={savePassword} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-medium">Mot de passe actuel</label>
                  <input
                    type="password"
                    className={`form-control ${pwErrors.current ? 'is-invalid' : ''}`}
                    value={pwForm.current}
                    onChange={e => setPw('current', e.target.value)}
                    placeholder="••••••••"
                  />
                  {pwErrors.current && <div className="invalid-feedback">{pwErrors.current}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-medium">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className={`form-control ${pwErrors.nouveau ? 'is-invalid' : ''}`}
                    value={pwForm.nouveau}
                    onChange={e => setPw('nouveau', e.target.value)}
                    placeholder="••••••••"
                  />
                  {pwErrors.nouveau && <div className="invalid-feedback">{pwErrors.nouveau}</div>}
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className={`form-control ${pwErrors.confirm ? 'is-invalid' : ''}`}
                    value={pwForm.confirm}
                    onChange={e => setPw('confirm', e.target.value)}
                    placeholder="••••••••"
                  />
                  {pwErrors.confirm && <div className="invalid-feedback">{pwErrors.confirm}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  <i className="ti ti-lock me-2" />Mettre à jour
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Professional History Timeline */}
        <div className="col-12 col-lg-7">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white px-4 py-3 border-bottom-0">
              <h5 className="mb-0 text-primary">Historique Professionnel</h5>
            </div>
            <div className="card-body p-4">
              <div className="timeline">
                {HISTORY_TIMELINE.map((item, index) => (
                  <div className="d-flex mb-4 position-relative" key={item.id}>
                    {index !== HISTORY_TIMELINE.length - 1 && (
                      <div className="position-absolute border-start border-2 h-100" style={{ left: '11px', top: '24px', zIndex: 0 }}></div>
                    )}
                    <div className="bg-primary rounded-circle mt-1 z-1" style={{ width: '24px', height: '24px', minWidth: '24px' }}></div>
                    <div className="ms-3">
                      <h6 className="mb-1 text-primary">{item.year}</h6>
                      <h5 className="mb-1 fw-bold">{item.title}</h5>
                      <p className="text-secondary mb-0">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Footer />
      </div>
    </div>
  )
}
