import { createContext, useContext, useState, useEffect } from 'react'
import { DOCUMENTS_INITIAL } from '@/data/hrData'
import api from '@/services/api'
import { useToast } from '@/context/ToastContext'

const EmployeContext = createContext(null)

const mapBackendToFrontendEmploye = (e) => ({
  id: e.id,
  prenom: e.prenom,
  nom: e.nom,
  email: e.email,
  telephone: e.phone || '',
  departement: e.departement || 'Informatique',
  poste: e.poste || (e.role === 'ROLE_ADMIN' ? 'Responsable RH' : 'Développeur'),
  dateEmbauche: e.dateEmbauche || e.createdAt || '',
  statut: e.active ? 'Actif' : 'Inactif',
  role: e.role === 'ROLE_ADMIN' ? 'Admin' : 'Employé',
  soldeConges: { annuel: 0, maladie: 8, personnel: 0 },
  soldeAnnuel: e.soldeAnnuel ?? 0,
  soldeMaladie: e.soldeMaladie ?? 8,
  cin: e.cin,
  address: e.address || '',
  generatedPassword: e.generatedPassword || '',
  tempPassword: e.tempPassword || null,
  salaire: e.salaire
})

const mapBackendToFrontendConge = (c) => ({
  id: c.id,
  employeNom: c.employeNom || 'Employé inconnu',
  type: c.type,
  du: c.from,
  au: c.to,
  jours: c.days,
  motif: c.reason || '',
  refusMotif: c.refusMotif || '',
  soumis: c.from || '',
  statut: c.status
})

export function EmployeProvider({ children }) {
  const [employes, setEmployes] = useState([])
  const [conges, setConges] = useState([])
  const [documents, setDocuments] = useState(DOCUMENTS_INITIAL)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const fetchAllData = async () => {
    try {
      const [empRes, congesRes] = await Promise.all([
        api.get('/api/admin/employes'),
        api.get('/api/admin/conges'),
      ]);
      setEmployes(empRes.data.map(mapBackendToFrontendEmploye));
      setConges(congesRes.data.map(mapBackendToFrontendConge));
    } catch (err) {
      if (err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('firstLogin');
        window.location.href = '/signin';
        return;
      }
      console.error("Failed to fetch admin data from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const ajouterEmploye = async (emp) => {
    try {
      const payload = {
        prenom: emp.prenom,
        nom: emp.nom,
        email: emp.email,
        phone: emp.telephone || '',
        role: emp.role === 'ROLE_ADMIN' || emp.role === 'Admin' ? 'ROLE_ADMIN' : 'ROLE_EMPLOYE',
        cin: emp.cin || Math.floor(10000000 + Math.random() * 90000000).toString(),
        address: emp.address || '',
        departement: emp.departement || 'Informatique',
        poste: emp.poste || 'Développeur',
        dateEmbauche: emp.dateEmbauche || new Date().toISOString().slice(0, 10),
        salaire: emp.salaire ? Number(emp.salaire) : null
      };
      const response = await api.post('/api/admin/employes', payload);
      setEmployes(prev => [...prev, mapBackendToFrontendEmploye(response.data)]);
      const passMsg = response.data.generatedPassword 
        ? ` — Mot de passe temporaire : ${response.data.generatedPassword}`
        : '';
      toast.success(`Employé ${emp.prenom} ${emp.nom} créé avec succès${passMsg} !`, 10000);
    } catch (err) {
      console.error("Failed to add employee:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.erreur || err.response?.data?.error;
      toast.error(serverMsg || "Erreur lors de la création de l'employé.");
      throw err;
    }
  }

  const modifierEmploye = async (emp) => {
    try {
      const payload = {
        prenom: emp.prenom,
        nom: emp.nom,
        email: emp.email,
        phone: emp.telephone || '',
        role: emp.role === 'ROLE_ADMIN' || emp.role === 'Admin' ? 'ROLE_ADMIN' : 'ROLE_EMPLOYE',
        cin: emp.cin || '',
        address: emp.address || '',
        departement: emp.departement || 'Informatique',
        poste: emp.poste || 'Développeur',
        dateEmbauche: emp.dateEmbauche || '',
        salaire: emp.salaire ? Number(emp.salaire) : null
      };
      const response = await api.put(`/api/admin/employes/${emp.id}`, payload);
      setEmployes(prev => prev.map(e => (e.id === emp.id ? mapBackendToFrontendEmploye(response.data) : e)));
      toast.success("Informations de l'employé enregistrées !");
    } catch (err) {
      console.error("Failed to update employee:", err);
      const serverMsg = err.response?.data?.message || err.response?.data?.erreur || err.response?.data?.error;
      toast.error(serverMsg || "Erreur lors de la modification de l'employé.");
      throw err;
    }
  }

  const desactiverEmploye = async (id) => {
    try {
      await api.delete(`/api/admin/employes/${id}`);
      setEmployes(prev =>
        prev.map(e =>
          e.id === id
            ? { ...e, statut: e.statut === 'Actif' ? 'Inactif' : 'Actif' }
            : e
        )
      );
      toast.success("Le statut de l'employé a été mis à jour !");
    } catch (err) {
      console.error("Failed to toggle employee status:", err);
      toast.error("Erreur lors du changement de statut.");
      throw err;
    }
  }

  const approuverConge = async (id) => {
    try {
      const response = await api.put(`/api/admin/conges/${id}/approuver`);
      setConges(prev =>
        prev.map(c => (c.id === id ? mapBackendToFrontendConge(response.data) : c))
      );
      toast.success("La demande de congé a été approuvée !");
    } catch (err) {
      console.error("Failed to approve leave request:", err);
      toast.error("Erreur lors de l'approbation du congé.");
    }
  }

  const refuserConge = async (id, motif) => {
    try {
      const response = await api.put(`/api/admin/conges/${id}/refuser`, { reason: motif });
      setConges(prev =>
        prev.map(c => (c.id === id ? mapBackendToFrontendConge(response.data) : c))
      );
      toast.warning("La demande de congé a été refusée.");
    } catch (err) {
      console.error("Failed to reject leave request:", err);
      toast.error("Erreur lors du refus du congé.");
    }
  }

  const ajouterDocument = doc => {
    setDocuments(prev => [{ ...doc, id: Date.now() }, ...prev])
    toast.success("Document ajouté avec succès !");
  }

  const supprimerDocument = id => {
    setDocuments(prev => prev.filter(d => d.id !== id))
    toast.success("Document supprimé.");
  }

  return (
    <EmployeContext.Provider
      value={{
        employes, setEmployes, ajouterEmploye, modifierEmploye, desactiverEmploye,
        conges, setConges, approuverConge, refuserConge,
        documents, ajouterDocument, supprimerDocument,
        loading
      }}
    >
      {children}
    </EmployeContext.Provider>
  )
}

export function useEmploye() {
  return useContext(EmployeContext)
}
