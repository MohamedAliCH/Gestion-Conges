import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoIcon } from '@/assets/images'
import api from '@/services/api'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState({ old: false, new: false, confirm: false })

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/signin', { replace: true })
    }
  }, [navigate])

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
    setApiError('')
  }

  const validate = () => {
    const e = {}
    if (!form.oldPassword) e.oldPassword = 'Mot de passe actuel requis.'
    if (!form.newPassword || form.newPassword.length < 6) e.newPassword = 'Au moins 6 caractères.'
    if (form.newPassword === form.oldPassword) e.newPassword = 'Le nouveau mot de passe doit être différent de l\'actuel.'
    if (form.newPassword !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas.'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await api.post('/api/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })

      localStorage.setItem('firstLogin', 'false')

      const role = localStorage.getItem('userRole')
      navigate(role === 'ROLE_ADMIN' ? '/admin' : '/employee', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.erreur || err.response?.data?.message
      setApiError(msg || 'Mot de passe actuel incorrect ou erreur serveur.')
    } finally {
      setLoading(false)
    }
  }

  const toggleShow = field => setShow(s => ({ ...s, [field]: !s[field] }))

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div style={{ width: '100%', maxWidth: 460 }} className="px-3">
        <div className="text-center mb-4">
          <img src={logoIcon} alt="" width="36" />
          <span className="ms-2 fw-bold text-dark fs-4">IntraCongés</span>
        </div>

        <div className="card shadow-sm border-0">
          {/* Top accent bar */}
          <div className="rounded-top" style={{ height: 4, background: 'var(--bs-warning, #f59e0b)' }} />

          <div className="card-body p-4 p-sm-5">
            {/* Icon + heading */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: 56, height: 56, background: '#fff3cd' }}
              >
                <i className="ti ti-lock-open fs-3 text-warning" />
              </div>
              <h4 className="fw-bold mb-1">Première connexion</h4>
              <p className="text-secondary small mb-0">
                Pour votre sécurité, veuillez changer votre mot de passe temporaire avant de continuer.
              </p>
            </div>

            {apiError && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                <i className="ti ti-alert-circle" />
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Current password */}
              <div className="mb-3">
                <label className="form-label fw-medium">Mot de passe temporaire</label>
                <div className="input-group">
                  <input
                    type={show.old ? 'text' : 'password'}
                    className={`form-control${errors.oldPassword ? ' is-invalid' : ''}`}
                    placeholder="Votre mot de passe actuel"
                    value={form.oldPassword}
                    onChange={e => set('oldPassword', e.target.value)}
                    autoFocus
                  />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => toggleShow('old')}>
                    <i className={`ti ${show.old ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                  {errors.oldPassword && <div className="invalid-feedback">{errors.oldPassword}</div>}
                </div>
              </div>

              {/* New password */}
              <div className="mb-3">
                <label className="form-label fw-medium">Nouveau mot de passe</label>
                <div className="input-group">
                  <input
                    type={show.new ? 'text' : 'password'}
                    className={`form-control${errors.newPassword ? ' is-invalid' : ''}`}
                    placeholder="Minimum 6 caractères"
                    value={form.newPassword}
                    onChange={e => set('newPassword', e.target.value)}
                  />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => toggleShow('new')}>
                    <i className={`ti ${show.new ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                  {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                </div>
              </div>

              {/* Confirm */}
              <div className="mb-4">
                <label className="form-label fw-medium">Confirmer le mot de passe</label>
                <div className="input-group">
                  <input
                    type={show.confirm ? 'text' : 'password'}
                    className={`form-control${errors.confirm ? ' is-invalid' : ''}`}
                    placeholder="Répétez le nouveau mot de passe"
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                  />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => toggleShow('confirm')}>
                    <i className={`ti ${show.confirm ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                  {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
                </div>
              </div>

              <button type="submit" className="btn btn-warning w-100 fw-semibold text-dark" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Enregistrement…</>
                  : <><i className="ti ti-lock me-2" />Définir mon mot de passe</>
                }
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-secondary small mt-3">
          <i className="ti ti-shield-lock me-1" />
          Cette étape est obligatoire et ne peut pas être ignorée.
        </p>
      </div>
    </div>
  )
}
