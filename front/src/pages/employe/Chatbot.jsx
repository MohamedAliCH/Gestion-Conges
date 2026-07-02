import { useState, useEffect, useRef } from 'react'
import Footer from '@/components/layout/Footer'

const INITIAL_MESSAGES = [
  { id: 1, text: "Bonjour ! Je suis votre Assistant RH. Comment puis-je vous aider aujourd'hui ?", sender: 'bot' }
]

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('chatMessages')
    if (saved) {
      setMessages(JSON.parse(saved))
    } else {
      setMessages(INITIAL_MESSAGES)
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessages = [...messages, { id: Date.now(), text: input, sender: 'user' }]
    setMessages(newMessages)
    localStorage.setItem('chatMessages', JSON.stringify(newMessages))
    setInput('')

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/chatbot/employe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: input })
      });

      const botResponse = await res.text();
      const updatedMessage=[...newMessages,{id:Date.now()+1,text:botResponse,sender:'bot'}];
      setMessages(updatedMessage);
      localStorage.setItem('chatMessages',JSON.stringify(updatedMessage));
      
      } catch (error) {
      const errorMessages = [...newMessages, { id: Date.now() + 1, text: "Désolé, le service est temporairement indisponible.", sender: 'bot' }];
      setMessages(errorMessages);
      localStorage.setItem('chatMessages', JSON.stringify(errorMessages));
}


  }

  const handleClear = () => {
    if(window.confirm('Voulez-vous effacer tout l\'historique ?')) {
      setMessages(INITIAL_MESSAGES)
      localStorage.setItem('chatMessages', JSON.stringify(INITIAL_MESSAGES))
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

      <div className="row flex-grow-1 mb-4">
        <div className="col-12 col-md-8 mx-auto">
          <div className="card h-100 d-flex flex-column" style={{ minHeight: '60vh' }}>
            <div className="card-header bg-primary text-white p-3 d-flex align-items-center">
              <i className="ti ti-message-chatbot fs-4 me-2"></i>
              <h5 className="mb-0 text-white">Chat RH en direct</h5>
            </div>
            
            <div className="card-body flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3" style={{ backgroundColor: '#f8f9fa', maxHeight: '500px' }}>
              {messages.map((msg) => (
                <div key={msg.id} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div 
                    className={`p-3 rounded-3 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white rounded-bottom-end-0' : 'bg-white border rounded-bottom-start-0'}`}
                    style={{ maxWidth: '75%' }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
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
                />
                <button type="submit" className="btn btn-primary rounded-circle btn-icon" disabled={!input.trim()}>
                  <i className="ti ti-send"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
