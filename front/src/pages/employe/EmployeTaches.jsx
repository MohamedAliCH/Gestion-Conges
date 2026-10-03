import { useState, useMemo } from 'react'
import Footer from '@/components/layout/Footer'

const INITIAL_TASKS = [
  { id: 1, title: 'Examen du rapport T2', project: 'Finance', due: '2026-06-18', priority: 'Haute', status: 'En cours' },
  { id: 2, title: 'Préparation du standup d\'équipe', project: 'Interne', due: '2026-06-19', priority: 'Moyenne', status: 'En attente' },
  { id: 3, title: 'Diapositives de présentation client', project: 'Ventes', due: '2026-06-20', priority: 'Haute', status: 'En attente' },
  { id: 4, title: 'Mise à jour des docs d\'intégration', project: 'RH', due: '2026-06-22', priority: 'Basse', status: 'Non commencé' },
  { id: 5, title: 'Rétrospective de sprint', project: 'Ingénierie', due: '2026-06-25', priority: 'Moyenne', status: 'Non commencé' },
  { id: 6, title: 'Prévisions budgétaires', project: 'Finance', due: '2026-06-30', priority: 'Haute', status: 'Non commencé' },
  { id: 7, title: 'Test d\'intégration de l\'API', project: 'Ingénierie', due: '2026-07-02', priority: 'Moyenne', status: 'En cours' },
]

const statusColor = { 'En cours': 'primary', 'En attente': 'warning', 'Non commencé': 'secondary', 'Terminé': 'success' }
const priorityColor = { Haute: 'danger', Moyenne: 'warning', Basse: 'success' }

export default function EmployeTaches() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Toutes')
  const [tasks, setTasks] = useState(INITIAL_TASKS)

  const filtered = useMemo(
    () =>
      tasks.filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'Toutes' || t.status === filter
        return matchSearch && matchFilter
      }),
    [tasks, search, filter]
  )

  const markDone = id =>
    setTasks(ts => ts.map(t => (t.id === id ? { ...t, status: 'Terminé' } : t)))

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Mes Tâches</h1>
          <p className="text-secondary mb-0">Suivez et gérez vos tâches assignées</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="d-flex gap-2 mb-3 flex-wrap justify-content-between">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher des tâches…"
          style={{ maxWidth: 250 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="d-flex gap-2">
          {['Toutes', 'En cours', 'En attente', 'Non commencé', 'Terminé'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card table-responsive">
        <table className="table mb-0 table-hover text-nowrap">
          <thead className="table-light">
            <tr>
              <th>Tâche</th>
              <th>Projet</th>
              <th>Date d'échéance</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">Aucune tâche trouvée.</td>
              </tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} className="align-middle">
                  <td className="fw-medium">{t.title}</td>
                  <td>{t.project}</td>
                  <td>{t.due}</td>
                  <td>
                    <span className={`badge bg-${priorityColor[t.priority]}-subtle text-${priorityColor[t.priority]} border border-${priorityColor[t.priority]}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${statusColor[t.status] ?? 'secondary'}-subtle text-${statusColor[t.status] ?? 'secondary'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    {t.status !== 'Terminé' && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => markDone(t.id)}
                      >
                        Terminer
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  )
}
