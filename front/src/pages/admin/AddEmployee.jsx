import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '@/components/layout/Footer'
import api from '@/services/api'

const INITIAL = {
  nom: '',
  prenom: '',
  email: '',
  cin: '',
  role: 'ROLE_EMPLOYE',
}

export default function AddEmployee() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.nom.trim()) e.nom = 'Le nom est obligatoire.'
    if (!form.prenom.trim()) e.prenom = 'Le prénom est obligatoire.'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email valide requis.'
    if (!form.cin.trim()) e.cin = 'Le CIN est obligatoire.'
    if (!form.role) e.role = 'Le rôle est obligatoire.'
    return e
  }

  const handleChange = e => {
    const { id, value } = e.target
    setForm(f => ({ ...f, [id]: value }))
    setErrors(er => ({ ...er, [id]: undefined }))
    setServerError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    try {
      await api.post('/api/admin/employes', form)
      setSubmitted(true)
      setTimeout(() => navigate('/admin/employes'), 1500)
    } catch (error) {
      setServerError(error.response?.data?.message || 'Erreur lors de la création de l\'employé.')
    }
  }

  const handleReset = () => {
    setForm(INITIAL)
    setErrors({})
    setServerError('')
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 className="fs-3 mb-1">Ajouter un Employé</h1>
            <p className="mb-0 text-secondary">Créer un nouveau compte employé</p>
          </div>
          <Link to="/admin/employes" className="btn btn-primary">Liste des employés</Link>
        </div>
      </div>

      {submitted && (
        <div className="alert alert-success" role="alert">
          Employé créé avec succès ! Un email avec les identifiants a été envoyé. Redirection...
        </div>
      )}

      {serverError && (
        <div className="alert alert-danger" role="alert">
          {serverError}
        </div>
      )}

      {/* Form card */}
      <div className="row mb-6">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="prenom" className="form-label">Prénom</label>
                    <input
                      type="text"
                      className={`form-control${errors.prenom ? ' is-invalid' : ''}`}
                      id="prenom"
                      placeholder="Ex: John"
                      value={form.prenom}
                      onChange={handleChange}
                    />
                    {errors.prenom && <div className="invalid-feedback">{errors.prenom}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="nom" className="form-label">Nom</label>
                    <input
                      type="text"
                      className={`form-control${errors.nom ? ' is-invalid' : ''}`}
                      id="nom"
                      placeholder="Ex: Doe"
                      value={form.nom}
                      onChange={handleChange}
                    />
                    {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control${errors.email ? ' is-invalid' : ''}`}
                      id="email"
                      placeholder="john.doe@intraspace.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="cin" className="form-label">CIN</label>
                    <input
                      type="text"
                      className={`form-control${errors.cin ? ' is-invalid' : ''}`}
                      id="cin"
                      placeholder="Ex: 11111111"
                      value={form.cin}
                      onChange={handleChange}
                    />
                    {errors.cin && <div className="invalid-feedback">{errors.cin}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Rôle</label>
                  <select
                    className={`form-select${errors.role ? ' is-invalid' : ''}`}
                    id="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="ROLE_EMPLOYE">Employé</option>
                    <option value="ROLE_ADMIN">Administrateur</option>
                  </select>
                  {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary">Ajouter</button>
                  <button type="button" className="btn btn-secondary" onClick={handleReset}>
                    Réinitialiser
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
