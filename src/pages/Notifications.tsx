import { useState } from 'react'
import { Bell, CheckCheck, Check } from 'lucide-react'
import { usePatient } from '@/context/Patient'
import { PageHeading, Empty, Feedback } from '@/components/ui'
import { errorMessage } from '@/lib/firebase'

export default function Notifications() {
  const { notices, markRead } = usePatient()
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const unread = notices.filter((n) => !n.read)
  const items = [...notices]
    .filter((n) => !onlyUnread || !n.read)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  async function read(ids: string[]) {
    setBusy(true)
    setError('')
    try {
      await Promise.all(ids.map(markRead))
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="PARA VOCÊ NÃO PERDER NADA"
        title="Notificações"
        description="Confirmações e avisos do seu espaço de cuidado."
        action={
          <button
            className="button"
            disabled={busy || !unread.length}
            onClick={() => read(unread.map((n) => n.id))}
          >
            <CheckCheck size={17} />
            Marcar todas como lidas
          </button>
        }
      />
      <div className="tabs">
        <button
          className={!onlyUnread ? 'active' : ''}
          onClick={() => setOnlyUnread(false)}
        >
          Todas
        </button>
        <button
          className={onlyUnread ? 'active' : ''}
          onClick={() => setOnlyUnread(true)}
        >
          Não lidas ({unread.length})
        </button>
      </div>
      <Feedback message={error} />
      <section className="panel notification-list">
        {items.map((n) => (
          <article className={`notice ${n.read ? '' : 'unread'}`} key={n.id}>
            <span className="stat-icon">
              <Bell size={20} />
            </span>
            <div>
              <h2>{n.title}</h2>
              <p>{n.body}</p>
              <time dateTime={n.createdAt}>
                {new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(n.createdAt))}
              </time>
            </div>
            {!n.read && (
              <button
                className="icon-button"
                onClick={() => read([n.id])}
                disabled={busy}
                aria-label={`Marcar como lida: ${n.title}`}
              >
                <Check size={18} />
              </button>
            )}
          </article>
        ))}
        {!items.length && (
          <Empty
            icon={Bell}
            title="Tudo tranquilo por aqui"
            description="Quando houver novidades, você encontra os avisos neste espaço."
          />
        )}
      </section>
      <p className="small muted mt-4">
        Os avisos ficam disponíveis dentro do aplicativo. Não há envio por SMS,
        e-mail ou push em segundo plano.
      </p>
    </>
  )
}
