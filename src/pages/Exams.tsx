import { useState, type FormEvent } from 'react'
import { Plus, FlaskConical, Pencil, Trash2, Search } from 'lucide-react'
import { usePatient } from '@/context/Patient'
import { type Exam, formatDate } from '@/domain/models'
import { PageHeading, Modal, Empty, Feedback, Status } from '@/components/ui'
import { errorMessage } from '@/lib/firebase'

export default function Exams() {
  const { exams, upsertExam, deleteExam } = usePatient()
  const [editing, setEditing] = useState<Exam | 'new' | null>(null)
  const [removing, setRemoving] = useState<Exam | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const items = exams
    .filter(
      (e) =>
        (filter === 'all' || e.status === filter) &&
        e.name
          .toLocaleLowerCase('pt-BR')
          .includes(search.toLocaleLowerCase('pt-BR')),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      await upsertExam({
        id: editing && editing !== 'new' ? editing.id : crypto.randomUUID(),
        name: String(form.get('name')).trim(),
        laboratory: String(form.get('laboratory')).trim(),
        date: String(form.get('date')),
        status: String(form.get('status')) as Exam['status'],
        notes: String(form.get('notes')).trim(),
        createdAt:
          editing && editing !== 'new'
            ? editing.createdAt
            : new Date().toISOString(),
      })
      setEditing(null)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    if (!removing) return
    setBusy(true)
    try {
      await deleteExam(removing.id)
      setRemoving(null)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  const current = editing && editing !== 'new' ? editing : null
  return (
    <>
      <PageHeading
        eyebrow="CADA ETAPA IMPORTA"
        title="Meus exames"
        description="Organize seus pedidos e acompanhe o que vem pela frente."
        action={
          <button
            className="button primary"
            onClick={() => {
              setEditing('new')
              setError('')
            }}
          >
            <Plus size={18} />
            Adicionar exame
          </button>
        }
      />
      <div className="soft-note mb-6">
        <FlaskConical size={18} />
        Seu controle pessoal de exames. Os registros são informados por você,
        sem integração com laboratórios ou laudos médicos.
      </div>
      <div className="filter-toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Buscar exame"
            placeholder="Buscar um exame"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filtrar situação"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todas as situações</option>
          <option value="requested">Solicitados</option>
          <option value="scheduled">Agendados</option>
          <option value="completed">Realizados</option>
        </select>
      </div>
      <div className="exams-grid">
        {items.map((exam) => (
          <article key={exam.id} className="panel exam-card">
            <div className="exam-card-top">
              <span className="stat-icon lavender">
                <FlaskConical size={23} />
              </span>
              <Status value={exam.status} />
            </div>
            <h2>{exam.name}</h2>
            <p className="muted">
              {exam.laboratory || 'Laboratório a definir'}
            </p>
            <p className="exam-date">
              {exam.date
                ? formatDate(exam.date, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Data a definir'}
            </p>
            {exam.notes && <p className="exam-notes">{exam.notes}</p>}
            <div className="record-actions">
              <button
                className="text-button"
                onClick={() => {
                  setEditing(exam)
                  setError('')
                }}
              >
                <Pencil size={15} />
                Editar registro
              </button>
              <button
                className="icon-button danger"
                aria-label={`Excluir ${exam.name}`}
                onClick={() => {
                  setRemoving(exam)
                  setError('')
                }}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <section className="panel">
          <Empty
            icon={FlaskConical}
            title="Nenhum exame nesta lista"
            description="Adicione o nome, a data e o laboratório para ter tudo à mão."
          />
        </section>
      )}
      {editing && (
        <Modal
          title={editing === 'new' ? 'Adicionar exame' : 'Editar exame'}
          onClose={() => {
            if (!busy) setEditing(null)
          }}
        >
          <form className="form-stack" onSubmit={submit}>
            <label>
              Nome do exame
              <input
                name="name"
                required
                maxLength={120}
                defaultValue={current?.name}
                placeholder="Ex.: Hemograma completo"
              />
            </label>
            <label>
              Laboratório ou unidade
              <input
                name="laboratory"
                maxLength={160}
                defaultValue={current?.laboratory}
                placeholder="Onde será realizado?"
              />
            </label>
            <div className="form-grid">
              <label>
                Data
                <input type="date" name="date" defaultValue={current?.date} />
              </label>
              <label>
                Situação
                <select
                  name="status"
                  defaultValue={current?.status || 'requested'}
                >
                  <option value="requested">Solicitado</option>
                  <option value="scheduled">Agendado</option>
                  <option value="completed">Realizado</option>
                </select>
              </label>
            </div>
            <label>
              Suas anotações <span className="muted">(opcional)</span>
              <textarea
                name="notes"
                rows={3}
                maxLength={1000}
                defaultValue={current?.notes}
                placeholder="Algo que você gostaria de lembrar"
              />
            </label>
            <Feedback message={error} />
            <button
              className="button primary"
              disabled={busy || !navigator.onLine}
            >
              {busy ? 'Salvando…' : 'Salvar exame'}
            </button>
          </form>
        </Modal>
      )}
      {removing && (
        <Modal
          title="Excluir este registro?"
          onClose={() => {
            if (!busy) setRemoving(null)
          }}
        >
          <p>
            O registro de {removing.name} será excluído. Essa ação não pode ser
            desfeita.
          </p>
          <Feedback message={error} />
          <div className="modal-actions">
            <button
              className="button"
              disabled={busy}
              onClick={() => setRemoving(null)}
            >
              Voltar
            </button>
            <button
              className="button destructive"
              disabled={busy}
              onClick={remove}
            >
              {busy ? 'Excluindo…' : 'Excluir registro'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
