import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import Footer from '@/components/layout/Footer'

const INITIAL_MESSAGES = [
  { id: 1, text: "Bonjour ! Je suis votre Assistant RH. Comment puis-je vous aider aujourd'hui ?", sender: 'bot' }
]

const SUGGESTIONS = [
  'Quelle est la politique de congés annuels ?',
  'Combien de jours de RTT ai-je droit ?',
  'Comment faire une demande de congé maladie ?',
  'Quelles sont les règles pour les congés exceptionnels ?',
  'Que se passe-t-il en cas d\'absence non justifiée ?',
]

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [feedback, setFeedback] = useState({}) // { msgId: 'up' | 'down' }
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('chatMessages')
    if (saved) {
      setMessages(JSON.parse(saved))
    } else {
      setMessages(INITIAL_MESSAGES)
    }
    const savedFeedback = localStorage.getItem('chatFeedback')
    if (savedFeedback) setFeedback(JSON.parse(savedFeedback))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Copy to clipboard ──────────────────────────────────────────────
  const handleCopy = async (text, msgId) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(msgId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedId(msgId)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // ── Feedback (thumbs up/down) ──────────────────────────────────────
  const handleFeedback = (msgId, type) => {
    const updated = { ...feedback }
    if (updated[msgId] === type) {
      delete updated[msgId] // toggle off
    } else {
      updated[msgId] = type
    }
    setFeedback(updated)
    localStorage.setItem('chatFeedback', JSON.stringify(updated))
  }

  const handleSend = async (e, suggestionText) => {
    if (e) e.preventDefault()
    const question = suggestionText || input.trim()
    if (!question) return

    const newMessages = [...messages, { id: Date.now(), text: question, sender: 'user' }]
    setMessages(newMessages)
    localStorage.setItem('chatMessages', JSON.stringify(newMessages))
    setInput('')
    setIsTyping(true)

    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      const body = JSON.stringify({ question })

      // ── Try SSE streaming first, fall back to regular endpoint ──────
      let usedStreaming = false
      try {
        const res = await fetch('http://localhost:8080/api/chatbot/employe/stream', {
          method: 'POST', headers, body
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        // Streaming succeeded — read word-by-word
        usedStreaming = true
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''
        const botMsgId = Date.now() + 1

        let streamMessages = [...newMessages, { id: botMsgId, text: '', sender: 'bot' }]
        setMessages(streamMessages)
        setIsTyping(false)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n')
          for (const line of lines) {
            if (line.startsWith('data:')) {
              accumulated += line.slice(5)
            }
          }

          streamMessages = [...newMessages, { id: botMsgId, text: accumulated, sender: 'bot' }]
          setMessages(streamMessages)
        }

        localStorage.setItem('chatMessages', JSON.stringify(streamMessages))

      } catch (streamErr) {
        // ── Fallback: use the regular (non-streaming) endpoint ────────
        if (!usedStreaming) {
          console.warn('Streaming failed, falling back to regular endpoint:', streamErr.message)
          const res = await fetch('http://localhost:8080/api/chatbot/employe', {
            method: 'POST', headers, body
          })

          if (!res.ok) {
            let errorMsg = 'Une erreur est survenue.'
            if (res.status === 401) {
              errorMsg = '⚠️ Session expirée. Veuillez vous reconnecter.'
            } else if (res.status === 429) {
              errorMsg = '⏳ Trop de requêtes. Veuillez patienter une minute avant de réessayer.'
            } else if (res.status >= 500) {
              errorMsg = '🔧 Erreur serveur. Le service est temporairement indisponible.'
            }
            const errorMessages = [...newMessages, { id: Date.now() + 1, text: errorMsg, sender: 'bot' }]
            setMessages(errorMessages)
            localStorage.setItem('chatMessages', JSON.stringify(errorMessages))
            setIsTyping(false)
            return
          }

          const botResponse = await res.text()
          const updatedMessages = [...newMessages, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]
          setMessages(updatedMessages)
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages))
          setIsTyping(false)
        }
      }

      setIsTyping(false)

    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessages = [...newMessages, {
        id: Date.now() + 1,
        text: '🌐 Impossible de contacter le serveur. Vérifiez votre connexion réseau.',
        sender: 'bot'
      }]
      setMessages(errorMessages)
      localStorage.setItem('chatMessages', JSON.stringify(errorMessages))
      setIsTyping(false)
    }
  }

  const handleClear = () => {
    if (window.confirm('Voulez-vous effacer tout l\'historique ?')) {
      setMessages(INITIAL_MESSAGES)
      localStorage.setItem('chatMessages', JSON.stringify(INITIAL_MESSAGES))
      setFeedback({})
      localStorage.removeItem('chatFeedback')
    }
  }

  return (
    <div className="container-fluid h-100 d-flex flex-column">
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-1">Assistant RH</h1>
            <p className="text-secondary mb-0">Posez vos questions liées aux ressources humaines</p>
          </div>
          <button className="btn btn-outline-danger btn-sm" onClick={handleClear}>
            <i className="ti ti-trash me-1"></i> Effacer l'historique
          </button>
        </div>
      </div>

      <div className="row flex-grow-1 mb-4 g-3">
        {/* Sidebar: suggested questions */}
        <div className="col-12 col-lg-3">
          <div className="card border-primary border-opacity-25 bg-primary bg-opacity-10 mb-3">
            <div className="card-body p-3">
              <div className="d-flex gap-2 align-items-start mb-2">
                <i className="ti ti-bulb text-primary fs-5 mt-1" />
                <h6 className="mb-0 text-primary">Questions suggérées</h6>
              </div>
              <p className="small text-secondary mb-2">Cliquez pour poser une question :</p>
              {SUGGESTIONS.map((s, i) => (
                <button key={i}
                  className="btn btn-sm btn-outline-primary w-100 text-start mb-1"
                  style={{ whiteSpace: 'normal', lineHeight: 1.3, fontSize: '0.8rem' }}
                  disabled={isTyping}
                  onClick={() => handleSend(null, s)}>
                  <i className="ti ti-message me-1" />{s}
                </button>
              ))}
            </div>
          </div>

          <div className="card border-info border-opacity-25 bg-info bg-opacity-10">
            <div className="card-body p-3">
              <div className="d-flex gap-2 align-items-start mb-2">
                <i className="ti ti-shield-check text-info fs-5 mt-1" />
                <h6 className="mb-0 text-info">Périmètre</h6>
              </div>
              <ul className="small mb-0 ps-3">
                <li>Documents RH de l'entreprise</li>
                <li>Politique de congés</li>
                <li>Règlements internes</li>
                <li>Données personnelles non accessibles</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Chat window */}
        <div className="col-12 col-lg-9">
          <div className="card h-100 d-flex flex-column" style={{ minHeight: '60vh' }}>
            <div className="card-header bg-primary text-white p-3 d-flex align-items-center">
              <i className="ti ti-message-chatbot fs-4 me-2"></i>
              <h5 className="mb-0 text-white">Chat RH en direct</h5>
              {isTyping && (
                <span className="badge bg-white text-primary ms-auto">
                  <span className="spinner-grow spinner-grow-sm me-1" style={{ width: '.5rem', height: '.5rem' }} />
                  En cours…
                </span>
              )}
            </div>
            
            <div className="card-body flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3"
              style={{ backgroundColor: '#f8f9fa', maxHeight: '500px' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="icon-shape icon-sm bg-primary text-white rounded-circle me-2 flex-shrink-0 align-self-end d-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, minWidth: 32 }}>
                      <i className="ti ti-robot" style={{ fontSize: '1rem' }} />
                    </div>
                  )}
                  <div className="d-flex flex-column" style={{ maxWidth: '75%' }}>
                    <div 
                      className={`p-3 rounded-3 shadow-sm ${msg.sender === 'user'
                        ? 'bg-primary text-white rounded-bottom-end-0'
                        : 'bg-white border rounded-bottom-start-0'}`}
                      style={{ lineHeight: 1.6 }}
                    >
                      {msg.sender === 'bot' ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>

                    {/* ── Action buttons for bot messages: Copy + Feedback ── */}
                    {msg.sender === 'bot' && msg.id !== 1 && (
                      <div className="d-flex gap-1 mt-1 ms-1">
                        {/* Copy button */}
                        <button
                          className={`btn btn-sm border-0 px-2 py-0 ${copiedId === msg.id ? 'text-success' : 'text-secondary'}`}
                          onClick={() => handleCopy(msg.text, msg.id)}
                          title="Copier la réponse"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className={`ti ${copiedId === msg.id ? 'ti-check' : 'ti-copy'} me-1`} />
                          {copiedId === msg.id ? 'Copié !' : 'Copier'}
                        </button>

                        {/* Thumbs up */}
                        <button
                          className={`btn btn-sm border-0 px-2 py-0 ${feedback[msg.id] === 'up' ? 'text-success' : 'text-secondary'}`}
                          onClick={() => handleFeedback(msg.id, 'up')}
                          title="Réponse utile"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className={`ti ${feedback[msg.id] === 'up' ? 'ti-thumb-up-filled' : 'ti-thumb-up'}`} />
                        </button>

                        {/* Thumbs down */}
                        <button
                          className={`btn btn-sm border-0 px-2 py-0 ${feedback[msg.id] === 'down' ? 'text-danger' : 'text-secondary'}`}
                          onClick={() => handleFeedback(msg.id, 'down')}
                          title="Réponse non pertinente"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className={`ti ${feedback[msg.id] === 'down' ? 'ti-thumb-down-filled' : 'ti-thumb-down'}`} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="d-flex justify-content-start">
                  <div className="icon-shape icon-sm bg-primary text-white rounded-circle me-2 flex-shrink-0 align-self-end d-flex align-items-center justify-content-center"
                    style={{ width: 32, height: 32, minWidth: 32 }}>
                    <i className="ti ti-robot" style={{ fontSize: '1rem' }} />
                  </div>
                  <div className="p-3 rounded-3 shadow-sm bg-white border rounded-bottom-start-0">
                    <div className="d-flex gap-1 align-items-center">
                      <span className="spinner-grow spinner-grow-sm text-secondary" style={{ width: '.4rem', height: '.4rem', animationDelay: '0ms' }} />
                      <span className="spinner-grow spinner-grow-sm text-secondary" style={{ width: '.4rem', height: '.4rem', animationDelay: '150ms' }} />
                      <span className="spinner-grow spinner-grow-sm text-secondary" style={{ width: '.4rem', height: '.4rem', animationDelay: '300ms' }} />
                      <span className="ms-2 small text-secondary">L'assistant réfléchit…</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="card-footer bg-white p-3 border-top">
              <form onSubmit={handleSend} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control rounded-pill"
                  placeholder="Écrivez votre message ici..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTyping}
                />
                <button type="submit" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 40, height: 40, minWidth: 40 }}
                  disabled={!input.trim() || isTyping}>
                  <i className="ti ti-send"></i>
                </button>
              </form>
              <small className="text-secondary mt-1 d-block">
                <i className="ti ti-info-circle me-1" />Les réponses sont basées sur les documents RH officiels de l'entreprise.
              </small>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
