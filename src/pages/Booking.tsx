import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  MapPin,
  Search,
  CalendarCheck,
  Clock3,
} from 'lucide-react'
import { usePatient } from '@/context/Patient'
import { type Slot, formatDate } from '@/domain/models'
import { Empty, Feedback, PageHeading } from '@/components/ui'
import { errorMessage } from '@/lib/firebase'

export default function Booking() {
  const { slots, reloadSlots, appointments, book } = usePatient()
  const [loading, setLoading] = useState(true)
  const [specialty, setSpecialty] = useState('')
  const [date, setDate] = useState('')
  const [selected, setSelected] = useState<Slot | null>(null)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    reloadSlots()
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, []) // Load live availability when opening the booking flow.
  const available = slots.filter(
    (s) =>
      !appointments.some(
        (a) =>
          a.status === 'confirmed' &&
          (a.slotId === s.id || (a.date === s.date && a.time === s.time)),
      ),
  )
  const specialties = [...new Set(available.map((s) => s.specialty))]
    .filter((s) =>
      s.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')),
    )
    .sort()
  const dates = [
    ...new Set(
      available.filter((s) => s.specialty === specialty).map((s) => s.date),
    ),
  ].sort()
  async function confirm() {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      await book(selected)
      setDone(true)
    } catch (e) {
      setError(errorMessage(e))
      await reloadSlots().catch(() => {})
    } finally {
      setBusy(false)
    }
  }
  if (done && selected)
    return (
      <section className="panel booking-success">
        <span className="success-circle">
          <Check size={32} />
        </span>
        <p className="eyebrow">TUDO CERTO</p>
        <h1>Seu próximo cuidado está marcado.</h1>
        <p className="muted">
          Você pode acompanhar os detalhes em Minhas consultas.
        </p>
        <div className="confirmation-details">
          <h2>{selected.specialty}</h2>
          <p>{selected.professional}</p>
          <span>
            <CalendarCheck size={18} />
            {formatDate(selected.date)} às {selected.time}
          </span>
          <span>
            <MapPin size={18} />
            {selected.unit}
          </span>
        </div>
        <Link to="/consultas" className="button primary">
          Ver minhas consultas
        </Link>
      </section>
    )
  return (
    <>
      <Link to="/consultas" className="back-link">
        <ArrowLeft size={16} />
        Minhas consultas
      </Link>
      <PageHeading
        eyebrow="UM NOVO CUIDADO"
        title="Vamos marcar sua consulta?"
        description="Escolha a especialidade e um horário que funcione para você."
      />
      <div className="booking-steps">
        {['Especialidade', 'Data e horário', 'Confirmar'].map(
          (label, index) => (
            <span
              key={label}
              className={
                (selected ? 2 : specialty ? 1 : 0) >= index ? 'current' : ''
              }
            >
              <b>{index + 1}</b>
              {label}
            </span>
          ),
        )}
      </div>
      <Feedback message={error} />
      {loading ? (
        <p role="status" className="loading-state">
          Buscando horários disponíveis…
        </p>
      ) : !slots.length ? (
        <section className="panel">
          <Empty
            title="Ainda não há horários publicados"
            description="Quando a unidade disponibilizar sua agenda, você poderá escolher um horário por aqui."
            action={
              <button
                className="button"
                onClick={async () => {
                  setLoading(true)
                  setError('')
                  try {
                    await reloadSlots()
                  } catch (e) {
                    setError(errorMessage(e))
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                Buscar novamente
              </button>
            }
          />
        </section>
      ) : (
        <div className="booking-layout">
          <section className="panel">
            <div className="section-heading">
              <h2>
                {specialty
                  ? 'Escolha o melhor horário'
                  : 'Qual especialidade você procura?'}
              </h2>
              {specialty && (
                <button
                  className="text-button"
                  onClick={() => {
                    setSpecialty('')
                    setSelected(null)
                    setDate('')
                  }}
                >
                  Trocar
                </button>
              )}
            </div>
            {!specialty ? (
              <>
                <div className="search-field">
                  <Search size={18} />
                  <input
                    aria-label="Buscar especialidade"
                    placeholder="Buscar especialidade"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="specialty-grid">
                  {specialties.map((s, i) => (
                    <button
                      className="specialty-card"
                      key={s}
                      onClick={() => {
                        setSpecialty(s)
                        setDate('')
                        setSelected(null)
                      }}
                    >
                      <span className={`specialty-icon tone-${i % 3}`}>
                        <CalendarCheck size={23} />
                      </span>
                      <strong>{s}</strong>
                      <small>Ver horários disponíveis</small>
                    </button>
                  ))}
                </div>
                {!specialties.length && (
                  <p className="muted">
                    Não encontramos especialidades com esse nome ou horários
                    livres.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="muted mb-5">{specialty}</p>
                <div className="date-options">
                  {dates.map((d) => (
                    <button
                      className={d === date ? 'selected' : ''}
                      key={d}
                      onClick={() => {
                        setDate(d)
                        setSelected(null)
                      }}
                    >
                      <small>{formatDate(d, { weekday: 'short' })}</small>
                      <strong>{d.slice(8)}</strong>
                      <small>{formatDate(d, { month: 'short' })}</small>
                    </button>
                  ))}
                </div>
                {date ? (
                  <div className="slot-list">
                    {available
                      .filter(
                        (s) => s.specialty === specialty && s.date === date,
                      )
                      .map((s) => (
                        <button
                          className={`slot ${selected?.id === s.id ? 'selected' : ''}`}
                          key={s.id}
                          onClick={() => setSelected(s)}
                        >
                          <Clock3 size={17} />
                          <b>{s.time}</b>
                          <span>
                            {s.professional}
                            <small>{s.unit}</small>
                          </span>
                          {selected?.id === s.id && <Check size={18} />}
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="soft-note mt-5">
                    Selecione uma data para ver os horários.
                  </div>
                )}
              </>
            )}
          </section>
          <aside className="panel booking-summary">
            <span className="eyebrow">SEU AGENDAMENTO</span>
            <h2>Um passo de cada vez.</h2>
            {selected ? (
              <>
                <h3>{selected.specialty}</h3>
                <p>{selected.professional}</p>
                <div className="appointment-meta">
                  <span>
                    <CalendarCheck size={17} />
                    {formatDate(selected.date)}
                  </span>
                  <span>
                    <Clock3 size={17} />
                    {selected.time}
                  </span>
                  <span>
                    <MapPin size={17} />
                    {selected.unit}
                  </span>
                </div>
                <p className="small muted">{selected.address}</p>
                <button
                  className="button primary full mt-5"
                  onClick={confirm}
                  disabled={busy || !navigator.onLine}
                >
                  {busy ? 'Confirmando…' : 'Confirmar agendamento'}
                </button>
              </>
            ) : (
              <p className="muted">
                Os detalhes aparecem aqui depois que você escolher seu horário.
              </p>
            )}
            <div className="soft-note mt-5">
              Se precisar cancelar, você pode fazer isso em Minhas consultas.
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
