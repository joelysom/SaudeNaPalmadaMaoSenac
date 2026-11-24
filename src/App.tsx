import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider, useSession } from '@/context/Session'
import { PatientProvider } from '@/context/Patient'
import Layout from '@/components/Layout'
import PwaUpdate from '@/components/PwaUpdate'
const Auth = lazy(() => import('@/pages/Auth'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Appointments = lazy(() => import('@/pages/Appointments'))
const Booking = lazy(() => import('@/pages/Booking'))
const Exams = lazy(() => import('@/pages/Exams'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Profile = lazy(() => import('@/pages/Profile'))
const Help = lazy(() => import('@/pages/Help'))
const Privacy = lazy(() => import('@/pages/Privacy'))

function Protected() {
  const { user, demo, loading } = useSession()
  if (loading)
    return (
      <div className="loading-state" role="status">
        Preparando seu espaço…
      </div>
    )
  if (!user && !demo) return <Navigate to="/entrar" replace />
  return (
    <PatientProvider key={demo ? 'demo' : user?.uid}>
      <Layout />
    </PatientProvider>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Suspense
          fallback={
            <div className="loading-state" role="status">
              Carregando…
            </div>
          }
        >
          <Routes>
            <Route path="/entrar" element={<Auth />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route element={<Protected />}>
              <Route index element={<Dashboard />} />
              <Route path="/consultas" element={<Appointments />} />
              <Route path="/consultas/nova" element={<Booking />} />
              <Route path="/exames" element={<Exams />} />
              <Route path="/notificacoes" element={<Notifications />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/ajuda" element={<Help />} />
              <Route
                path="*"
                element={
                  <div className="panel empty">
                    <h1>Página não encontrada</h1>
                    <p>Este endereço não está disponível.</p>
                    <a className="button primary" href="/">
                      Voltar ao início
                    </a>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Suspense>
        <PwaUpdate />
      </SessionProvider>
    </BrowserRouter>
  )
}
