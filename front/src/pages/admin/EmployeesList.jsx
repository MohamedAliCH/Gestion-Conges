import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '@/components/layout/Footer'
import api from '@/services/api'

export default function EmployeesList() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/admin/employes')
      setEmployees(response.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (id) => {
    if(window.confirm('Voulez-vous vraiment désactiver cet employé ?')) {
      try {
        await api.delete(`/api/admin/employes/${id}`)
        fetchEmployees() // refresh list
      } catch (error) {
        console.error('Error deactivating employee', error)
      }
    }
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 className="fs-3 mb-1">Liste des Employés</h1>
            <p className="mb-0 text-secondary">Gérer les comptes employés</p>
          </div>
          <Link to="/admin/add-employee" className="btn btn-primary">
            + Ajouter Employé
          </Link>
        </div>
      </div>

      <div className="row mb-6">
        <div className="col-12">
          <div className="card">
            <div className="table-responsive">
              <table className="table mb-0 table-hover text-nowrap align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="border-0">Nom</th>
                    <th className="border-0">Prénom</th>
                    <th className="border-0">Email</th>
                    <th className="border-0">Rôle</th>
                    <th className="border-0">Statut</th>
                    <th className="border-0 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-4">Chargement...</td></tr>
                  ) : employees.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4">Aucun employé trouvé.</td></tr>
                  ) : (
                    employees.map(emp => (
                      <tr key={emp.id}>
                        <td>{emp.nom}</td>
                        <td>{emp.prenom}</td>
                        <td>{emp.email}</td>
                        <td>
                          <span className={`badge bg-${emp.role === 'ROLE_ADMIN' ? 'danger' : 'info'}-subtle text-${emp.role === 'ROLE_ADMIN' ? 'danger' : 'info'}`}>
                            {emp.role === 'ROLE_ADMIN' ? 'Admin' : 'Employé'}
                          </span>
                        </td>
                        <td>
                          {emp.active ? (
                            <span className="badge bg-success-subtle text-success">Actif</span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-secondary">Inactif</span>
                          )}
                        </td>
                        <td className="text-end">
                          {emp.active && (
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeactivate(emp.id)}>
                              Désactiver
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
