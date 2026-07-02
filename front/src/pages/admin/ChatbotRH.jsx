import { useState, useRef, useEffect } from 'react'
import Footer from '@/components/layout/Footer'
import api from '@/services/api'

const SUGGESTIONS = [
  'Combien d\'employés sont actifs ?',
  'Combien de jours de congé j\'acquiers par mois ?',
  'Qui est absent aujourd\'hui ?',
  'Liste des congés en attente avec le nom de l\'employé',
  'Quel département a le plus d\'absences ?',
  'Quel est le salaire le plus élevé et de qui ?',
]

export default function ChatbotRH() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Bonjour ! Je suis le Chatbot RH Admin. Je réponds exclusivement aux questions portant sur les données RH de l\'administration : effectifs, congés, absences et documents. Comment puis-je vous aider ?',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text = input) => {
    const q = text.trim()
    if (!q || loading) return

    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const userMsg = { id: Date.now(), role: 'user', text: q, time }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/api/chatbot/admin', { question: q })
      const botText = res.data.response || 'Aucune réponse reçue.'
      const sql = res.data.sqlGenerated
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'bot',
        text: botText,
        sql,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch (err) {
      const errText = err.response?.data?.message || 'Erreur de connexion au serveur.'
      setMessages(m => [...m, {
        id: Date.now() + 1,
        role: 'bot',
        text: `⚠️ ${errText}`,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Chatbot RH</h1>
          <p className="text-secondary mb-0">Assistant IA dédié aux données RH de l'administration</p>
        </div>
      </div>

      <div className="row g-3">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <div className="card border-primary border-opacity-25 bg-primary bg-opacity-10 mb-3">
            <div className="card-body p-3">
              <div className="d-flex gap-2 align-items-start mb-2">
                <i className="ti ti-shield-lock text-primary fs-5 mt-1" />
                <h6 className="mb-0 text-primary">Périmètre de données</h6>
              </div>
              <ul className="small mb-0 ps-3">
                <li>Données RH administrateur uniquement</li>
                <li>Effectifs et statuts employés</li>
                <li>Congés et absences</li>
                <li>Documents RH indexés</li>
              </ul>
            </div>
          </div>

          <div className="mt-3">
            <p className="small text-secondary fw-medium mb-2">Questions suggérées :</p>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="btn btn-sm btn-outline-secondary w-100 text-start mb-1"
                style={{ whiteSpace: 'normal', lineHeight: 1.3 }}
                onClick={() => send(s)}
                disabled={loading}
              >
                <i className="ti ti-message me-1" />{s}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="col-12 col-lg-9">
          <div className="card d-flex flex-column" style={{ height: 600 }}>
            <div className="flex-grow-1 overflow-auto p-4" style={{ background: '#f8f9fa' }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="icon-shape icon-sm bg-primary text-white rounded-circle me-2 flex-shrink-0 align-self-end">
                      <i className="ti ti-robot" />
                    </div>
                  )}
                  <div style={{ maxWidth: '75%' }}>
                    <div
                      className={`rounded-3 px-3 py-2 small ${msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white border shadow-sm text-dark'}`}
                      style={{ lineHeight: 1.6 }}
                    >
                      {msg.text}
                    </div>
                    {msg.sql && (
                      <details className="mt-1">
                        <summary className="small text-secondary" style={{ cursor: 'pointer' }}>
                          <i className="ti ti-code me-1" />Voir la requête SQL
                        </summary>
                        <pre className="small bg-light border rounded p-2 mt-1 mb-0" style={{ fontSize: '0.75rem', overflowX: 'auto' }}>
                          {msg.sql}
                        </pre>
                      </details>
                    )}
                    <div className={`mt-1 small text-secondary ${msg.role === 'user' ? 'text-end' : ''}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="d-flex mb-3 justify-content-start">
                  <div className="icon-shape icon-sm bg-primary text-white rounded-circle me-2 flex-shrink-0 align-self-end">
                    <i className="ti ti-robot" />
                  </div>
                  <div className="bg-white border shadow-sm rounded-3 px-3 py-2 small">
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Analyse en cours…
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="border-top p-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Posez votre question RH…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={loading}
                />
                <button className="btn btn-primary" onClick={() => send()} disabled={!input.trim() || loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" /> : <i className="ti ti-send" />}
                </button>
              </div>
              <small className="text-secondary mt-1 d-block">
                <i className="ti ti-info-circle me-1" />Ce chatbot analyse les données RH via SQL généré par IA.
              </small>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
