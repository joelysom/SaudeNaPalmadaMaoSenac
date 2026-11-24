import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
export default function Privacy() {
  return (
    <main className="legal-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={17} />
        Voltar ao aplicativo
      </Link>
      <img src="/logo.png" alt="Saúde na Palma da Mão" />
      <h1>Privacidade e termos de uso</h1>
      <p className="muted">
        Versão de 23 de novembro de 2026 · Projeto acadêmico SENAC
      </p>
      <h2>Sobre este aplicativo</h2>
      <p>
        Saúde na Palma da Mão é um projeto acadêmico para organizar consultas e
        registros pessoais de exames. Não substitui atendimento profissional,
        não emite diagnósticos e não é um canal de emergência. A demonstração
        usa exclusivamente dados fictícios e não agenda atendimentos reais.
      </p>
      <h2>Dados e finalidade</h2>
      <p>
        O acesso usa Firebase Authentication (e-mail e senha ou conta Google). O
        perfil pode conter nome, telefone, data de nascimento e cidade.
        Consultas, registros de exames e avisos são armazenados no Cloud
        Firestore para oferecer as funcionalidades solicitadas. O preenchimento
        de telefone, cidade e nascimento é opcional.
      </p>
      <h2>Armazenamento e acesso</h2>
      <p>
        Os dados da conta são associados ao seu identificador no Firebase. As
        regras de acesso devem permitir a cada pessoa consultar e alterar
        somente os próprios registros. A agenda compartilhada mostra
        disponibilidade e dados do atendimento; identificadores de reserva ficam
        em documentos protegidos por regras. Dados reais não são gravados no
        armazenamento offline persistente do aplicativo. A demonstração é
        mantida apenas na sessão deste navegador e é apagada ao sair.
      </p>
      <h2>Preferências e cookies</h2>
      <p>
        As escolhas de tamanho de texto e contraste ficam no navegador. A
        autenticação mantém sua sessão até o encerramento da sessão do navegador
        ou a saída manual. O service worker armazena arquivos da interface para
        permitir sua abertura offline. Firebase Analytics não é ativado nesta
        versão, e nenhum dado de saúde é enviado a ferramentas de análise.
      </p>
      <h2>Suas escolhas</h2>
      <p>
        Você pode editar o perfil, excluir seus registros pessoais de exames e
        baixar uma cópia dos dados em Meu perfil. Para solicitar exclusão da
        conta e dos demais dados, procure a equipe responsável pelo projeto.
        Antes de uso com pacientes reais, a instituição responsável deve
        disponibilizar seu canal de privacidade, política de retenção e base
        legal aplicável.
      </p>
      <h2>Agendamentos e registros</h2>
      <p>
        Uma consulta só é confirmada após a gravação da reserva. Os registros de
        exames são informados pelo usuário e não comprovam atendimento, pedido
        médico ou resultado de laboratório. Avisos são exibidos dentro do
        aplicativo; não há garantia de notificação externa ou lembrete em
        segundo plano.
      </p>
      <h2>Uso responsável</h2>
      <p>
        Use apenas sua própria conta e dados que você está autorizado a
        registrar. Confira as informações com a unidade de atendimento. Esta
        versão acadêmica precisa de validação institucional e de configuração do
        Firebase antes de receber dados reais de pacientes.
      </p>
    </main>
  )
}
