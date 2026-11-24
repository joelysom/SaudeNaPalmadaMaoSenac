import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clock3, MapPin, Download, CalendarDays } from 'lucide-react'
import { usePatient } from '@/context/Patient'
import { type Appointment, formatDate, slotIsFuture } from '@/domain/models'
import { Empty, Feedback, Modal, PageHeading, Status } from '@/components/ui'
import { errorMessage } from '@/lib/firebase'

function downloadCalendar(a: Appointment) {
  const escape = (value: string) =>
    value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
  const start = new Date(`${a.date}T${a.time}:00`)
  const end = new Date(start.getTime() + 30 * 60000)
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  const text = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SNPDM//Consultas//PT-BR',
    'BEGIN:VEVENT',
    `UID:${a.id}@snpdm`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(`Consulta: ${a.specialty}`)}`,
    `LOCATION:${escape(a.address)}`,
    `DESCRIPTION:${escape(`${a.professional} - ${a.unit}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(
    new Blob([text], { type: 'text/calendar;charset=utf-8' }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'minha-consulta.ics'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export default function Appointments() {
  const { appointments, cancel } = usePatient()
  const [tab, setTab] = useState('upcoming')
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const items = appointments
    .filter((a) =>
      tab === 'cancelled'
        ? a.status === 'cancelled'
        : a.status === 'confirmed' &&
          (tab === 'upcoming' ? slotIsFuture(a) : !slotIsFuture(a)),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  async function confirm() {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      await cancel(selected)
      setSelected(null)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="SUA AGENDA"
        title="Minhas consultas"
        description="Um lugar para acompanhar seus próximos cuidados."
        action={
          <Link className="button primary" to="/consultas/nova">
            <Plus size={18} />
            Marcar consulta
          </Link>
        }
      />
      <div className="tabs" aria-label="Filtrar consultas">
        {[
          ['upcoming', 'Próximas'],
          ['past', 'Anteriores'],
          ['cancelled', 'Canceladas'],
        ].map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? 'active' : ''}
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="record-list">
        {items.map((a) => (
          <article className="panel appointment-card" key={a.id}>
            <div className="appointment-card-main">
              <div className="date-tile">
                <strong>{a.date.slice(8)}</strong>
                <span>
                  {formatDate(a.date, { month: 'short' }).replace('.', '')}
                </span>
              </div>
              <div className="record-info">
                <Status value={a.status} />
                <h2>{a.specialty}</h2>
                <p>{a.professional}</p>
                <div className="appointment-meta">
                  <span>
                    <CalendarDays size={16} />
                    {formatDate(a.date, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span>
                    <Clock3 size={16} />
                    {a.time}
                  </span>
                  <span>
                    <MapPin size={16} />
                    {a.unit}
                  </span>
                </div>
                <p className="small muted">{a.address}</p>
              </div>
            </div>
            {a.status === 'confirmed' && slotIsFuture(a) && (
              <div className="record-actions">
                <button className="button" onClick={() => downloadCalendar(a)}>
                  <Download size={16} />
                  Adicionar à agenda
                </button>
                <button
                  className="text-button danger"
                  onClick={() => {
                    setSelected(a)
                    setError('')
                  }}
                >
                  Cancelar consulta
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {!items.length && (
        <section className="panel">
          <Empty
            title={
              tab === 'upcoming'
                ? 'Nenhuma consulta por enquanto'
                : 'Nenhuma consulta nesta lista'
            }
            description="Seus agendamentos vão aparecer aqui para você acompanhar com tranquilidade."
            action={
              tab === 'upcoming' && (
                <Link className="button primary" to="/consultas/nova">
                  Marcar minha primeira consulta
                </Link>
              )
            }
          />
        </section>
      )}
      {selected && (
        <Modal
          title="Cancelar esta consulta?"
          onClose={() => {
            if (!busy) setSelected(null)
          }}
        >
          <p className="muted">
            {selected.specialty} · {formatDate(selected.date)} às{' '}
            {selected.time}.
          </p>
          <p className="mt-4">
            O horário será liberado para outra pessoa. Para mudar a data,
            cancele e faça um novo agendamento.
          </p>
          <Feedback message={error} />
          <div className="modal-actions">
            <button
              className="button"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Manter consulta
            </button>
            <button
              className="button destructive"
              disabled={busy}
              onClick={confirm}
            >
              {busy ? 'Cancelando…' : 'Sim, cancelar'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
