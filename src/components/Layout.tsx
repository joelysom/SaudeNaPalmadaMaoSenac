import { useEffect, useState } from 'react'
import {
  NavLink,
  Outlet,
  useNavigate,
  Link,
  useLocation,
} from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  FlaskConical,
  Bell,
  UserRound,
  CircleHelp,
  LogOut,
  Menu,
  X,
  Accessibility,
  Download,
  WifiOff,
  Check,
} from 'lucide-react'
import { useSession } from '@/context/Session'
import { usePatient } from '@/context/Patient'
import { errorMessage } from '@/lib/firebase'
import { Feedback, Modal } from './ui'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}
const links = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/consultas', label: 'Minhas consultas', icon: CalendarDays },
  { to: '/exames', label: 'Meus exames', icon: FlaskConical },
  { to: '/notificacoes', label: 'Notificações', icon: Bell },
  { to: '/perfil', label: 'Meu perfil', icon: UserRound },
]
export default function Layout() {
  const { demo, user, logout } = useSession()
  const patient = usePatient()
  const navigate = useNavigate()
  const location = useLocation()
  const [menu, setMenu] = useState(false)
  const [access, setAccess] = useState(false)
  const [install, setInstall] = useState<InstallEvent | null>(null)
  const [online, setOnline] = useState(navigator.onLine)
  const [error, setError] = useState('')
  const [large, setLarge] = useState(
    () => localStorage.getItem('snpdm-large') === 'true',
  )
  const [contrast, setContrast] = useState(
    () => localStorage.getItem('snpdm-contrast') === 'true',
  )
  useEffect(() => {
    document.documentElement.classList.toggle('large-text', large)
    localStorage.setItem('snpdm-large', String(large))
  }, [large])
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', contrast)
    localStorage.setItem('snpdm-contrast', String(contrast))
  }, [contrast])
  useEffect(() => {
    const capture = (e: Event) => {
      e.preventDefault()
      setInstall(e as InstallEvent)
    }
    const connectivity = () => setOnline(navigator.onLine)
    window.addEventListener('beforeinstallprompt', capture)
    window.addEventListener('online', connectivity)
    window.addEventListener('offline', connectivity)
    return () => {
      window.removeEventListener('beforeinstallprompt', capture)
      window.removeEventListener('online', connectivity)
      window.removeEventListener('offline', connectivity)
    }
  }, [])
  const name = patient.profile.name || user?.displayName || 'Você'
  const unread = patient.notices.filter((n) => !n.read).length
  async function exit() {
    try {
      await logout()
      navigate('/entrar')
    } catch (e) {
      setError(errorMessage(e))
    }
  }
  async function installApp() {
    if (!install) return
    await install.prompt()
    const choice = await install.userChoice
    if (choice.outcome === 'accepted') setInstall(null)
  }
  function speak() {
    if (!('speechSynthesis' in window)) {
      setError('A leitura por voz não está disponível neste navegador.')
      return
    }
    window.speechSynthesis.cancel()
    const text = document.querySelector('main')?.innerText || ''
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    window.speechSynthesis.speak(utterance)
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir para o conteúdo
      </a>
      {menu && (
        <button
          className="nav-overlay"
          aria-label="Fechar menu"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? 'open' : ''}`}>
        <Link className="brand" to="/" onClick={() => setMenu(false)}>
          <img src="/logo.png" alt="Saúde na Palma da Mão" />
        </Link>
        <span className="nav-caption">SEU ESPAÇO DE CUIDADO</span>
        <nav aria-label="Menu principal">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenu(false)}
            >
              <Icon size={20} strokeWidth={1.7} />
              {label}
              {to === '/notificacoes' && unread > 0 && (
                <span className="nav-badge">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/ajuda" onClick={() => setMenu(false)}>
            <CircleHelp size={20} />
            Precisa de ajuda?
          </NavLink>
          <button onClick={() => setAccess(true)}>
            <Accessibility size={20} />
            Acessibilidade
          </button>
          {install && (
            <button onClick={installApp}>
              <Download size={20} />
              Instalar aplicativo
            </button>
          )}
          <button onClick={exit}>
            <LogOut size={20} />
            {demo ? 'Sair da demonstração' : 'Sair da conta'}
          </button>
          <div className="sidebar-note">
            <span className="small-brand">Um cuidado de cada vez.</span>
            <small>Saúde na Palma da Mão</small>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <span className="breadcrumb">
            Meu espaço <span>/</span>{' '}
            {location.pathname === '/consultas/nova'
              ? 'Marcar consulta'
              : links.find((l) => l.to === location.pathname)?.label || 'Ajuda'}
          </span>
          <div className="topbar-right">
            <button
              className="icon-button access-top"
              onClick={() => setAccess(true)}
              aria-label="Acessibilidade"
            >
              <Accessibility size={20} />
            </button>
            <Link
              className="icon-button notification-button"
              to="/notificacoes"
              aria-label={`Notificações, ${unread} não lidas`}
            >
              <Bell size={20} />
              {unread > 0 && <i />}
            </Link>
            <span className="topbar-separator" />
            <Link className="user-link" to="/perfil">
              <span className="avatar">
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <span>
                {name.split(' ')[0]}
                <small>{demo ? 'Demonstração' : 'Minha conta'}</small>
              </span>
            </Link>
          </div>
        </header>
        {demo && (
          <div className="demo-banner">
            Você está em uma demonstração. Os dados e agendamentos são
            fictícios.<button onClick={exit}>Entrar com minha conta</button>
          </div>
        )}
        {!online && (
          <div className="offline-banner" role="status">
            <WifiOff size={16} />
            Você está offline. Conecte-se para salvar ou consultar dados
            atualizados.
          </div>
        )}
        <main id="main" className="main-content" tabIndex={-1}>
          <Feedback message={error || patient.error} />
          {patient.loading ? (
            <div className="loading-state" role="status">
              <span className="spinner" />
              Carregando seu espaço…
            </div>
          ) : (
            <Outlet />
          )}
        </main>
        <footer className="app-footer">
          <span>Feito para cuidar de você.</span>
          <Link to="/privacidade">Privacidade e termos</Link>
        </footer>
      </div>
      {access && (
        <Modal
          title="Do seu jeito"
          onClose={() => {
            window.speechSynthesis?.cancel()
            setAccess(false)
          }}
        >
          <p className="muted">Ajuste a leitura para ficar mais confortável.</p>
          <div className="settings-list">
            <label>
              <span>
                Texto ampliado<small>Aumenta o tamanho das letras.</small>
              </span>
              <input
                type="checkbox"
                checked={large}
                onChange={(e) => setLarge(e.target.checked)}
              />
            </label>
            <label>
              <span>
                Alto contraste<small>Destaca textos, campos e botões.</small>
              </span>
              <input
                type="checkbox"
                checked={contrast}
                onChange={(e) => setContrast(e.target.checked)}
              />
            </label>
          </div>
          <button className="button primary full" onClick={speak}>
            <Accessibility size={18} />
            Ler esta página em voz alta
          </button>
          <button
            className="button full mt-3"
            onClick={() => window.speechSynthesis?.cancel()}
          >
            Parar leitura
          </button>
          <p className="small muted mt-4">
            <Check size={14} className="inline-icon" />
            Suas preferências ficam salvas neste navegador.
          </p>
        </Modal>
      )}
    </div>
  )
}
