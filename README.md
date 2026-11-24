# Saúde na Palma da Mão

Aplicativo web responsivo baseado no documento `SNPDM.pdf`, com a identidade visual de `SNPDM_logo.png`. React, TypeScript estrito, Tailwind, React Router, Firebase e PWA.

## Executar

Node.js 24 LTS e npm:

```sh
npm ci
npm run dev
```

Abra o endereço exibido no terminal. Na tela de entrada, escolha **Explorar demonstração** para conferir os fluxos sem configurar contas. Dados, pessoas e vagas de demonstração são fictícios, ficam somente na sessão do navegador e são apagados ao sair. Contas reais nunca usam dados fictícios como fallback.

## Funcionalidades

- Entrada por e-mail/senha ou Google, cadastro, recuperação de senha e rotas privadas.
- Início com resumo de consultas, exames e avisos.
- Agendamento por especialidade, data e horário, confirmação e cancelamento; exportação `.ics` para a agenda do dispositivo.
- Consultas anteriores e canceladas; verificação de disponibilidade e conflito de horário. Reserva e liberação da vaga em transação no Firestore.
- Controle pessoal de exames com criação, edição, exclusão, busca e filtros. Não há integração com laboratórios ou laudos.
- Avisos internos de agendamento e cancelamento, indicação de não lidos e marcação de leitura.
- Perfil editável e exportação dos dados em JSON.
- Ajuda, privacidade, texto ampliado, contraste e leitura por voz quando disponível no navegador.
- PWA instalável, interface disponível offline e atualização com confirmação, para não recarregar formulários automaticamente.

## Firebase

O projeto `snpdm-senac` já está configurado no SDK web. **Antes de usar contas ou dados reais**, habilite os provedores de autenticação, configure os domínios, crie o Firestore, publique as regras e cadastre as vagas. O acesso administrativo ao console não é fornecido pelas chaves públicas do aplicativo.

Consulte [docs/FIREBASE.md](docs/FIREBASE.md) para os passos, o modelo de vagas e os limites de validação. Não há Analytics ativo, armazenamento persistente de dados de saúde no dispositivo, upload de arquivos, SMS nem push em segundo plano. A política de privacidade identifica o estágio acadêmico do projeto e as configurações institucionais pendentes.

## Estrutura

- `src/pages`: telas e formulários.
- `src/components`: layout, componentes compartilhados e aviso de atualização.
- `src/domain`: entidades e regras de agendamento.
- `src/services`: operações de dados e transações Firebase.
- `src/context`: sessão autenticada e estado do paciente, com demonstração separada.
- `src/lib/firebase.ts`: inicialização do SDK e mensagens de erro.
- `src/styles/globals.css`: Tailwind e identidade visual responsiva.
- `firestore.rules`: isolamento por paciente e integridade das reservas.
- `tests`: fluxos ponta a ponta em desktop e viewport móvel e regras locais de agendamento.

O alias `@/` aponta para `src/`. A stack concreta segue o pedido React/Firebase; o PDF apresenta React Native/Spring/PostgreSQL apenas como exemplo arquitetural. A organização separa apresentação, regras e persistência.

## Verificação

```sh
npm run typecheck
npm run build
npm test
```

Os testes usam o Microsoft Edge instalado no caminho padrão do Windows. Em outro ambiente, instale o navegador com `npx playwright install chromium`. São executados sem gravar dados no Firebase. As regras do Firestore precisam de homologação no Emulator Suite, e os fluxos reais devem ser validados após ativar o projeto no console.

`npm run preview` serve o build local. O service worker é gerado no build e desativado no servidor de desenvolvimento. Para conferir a instalação e o cache, abra o preview em localhost ou uma hospedagem HTTPS e use Application nas ferramentas do navegador. O cache inclui apenas arquivos estáticos; dados atualizados e gravações exigem internet.

## Hospedagem

O projeto está preparado para a Vercel. `vercel.json` define Vite, instalação com `npm ci --include=dev`, build com `npm run build`, saída `dist`, fallback das rotas React e cabeçalhos de cache do PWA. A versão Node.js está fixada em `24.x`. A pasta raiz do projeto deve ser a pasta que contém `package.json` e `vercel.json`.

### Publicar na Vercel

1. Envie o código para um repositório Git e importe-o em **New Project** na Vercel, selecionando a raiz do projeto. A configuração acima é aplicada pelo arquivo `vercel.json`.
2. Como alternativa, publique a pasta local com a CLI: `npx vercel` (preview) ou `npx vercel --prod` (produção). O comando solicita acesso à sua conta quando necessário. Não é preciso enviar `node_modules`, cache ou relatórios: `.vercelignore` exclui esses arquivos no envio pela CLI.
3. Depois de obter seu domínio, adicione-o em **Firebase Console → Authentication → Settings → Authorized domains**. Autorize também seu domínio próprio, se houver. URLs de preview usadas para login precisam ser autorizadas individualmente.
4. Habilite os provedores de autenticação e publique as regras do Firestore conforme [docs/FIREBASE.md](docs/FIREBASE.md). Hospedar na Vercel não configura o Firebase nem publica `firestore.rules`.

Não é necessário cadastrar variáveis de ambiente para o projeto Firebase atual: a configuração pública já está em `src/lib/firebase.ts`. Nenhuma credencial administrativa deve ser enviada ao frontend.

Após publicar, confira o acesso direto a `/entrar` e `/consultas`, o login e o manifesto/Service Worker no navegador. A Vercel hospeda os arquivos; autenticação e dados permanecem no Firebase. Nada foi publicado automaticamente.

Referência: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite).

`firebase.json` mantém a opção de usar Firebase Hosting. O app está configurado para a raiz do domínio.
