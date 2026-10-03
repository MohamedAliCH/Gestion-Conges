import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoIcon } from '@/assets/images'
import api from '@/services/api'
import { useToast } from '@/context/ToastContext'

export default function ResetPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  
  const [form, setForm] = useState({ current: '', nouveau: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const firstLogin = localStorage.getItem('firstLogin')
    
    // If not logged in or doesn't need first-login password change, redirect appropriately
    if (!token) {
      navigate('/signin')
    } else if (firstLogin !== 'true') {
      const role = localStorage.getItem('userRole')
      if (role === 'ROLE_ADMIN') {
        navigate('/admin')
      } else {
        navigate('/employe')
      }
    }
  }, [navigate])

  const handleChange = (e) => {
    const { id, value } = e.target
    setForm(f => ({ ...f, [id]: value }))
    setErrors(er => ({ ...er, [id]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.current) e.current = 'Mot de passe actuel requis.'
    if (!form.nouveau || form.nouveau.length < 6) e.nouveau = 'Au moins 6 caractères.'
    if (form.nouveau !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/change-password', {
        oldPassword: form.current,
        newPassword: form.nouveau
      })
      
      // Success! Clear auth details and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('firstLogin')
      
      toast.success("Mot de passe mis à jour avec succès. Veuillez vous reconnecter.")
      navigate('/signin')
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du mot de passe.")
      setErrors({ current: 'Mot de passe actuel incorrect ou erreur serveur.' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('firstLogin')
    navigate('/signin')
  }

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow" style={{ maxWidth: 450, width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center mb-4">
              <img src={logoIcon} alt="Logo" width="36" />
              <span className="ms-2 fw-bold text-dark fs-4">IntraCongés</span>
            </div>
            <h1 className="card-title h4 mb-2">Sécurisez votre compte</h1>
            <p className="text-muted small">C'est votre première connexion. Veuillez changer votre mot de passe temporaire pour continuer.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="current" className="form-label">Mot de passe actuel (temporaire)</label>
              <input
                id="current"
                type="password"
                className={`form-control${errors.current ? ' is-invalid' : ''}`}
                placeholder="Entrez le mot de passe reçu"
                value={form.current}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />
              {errors.current && <div className="invalid-feedback">{errors.current}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="nouveau" className="form-label">Nouveau mot de passe</label>
              <input
                id="nouveau"
                type="password"
                className={`form-control${errors.nouveau ? ' is-invalid' : ''}`}
                placeholder="Au moins 6 caractères"
                value={form.nouveau}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.nouveau && <div className="invalid-feedback">{errors.nouveau}</div>}
            </div>

            <div className="mb-4">
              <label htmlFor="confirm" className="form-label">Confirmer le nouveau mot de passe</label>
              <input
                id="confirm"
                type="password"
                className={`form-control${errors.confirm ? ' is-invalid' : ''}`}
                placeholder="Répétez le mot de passe"
                value={form.confirm}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
            </div>

            <div className="d-flex flex-column gap-2">
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? 'Mise à jour en cours...' : 'Changer le mot de passe et se connecter'}
              </button>
              <button className="btn btn-light w-100" type="button" onClick={handleLogout} disabled={loading}>
                Se déconnecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
