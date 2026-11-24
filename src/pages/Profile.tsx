import { useState, type FormEvent } from 'react'
import { UserRound, ShieldCheck, Save, Download } from 'lucide-react'
import { usePatient } from '@/context/Patient'
import { useSession } from '@/context/Session'
import { Feedback, PageHeading } from '@/components/ui'
import { localDate } from '@/domain/models'
import { errorMessage } from '@/lib/firebase'

export default function Profile() {
  const patient = usePatient()
  const { user, demo } = useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const birthDate = String(form.get('birthDate'))
      if (birthDate && birthDate > localDate())
        throw new Error('A data de nascimento não pode estar no futuro.')
      await patient.updateProfile({
        name: String(form.get('name')).trim(),
        phone: String(form.get('phone')).trim(),
        birthDate,
        city: String(form.get('city')).trim(),
      })
      setSuccess('Pronto. Seus dados foram atualizados.')
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  function exportData() {
    const { profile, appointments, exams, notices } = patient
    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify({ profile, appointments, exams, notices }, null, 2)],
        { type: 'application/json' },
      ),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'meus-dados-saude.json'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <>
      <PageHeading
        eyebrow="SEU ESPAÇO, SEUS DADOS"
        title="Meu perfil"
        description="Mantenha suas informações de contato atualizadas."
      />
      <div className="profile-layout">
        <section className="panel">
          <div className="section-heading">
            <h2>Informações pessoais</h2>
            <UserRound size={20} />
          </div>
          <form className="form-stack" onSubmit={submit}>
            <label>
              Nome completo
              <input
                name="name"
                defaultValue={patient.profile.name || user?.displayName || ''}
                autoComplete="name"
                minLength={3}
                maxLength={100}
                required
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={demo ? 'ana@demonstracao.exemplo' : user?.email || ''}
                disabled
              />
              <small className="muted">
                O e-mail identifica sua conta de acesso.
              </small>
            </label>
            <div className="form-grid">
              <label>
                Telefone
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  defaultValue={patient.profile.phone}
                  maxLength={22}
                  placeholder="(85) 99999-9999"
                  pattern="[0-9()+ .-]{8,22}"
                />
              </label>
              <label>
                Data de nascimento
                <input
                  type="date"
                  name="birthDate"
                  defaultValue={patient.profile.birthDate}
                  max={localDate()}
                  min="1900-01-01"
                />
              </label>
            </div>
            <label>
              Cidade
              <input
                name="city"
                autoComplete="address-level2"
                maxLength={100}
                defaultValue={patient.profile.city}
                placeholder="Sua cidade"
              />
            </label>
            <Feedback message={error} />
            <Feedback message={success} success />
            <button
              className="button primary self-start"
              disabled={busy || !navigator.onLine}
            >
              <Save size={17} />
              {busy ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </form>
        </section>
        <aside>
          <section className="panel privacy-card">
            <span className="stat-icon">
              <ShieldCheck size={25} />
            </span>
            <h2>Você cuida dos seus dados.</h2>
            <p className="muted">
              Compartilhe apenas as informações necessárias. Seu perfil é
              acessível pela sua conta.
            </p>
            <button className="button full" onClick={exportData}>
              <Download size={17} />
              Baixar meus dados
            </button>
            <small className="muted">
              O arquivo contém seus registros pessoais. Guarde em um local
              seguro.
            </small>
          </section>
        </aside>
      </div>
    </>
  )
}
