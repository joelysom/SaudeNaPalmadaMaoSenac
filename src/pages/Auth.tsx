import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { Eye, EyeOff, Heart, ShieldCheck, CalendarDays } from 'lucide-react'
import { auth, errorMessage } from '@/lib/firebase'
import { useSession } from '@/context/Session'
import { Feedback } from '@/components/ui'

export default function Auth() {
  const { user, demo, enterDemo } = useSession()
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  if (user || demo) return <Navigate to="/" replace />
  function changeMode(value: typeof mode) {
    setMode(value)
    setError('')
    setSuccess('')
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      const email = String(form.get('email')).trim()
      const password = String(form.get('password'))
      await setPersistence(auth, browserSessionPersistence)
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email)
        setSuccess(
          'Se houver uma conta com este e-mail, você receberá as instruções de recuperação.',
        )
      } else if (mode === 'register') {
        if (String(form.get('name')).trim().length < 3)
          throw new Error('Informe seu nome completo.')
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        )
        await updateProfile(result.user, {
          displayName: String(form.get('name')).trim(),
        })
      } else await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function google() {
    setBusy(true)
    setError('')
    try {
      await setPersistence(auth, browserSessionPersistence)
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <img
          src="/logo.png"
          alt="Saúde na Palma da Mão"
          className="auth-logo"
        />
        <div>
          <span className="eyebrow">MAIS PERTO DE VOCÊ</span>
          <h1>
            Seu cuidado.
            <br />
            No seu tempo.
          </h1>
          <p>
            Menos complicação para organizar suas consultas, acompanhar exames e
            cuidar de você.
          </p>
        </div>
        <div className="story-features">
          <span>
            <CalendarDays size={20} />
            Sua saúde organizada
          </span>
          <span>
            <ShieldCheck size={20} />
            Um espaço só seu
          </span>
          <span>
            <Heart size={20} />
            Cuidado que acompanha você
          </span>
        </div>
        <small>Saúde na Palma da Mão · Projeto SENAC</small>
      </aside>
      <main className="auth-main">
        <div className="auth-box">
          <Link className="mobile-brand" to="/entrar">
            <img src="/logo.png" alt="Saúde na Palma da Mão" />
          </Link>
          <span className="eyebrow">VAMOS CUIDAR DE VOCÊ</span>
          <h2>
            {mode === 'login'
              ? 'Bom ter você aqui.'
              : mode === 'register'
                ? 'Seu cuidado começa aqui.'
                : 'Vamos recuperar seu acesso.'}
          </h2>
          <p className="muted">
            {mode === 'login'
              ? 'Entre na sua conta para continuar.'
              : mode === 'register'
                ? 'Crie uma conta para organizar sua saúde.'
                : 'Informe o e-mail que você usou no cadastro.'}
          </p>
          <form onSubmit={submit} className="form-stack">
            {mode === 'register' && (
              <label>
                Nome completo
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="Como você se chama?"
                />
              </label>
            )}
            <label>
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="voce@exemplo.com"
                maxLength={200}
              />
            </label>
            {mode !== 'reset' && (
              <label>
                Senha
                <div className="password-field">
                  <input
                    name="password"
                    type={show ? 'text' : 'password'}
                    autoComplete={
                      mode === 'register' ? 'new-password' : 'current-password'
                    }
                    required
                    minLength={mode === 'register' ? 8 : 1}
                    placeholder={
                      mode === 'register'
                        ? 'Pelo menos 8 caracteres'
                        : 'Sua senha'
                    }
                    maxLength={128}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}
            {mode === 'login' && (
              <button
                type="button"
                className="text-button forgot"
                onClick={() => changeMode('reset')}
              >
                Esqueci minha senha
              </button>
            )}
            {mode === 'register' && (
              <label className="check-row">
                <input type="checkbox" required />{' '}
                <span>
                  Li e concordo com os{' '}
                  <Link to="/privacidade">
                    termos e a política de privacidade
                  </Link>
                  .
                </span>
              </label>
            )}
            <Feedback message={error} />
            <Feedback message={success} success />
            <button className="button primary full" disabled={busy}>
              {busy
                ? 'Aguarde…'
                : mode === 'login'
                  ? 'Entrar na minha conta'
                  : mode === 'register'
                    ? 'Criar minha conta'
                    : 'Enviar instruções'}
            </button>
          </form>
          {mode === 'login' && (
            <>
              <div className="divider">ou</div>
              <button
                className="button full google"
                onClick={google}
                disabled={busy}
              >
                <b className="google-letter">G</b>Continuar com Google
              </button>
            </>
          )}
          <p className="auth-switch">
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              className="text-button"
              onClick={() =>
                changeMode(mode === 'login' ? 'register' : 'login')
              }
            >
              {mode === 'login' ? 'Cadastre-se' : 'Voltar para entrar'}
            </button>
          </p>
          <div className="demo-entry">
            <p>Quer conhecer primeiro?</p>
            <button className="text-button" onClick={enterDemo} disabled={busy}>
              Explorar demonstração
            </button>
            <small>Sem cadastro. Apenas dados fictícios.</small>
          </div>
          <footer className="auth-footer">
            <ShieldCheck size={14} /> Seu acesso é individual.{' '}
            <Link to="/privacidade">Privacidade</Link>
          </footer>
        </div>
      </main>
    </div>
  )
}
