import { useState, useRef, useEffect } from 'react'
import Footer from '@/components/layout/Footer'
import api from '@/services/api'

const ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function mimeToLabel(mimeType) {
  if (!mimeType) return 'Fichier'
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('word') || mimeType.includes('msword')) return 'Word'
  return 'Fichier'
}

function statusBadge(status) {
  const map = {
    INDEXED: { cls: 'success', label: 'Indexé' },
    PROCESSING: { cls: 'warning', label: 'En cours…' },
    ERROR: { cls: 'danger', label: 'Erreur' },
  }
  const s = map[status] ?? { cls: 'secondary', label: status }
  return <span className={`badge bg-${s.cls}-subtle text-${s.cls} border border-${s.cls}-subtle`}>{s.label}</span>
}

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [dragging, setDragging] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [toast, setToast] = useState(null)
  const fileRef = useRef()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/api/documents')
      setDocuments(res.data)
    } catch {
      showToast('Impossible de charger les documents.', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocuments() }, [])

  const handleFiles = async (files) => {
    const allowed = Array.from(files).filter(f =>
      f.type === 'application/pdf' ||
      f.type === 'application/msword' ||
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    if (!allowed.length) {
      showToast('Formats acceptés : PDF, Word (.doc, .docx)', 'warning')
      return
    }

    setUploading(true)
    let ok = 0
    for (const file of allowed) {
      try {
        const form = new FormData()
        form.append('file', file)
        await api.post('/api/documents/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        ok++
      } catch (err) {
        const msg = err.response?.data?.message || `Erreur lors de l'upload de ${file.name}`
        showToast(msg, 'danger')
      }
    }
    setUploading(false)
    if (ok > 0) {
      showToast(`${ok} document(s) uploadé(s) avec succès — indexation RAG en cours.`)
      fetchDocuments()
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/documents/${id}`)
      setDocuments(d => d.filter(doc => doc.id !== id))
      showToast('Document supprimé.')
    } catch {
      showToast('Erreur lors de la suppression.', 'danger')
    } finally {
      setConfirmId(null)
    }
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const openPreview = (id) => {
    window.open(`http://localhost:8080/api/admin/documents/${id}/preview`, '_blank')
  }

  const filtered = documents.filter(d =>
    (d.fileName ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Base documentaire</h1>
          <p className="text-secondary mb-0">Déposez et gérez les documents RH (PDF, Word)</p>
        </div>
      </div>

      {toast && (
        <div className={`alert alert-${toast.type} py-2 small mb-3`}>{toast.msg}</div>
      )}

      {/* Upload zone */}
      <div className="card mb-4">
        <div className="card-header bg-white px-4 py-3">
          <h5 className="mb-0">Ajouter des documents</h5>
        </div>
        <div className="card-body p-4">
          <div
            className={`border-2 border-dashed rounded-3 p-5 text-center ${dragging ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle'}`}
            style={{ borderStyle: 'dashed', cursor: uploading ? 'not-allowed' : 'pointer' }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={uploading ? undefined : handleDrop}
            onClick={() => !uploading && fileRef.current.click()}
          >
            {uploading ? (
              <>
                <span className="spinner-border text-primary mb-2" />
                <p className="mb-0 fw-medium">Upload en cours…</p>
              </>
            ) : (
              <>
                <i className={`ti ti-cloud-upload fs-1 mb-2 ${dragging ? 'text-primary' : 'text-secondary'}`} />
                <p className="mb-1 fw-medium">Glissez-déposez vos fichiers ici</p>
                <p className="text-secondary small mb-3">Formats acceptés : PDF, Word (.doc, .docx) — max 10 MB</p>
                <button type="button" className="btn btn-primary btn-sm"
                  onClick={e => { e.stopPropagation(); fileRef.current.click() }}>
                  <i className="ti ti-upload me-2" />Parcourir les fichiers
                </button>
              </>
            )}
            <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden
              onChange={e => handleFiles(e.target.files)} />
          </div>
        </div>
      </div>

      {/* Document list */}
      <div className="d-flex gap-2 mb-3 flex-wrap justify-content-between align-items-center">
        <input type="text" className="form-control" placeholder="Rechercher un document…"
          style={{ maxWidth: 300 }} value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchDocuments}>
          <i className="ti ti-refresh me-1" />Actualiser
        </button>
      </div>

      <div className="card table-responsive mb-4">
        <table className="table mb-0 table-hover text-nowrap">
          <thead className="table-light">
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Statut RAG</th>
              <th>Ajouté par</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4"><span className="spinner-border spinner-border-sm me-2" />Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-muted">Aucun document trouvé.</td></tr>
            ) : filtered.map(doc => {
              const label = mimeToLabel(doc.fileType)
              const iconClass = label === 'PDF' ? 'ti-file-type-pdf text-danger' : label === 'Word' ? 'ti-file-type-doc text-primary' : 'ti-file text-secondary'
              return (
                <tr key={doc.id} className="align-middle">
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`ti ${iconClass} fs-4`} />
                      <span className="fw-medium" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {doc.fileName}
                      </span>
                    </div>
                  </td>
                  <td><span className="badge bg-light text-dark border">{label}</span></td>
                  <td>{statusBadge(doc.status)}</td>
                  <td>{doc.uploadedBy ?? '—'}</td>
                  <td>{doc.uploadDate ?? '—'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary me-1" title="Aperçu"
                      onClick={() => openPreview(doc.id)}>
                      <i className="ti ti-eye" />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" title="Supprimer"
                      onClick={() => setConfirmId(doc.id)}>
                      <i className="ti ti-trash" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {confirmId && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Supprimer le document</h5>
                <button className="btn-close" onClick={() => setConfirmId(null)} />
              </div>
              <div className="modal-body">
                Cette action supprimera le fichier du disque, de la base de données et de l'index RAG. Elle est irréversible.
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>Annuler</button>
                <button className="btn btn-danger" onClick={() => handleDelete(confirmId)}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
