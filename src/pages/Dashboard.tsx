import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Plus,
  Clock3,
  MapPin,
  FlaskConical,
  ChevronRight,
  Heart,
  CircleHelp,
  ClipboardList,
} from 'lucide-react'
import { usePatient } from '@/context/Patient'
import { useSession } from '@/context/Session'
import { formatDate, slotIsFuture } from '@/domain/models'
import { Empty, Status } from '@/components/ui'

export default function Dashboard() {
  const { profile, appointments, exams, notices } = usePatient()
  const { user } = useSession()
  const next = appointments
    .filter((a) => a.status === 'confirmed' && slotIsFuture(a))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]
  const pending = exams.filter((e) => e.status !== 'completed')
  const name = (profile.name || user?.displayName || '').split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  return (
    <>
      <div className="dashboard-greeting">
        <div>
          <p className="eyebrow">
            {new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(new Date())}
          </p>
          <h1>
            {greeting}
            {name ? `, ${name}` : ''}
            <span className="greeting-dot">.</span>
          </h1>
          <p className="muted">
            Como você está hoje? Vamos cuidar do que importa.
          </p>
        </div>
        <Link to="/consultas/nova" className="button primary">
          <Plus size={18} />
          Marcar consulta
        </Link>
      </div>
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="eyebrow">CUIDAR TAMBÉM É SE ORGANIZAR</span>
          <h2>
            Sua saúde merece
            <br />
            um lugar na sua rotina.
          </h2>
          <p>
            Consultas, exames e próximos passos.
            <br />
            Tudo pertinho de você.
          </p>
          <Link className="button" to="/consultas">
            Ver minhas consultas
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="care-illustration" aria-hidden="true">
          <div className="illustration-orbit" />
          <div className="paper-calendar">
            <div className="calendar-binding">
              <i />
              <i />
            </div>
            <div className="calendar-top">UM DIA DE CADA VEZ</div>
            <Heart size={54} strokeWidth={1.3} />
            <div className="calendar-grid">
              {Array.from({ length: 14 }, (_, i) => (
                <span className={i === 9 ? 'chosen' : ''} key={i}>
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
          <span className="care-tag">
            <Heart size={16} fill="currentColor" />
            Você em primeiro lugar
          </span>
        </div>
      </section>
      <div className="stats-row">
        <Link to="/consultas">
          <span className="stat-icon">
            <CalendarDays size={22} />
          </span>
          <div>
            <b>
              {
                appointments.filter(
                  (a) => a.status === 'confirmed' && slotIsFuture(a),
                ).length
              }
            </b>
            <span>Consultas agendadas</span>
          </div>
          <ChevronRight size={17} />
        </Link>
        <Link to="/exames">
          <span className="stat-icon lavender">
            <FlaskConical size={22} />
          </span>
          <div>
            <b>{pending.length}</b>
            <span>Exames para acompanhar</span>
          </div>
          <ChevronRight size={17} />
        </Link>
        <Link to="/notificacoes">
          <span className="stat-icon amber">
            <ClipboardList size={22} />
          </span>
          <div>
            <b>{notices.filter((n) => !n.read).length}</b>
            <span>Avisos não lidos</span>
          </div>
          <ChevronRight size={17} />
        </Link>
      </div>
      <div className="dashboard-columns">
        <section className="panel">
          <div className="section-heading">
            <h2>Sua próxima consulta</h2>
            <Link to="/consultas">
              Ver todas
              <ChevronRight size={15} />
            </Link>
          </div>
          {next ? (
            <>
              <div className="appointment-preview">
                <div className="date-tile">
                  <strong>{next.date.slice(8)}</strong>
                  <span>
                    {formatDate(next.date, { month: 'short' }).replace('.', '')}
                  </span>
                </div>
                <div>
                  <Status value={next.status} />
                  <h3>{next.specialty}</h3>
                  <p>{next.professional}</p>
                </div>
              </div>
              <div className="appointment-meta">
                <span>
                  <Clock3 size={17} />
                  {formatDate(next.date)} · {next.time}
                </span>
                <span>
                  <MapPin size={17} />
                  {next.unit}
                </span>
              </div>
              <Link className="button full" to="/consultas">
                Ver detalhes da consulta
              </Link>
            </>
          ) : (
            <Empty
              title="Sua agenda está livre"
              description="Quando você marcar uma consulta, ela aparece por aqui."
              action={
                <Link className="text-button" to="/consultas/nova">
                  Encontrar um horário
                </Link>
              }
            />
          )}
        </section>
        <section className="panel exams-preview">
          <div className="section-heading">
            <h2>Seus exames</h2>
            <Link to="/exames">
              Ver todos
              <ChevronRight size={15} />
            </Link>
          </div>
          {pending.length ? (
            pending.slice(0, 2).map((exam) => (
              <Link to="/exames" className="exam-preview" key={exam.id}>
                <span className="stat-icon lavender">
                  <FlaskConical size={20} />
                </span>
                <div>
                  <h3>{exam.name}</h3>
                  <p>{exam.date ? formatDate(exam.date) : 'Data a definir'}</p>
                </div>
                <ChevronRight size={17} />
              </Link>
            ))
          ) : (
            <Empty
              icon={FlaskConical}
              title="Tudo em dia por aqui"
              description="Adicione seus pedidos para acompanhar os próximos passos."
            />
          )}
          <div className="soft-note">
            Este espaço ajuda você a se organizar. Os registros de exames são
            adicionados por você.
          </div>
        </section>
      </div>
      <Link to="/ajuda" className="help-strip">
        <span className="help-icon">
          <CircleHelp size={25} />
        </span>
        <div>
          <h3>Precisa de uma mãozinha?</h3>
          <p>Encontre respostas e veja como usar seu espaço.</p>
        </div>
        <ChevronRight size={20} />
      </Link>
    </>
  )
}
