import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logoIcon } from '@/assets/images'
import api from '@/services/api'
import { useToast } from '@/context/ToastContext'


export default function SignIn() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const toast = useToast()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('userRole')
    if (token && role) {
      if (role === 'ROLE_ADMIN') {
        navigate('/admin')
      } else {
        navigate('/employe')
      }
    }
  }, [navigate])

  const validate = () => {
    const e = {}
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email.'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    return e
  }

  const handleChange = e => {
    const { id, value, checked, type } = e.target
    setForm(f => ({ ...f, [id]: type === 'checkbox' ? checked : value }))
    setErrors(er => ({ ...er, [id]: undefined }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    
    try {
      // Call backend
      const response = await api.post('/api/auth/login', {
        email: form.email,
        password: form.password
      });
      
      const { token, role, firstLogin } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('firstLogin', firstLogin ? 'true' : 'false');
      
      toast.success("Connexion réussie ! Bienvenue sur IntraCongés.");
      
      if (firstLogin) {
        toast.info("Première connexion : veuillez changer votre mot de passe temporaire.", 6000);
        navigate('/change-password');
      } else {
        if (role === 'ROLE_ADMIN') {
          navigate('/admin');
        } else {
          navigate('/employe');
        }
      }

    } catch (error) {
      const msg = error.response?.status === 401 ? 'Email ou mot de passe incorrect.' : 'Erreur serveur. Veuillez réessayer.';
      setErrors({ email: msg, password: msg });
      toast.error(msg);
    }
  }


  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card" style={{ maxWidth: 420, width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-3">
            <Link to="/" className="mb-4 d-inline-flex align-items-center text-decoration-none">
              <img src={logoIcon} alt="" width="36" />
              <span className="ms-2 fw-bold text-dark fs-4">IntraCongés</span>
            </Link>
            <h1 className="card-title mb-5 h5">Sign in to your account</h1>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className={`form-control${errors.email ? ' is-invalid' : ''}`}
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                autoFocus
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label d-flex justify-content-between">
                <span>Password</span>
                <a href="#" className="small link-primary">Forgot Password?</a>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`form-control${errors.password ? ' is-invalid' : ''}`}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input
                  id="remember"
                  className="form-check-input"
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <label className="form-check-label small" htmlFor="remember">Remember me</label>
              </div>
            </div>

            <button className="btn btn-primary w-100" type="submit">Sign in</button>
          </form>

        </div>
      </div>
    </div>
  )
}
