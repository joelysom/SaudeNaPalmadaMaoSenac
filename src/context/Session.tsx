import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

type Session = {
  user: User | null
  demo: boolean
  loading: boolean
  enterDemo: () => void
  logout: () => Promise<void>
}
const Context = createContext<Session | null>(null)
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [demo, setDemo] = useState(
    () => sessionStorage.getItem('snpdm-demo') === 'true',
  )
  const [loading, setLoading] = useState(true)
  useEffect(
    () =>
      onAuthStateChanged(auth, (current) => {
        setUser(current)
        setLoading(false)
        if (current) {
          setDemo(false)
          sessionStorage.removeItem('snpdm-demo')
        }
      }),
    [],
  )
  function enterDemo() {
    sessionStorage.setItem('snpdm-demo', 'true')
    setDemo(true)
  }
  async function logout() {
    await signOut(auth)
    sessionStorage.removeItem('snpdm-demo')
    setDemo(false)
    sessionStorage.removeItem('snpdm-demo-data')
  }
  return (
    <Context.Provider value={{ user, demo, loading, enterDemo, logout }}>
      {children}
    </Context.Provider>
  )
}
export function useSession() {
  const context = useContext(Context)
  if (!context) throw new Error('Sessão indisponível.')
  return context
}
