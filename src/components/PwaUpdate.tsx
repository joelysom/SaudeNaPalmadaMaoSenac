import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'

export default function PwaUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('Falha ao registrar o modo offline.', error)
    },
  })
  if (!needRefresh) return null
  return (
    <aside className="update-toast" role="status">
      <RefreshCw size={21} />
      <div>
        <strong>Tem uma versão nova por aqui.</strong>
        <p>Salve suas alterações antes de atualizar.</p>
        <div>
          <button
            className="text-button"
            onClick={() => updateServiceWorker(true)}
          >
            Atualizar agora
          </button>
          <button className="text-button" onClick={() => setNeedRefresh(false)}>
            Depois
          </button>
        </div>
      </div>
    </aside>
  )
}
