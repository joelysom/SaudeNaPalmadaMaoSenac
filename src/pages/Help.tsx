import {
  CalendarDays,
  FlaskConical,
  Accessibility,
  HeartHandshake,
  Download,
} from 'lucide-react'
import { PageHeading } from '@/components/ui'
const questions = [
  [
    'Como marco uma consulta?',
    'Abra Minhas consultas e escolha Marcar consulta. Selecione a especialidade, uma data e um horário disponível. Confira os detalhes e confirme. Se não houver horários, a unidade ainda precisa publicar sua agenda.',
  ],
  [
    'Como cancelo ou mudo o horário?',
    'Em Minhas consultas, encontre o agendamento e escolha Cancelar consulta. Depois da confirmação, o horário é liberado. Para mudar, faça um novo agendamento com o horário desejado.',
  ],
  [
    'Meus exames aparecem automaticamente?',
    'Não. Meus exames é um controle pessoal: adicione o nome do exame, a data, o laboratório e a situação. Você pode editar ou excluir cada registro. O aplicativo não recebe laudos de laboratórios.',
  ],
  [
    'Como aumento as letras ou ouço a página?',
    'Abra Acessibilidade no menu. Você pode ampliar os textos, ativar o alto contraste e ouvir a página em navegadores com suporte à leitura por voz.',
  ],
  [
    'Posso usar sem internet?',
    'Depois do primeiro acesso, a estrutura do aplicativo pode abrir offline. Para acessar dados atualizados, entrar, agendar ou salvar alterações, é preciso conexão.',
  ],
  [
    'Como instalo no celular?',
    'No Android, use Instalar aplicativo no menu quando a opção estiver disponível ou no menu do navegador. No iPhone, abra no Safari, toque em Compartilhar e Adicionar à Tela de Início. A instalação em produção exige HTTPS.',
  ],
  [
    'Esqueci minha senha. O que faço?',
    'Na tela de entrada, selecione Esqueci minha senha e informe seu e-mail. Confira também a pasta de spam. Se você usa Google, entre com o mesmo botão de acesso.',
  ],
]
export default function Help() {
  return (
    <>
      <PageHeading
        eyebrow="PODE CONTAR COM ESTE ESPAÇO"
        title="Como podemos ajudar?"
        description="Respostas simples para deixar seu dia mais fácil."
      />
      <div className="help-topics">
        {[
          {
            icon: CalendarDays,
            title: 'Consultas',
            text: 'Agendar e acompanhar',
          },
          {
            icon: FlaskConical,
            title: 'Exames',
            text: 'Organizar seus registros',
          },
          {
            icon: Accessibility,
            title: 'Acessibilidade',
            text: 'Usar do seu jeito',
          },
          { icon: Download, title: 'Aplicativo', text: 'Ter sempre por perto' },
        ].map(({ icon: Icon, title, text }) => (
          <a href="#perguntas" className="panel" key={title}>
            <Icon size={25} />
            <h3>{title}</h3>
            <p className="muted small">{text}</p>
          </a>
        ))}
      </div>
      <section className="panel faq" id="perguntas">
        <h2>Perguntas frequentes</h2>
        {questions.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <div className="soft-note mt-5">
        <HeartHandshake size={23} />
        <p>
          Para orientações sobre sua consulta, atendimento ou preparo de exames,
          procure diretamente sua unidade de saúde. Este aplicativo não oferece
          diagnóstico nem atendimento de emergência.
        </p>
      </div>
    </>
  )
}
