import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '@/components/layout/Footer'
import api from '@/services/api'
import { useToast } from '@/context/ToastContext'

const INITIAL_FORM = { type: '', from: '', to: '', reason: '' }

export default function EmployeDemandeConge() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [soldes, setSoldes] = useState({ soldeAnnuel: 0, soldeMaladie: 8 })
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    api.get('/api/employe/profil')
      .then(r => setSoldes({ soldeAnnuel: r.data.soldeAnnuel, soldeMaladie: r.data.soldeMaladie }))
      .catch(() => {})
  }, [])

  const validate = () => {
    const e = {}
    if (!form.type) e.type = 'Veuillez sélectionner un type.'
    if (!form.from) e.from = 'Date de début requise.'
    if (!form.to) e.to = 'Date de fin requise.'
    if (form.from && form.from <= new Date().toISOString().slice(0, 10)) {
      e.from = 'La date de début doit être supérieure à la date du jour.'
    }
    if (form.from && form.to && form.to < form.from) {
      e.to = 'La date de fin doit être après ou égale à la date de début.'
    }
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

    const fromDate = new Date(form.from)
    const toDate = new Date(form.to)
    const days = Math.round((toDate - fromDate) / 86400000) + 1

    try {
      await api.post('/api/employe/conges', {
        type: form.type,
        from: form.from,
        to: form.to,
        reason: form.reason
      })

      toast.success("Demande de congé soumise avec succès !");
      setForm(INITIAL_FORM)
      setSubmitted(true)

      setTimeout(() => {
        navigate('/employe')
      }, 2000)
    } catch (error) {
      console.error('Error submitting leave request:', error)
      const msg = error.response?.data?.message || 'Une erreur est survenue lors de la soumission de la demande.'
      setServerError(msg)
      toast.error(msg)
    }
  }


  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Demande de Congé</h1>
          <p className="text-secondary mb-0">Soumettez une nouvelle demande de congé</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white px-4 py-3 border-bottom-0">
              <h5 className="mb-0 text-primary">Nouveau formulaire de demande</h5>
            </div>
            <div className="card-body p-4">
              {serverError && (
                <div className="alert alert-danger py-2 small">{serverError}</div>
              )}
              {submitted ? (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <i className="ti ti-circle-check text-success" style={{ fontSize: '3.5rem' }}></i>
                  </div>
                  <h4 className="fw-semibold text-success">Demande soumise avec succès !</h4>
                  <p className="text-muted mt-2">
                    Votre demande a bien été enregistrée. Redirection vers vos congés en cours...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="type" className="form-label fw-medium">Type de congé</label>
                    <select
                      id="type"
                      className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="Congé Annuel">Congé Annuel ({soldes.soldeAnnuel} jour(s) disponible(s))</option>
                      <option value="Congé Maladie">Congé Maladie ({soldes.soldeMaladie} jour(s) disponible(s))</option>
                      <option value="Congé Sans Solde">Congé Sans Solde (illimité)</option>
                    </select>
                    {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                  </div>

                  <div className="row mb-3">
                    <div className="col-12 col-sm-6">
                      <label htmlFor="from" className="form-label fw-medium">Date de début</label>
                      <input
                        id="from"
                        type="date"
                        className={`form-control ${errors.from ? 'is-invalid' : ''}`}
                        value={form.from}
                        onChange={handleChange}
                      />
                      {errors.from && <div className="invalid-feedback">{errors.from}</div>}
                    </div>
                    <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                      <label htmlFor="to" className="form-label fw-medium">Date de fin</label>
                      <input
                        id="to"
                        type="date"
                        className={`form-control ${errors.to ? 'is-invalid' : ''}`}
                        value={form.to}
                        onChange={handleChange}
                      />
                      {errors.to && <div className="invalid-feedback">{errors.to}</div>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="reason" className="form-label fw-medium">Motif (optionnel)</label>
                    <textarea
                      id="reason"
                      className="form-control"
                      rows="4"
                      placeholder="Indiquez le motif de votre absence si nécessaire..."
                      value={form.reason}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-light w-50"
                      onClick={() => navigate('/employe')}
                    >
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary w-50">
                      Soumettre la demande
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
