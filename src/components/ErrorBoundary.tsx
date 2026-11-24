import { Component, type ReactNode } from 'react'

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed)
      return (
        <main className="legal-page">
          <h1>Precisamos tentar de novo.</h1>
          <p className="muted mt-4 mb-6">
            Não foi possível abrir esta tela. Confira sua conexão e recarregue o
            aplicativo.
          </p>
          <button
            className="button primary"
            onClick={() => window.location.reload()}
          >
            Recarregar aplicativo
          </button>
        </main>
      )
    return this.props.children
  }
}
