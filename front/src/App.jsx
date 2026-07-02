import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext'
import { EmployeProvider } from './context/EmployeContext'
import { ToastProvider } from './context/ToastContext'


// Layouts
import Layout from './components/layout/Layout'
import EmployeLayout from './components/layout/EmployeLayout'

// Shared pages
import RoleSelect from './pages/RoleSelect'
import SignIn from './pages/SignIn'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'

// Admin HR pages
import Employes from './pages/admin/Employes'
import EmployeForm from './pages/admin/EmployeForm'
import ValidationConges from './pages/admin/ValidationConges'
import CalendrierAbsences from './pages/admin/CalendrierAbsences'
import Documents from './pages/admin/Documents'
import ChatbotRH from './pages/admin/ChatbotRH'

// Employee pages
import EmployeDashboard from './pages/employe/EmployeDashboard'
import EmployeTaches from './pages/employe/EmployeTaches'

import EmployeDemandeConge from './pages/employe/EmployeDemandeConge'
import EmployeFichePaie from './pages/employe/EmployeFichePaie'
import EmployeProfil from './pages/employe/EmployeProfil'
import Chatbot from './pages/employe/Chatbot'

export default function App() {
  return (
    <SidebarProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing — redirect to login */}
            <Route path="/" element={<Navigate to="/signin" replace />} />

            {/* Auth */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/change-password" element={<ResetPassword />} />

            {/* Admin RH — orange theme */}
            <Route
              path="/admin"
              element={
                <EmployeProvider>
                  <Layout />
                </EmployeProvider>
              }
            >
              <Route index element={<Navigate to="/admin/employes" replace />} />
              <Route path="employes" element={<Employes />} />
              <Route path="employes/nouveau" element={<EmployeForm />} />
              <Route path="employes/:id/modifier" element={<EmployeForm />} />
              <Route path="conges" element={<ValidationConges />} />
              <Route path="calendrier" element={<CalendrierAbsences />} />
              <Route path="documents" element={<Documents />} />
              <Route path="chatbot" element={<ChatbotRH />} />
              <Route path="profil" element={<Profile />} />
            </Route>

            {/* Employee dashboard — navy blue theme */}
            <Route path="/employe" element={<EmployeLayout />}>
              <Route index element={<EmployeDashboard />} />
              <Route path="taches" element={<EmployeTaches />} />

              <Route path="demande-conge" element={<EmployeDemandeConge />} />
              <Route path="fiche-paie" element={<EmployeFichePaie />} />
              <Route path="profil" element={<EmployeProfil />} />
              <Route path="chatbot" element={<Chatbot />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </SidebarProvider>
  )
}

