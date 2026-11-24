# Configuração do Firebase

O código já usa o projeto `snpdm-senac`. As chaves públicas do SDK web identificam o projeto; a proteção depende das regras, autenticação e configuração do console. Nenhuma credencial administrativa está incluída.

## Ativação no console (necessita acesso ao projeto)

1. Authentication → Sign-in method: habilite E-mail/senha e, se desejado, Google. Configure o e-mail de suporte do Google.
2. Authentication → Settings → Authorized domains: inclua `localhost` e o domínio da hospedagem.
3. Crie o Cloud Firestore e publique o conteúdo de `firestore.rules` na aba Rules **antes de usar contas reais**.
4. Cadastre vagas em `slots`, pela equipe da instituição. Não há criação de vagas pelo paciente. As vagas da demonstração nunca são enviadas ao banco.

Uma vaga deve ter estes campos (nomes e tipos exatos):

| Campo | Tipo / exemplo |
| --- | --- |
| specialty | string: `Clínica geral` |
| professional | string: nome real do profissional |
| unit | string: unidade de atendimento |
| address | string: endereço da unidade |
| date | string no formato `AAAA-MM-DD` |
| time | string no formato `HH:mm`, relógio de 24h |
| startsAt | Timestamp do mesmo dia/horário no fuso da unidade |
| available | boolean: `true` |
| patientId | null |
| appointmentId | null |

O ID da vaga é livre e único. A instituição deve cadastrar somente uma vaga para cada profissional/unidade/horário; o cliente não pode criar nem alterar esses dados. `startsAt` é verificado pelas regras contra o relógio do servidor; `date`/`time` devem representar o mesmo instante no fuso da unidade. O projeto usa o horário local do dispositivo na apresentação. Em uma expansão com múltiplos fusos, normalize o modelo para o fuso de cada unidade.

## Estrutura e garantias

- `patients/{uid}`: perfil de acesso exclusivo do paciente.
- `patients/{uid}/appointments/{AAAA-MM-DD_HH-mm}`: agendamentos com ID determinístico por data e hora, evitando dois atendimentos simultâneos para o paciente.
- `patients/{uid}/exams/{id}`: registros pessoais de exames, não laudos clínicos.
- `patients/{uid}/notices/{id}`: avisos internos.
- `slots/{id}`: disponibilidade compartilhada; pacientes só leem vagas livres ou as próprias reservas.

A reserva usa transação Firestore. As regras exigem alteração conjunta da vaga e do agendamento, conferem titularidade e impedem alteração dos dados da vaga. O cancelamento libera a vaga na mesma transação. Falha ao gravar o aviso não desfaz o agendamento. Regras não concedem poderes administrativos aos usuários.

Não há persistência Firestore em disco, Analytics, Storage de arquivos, SMS ou push em segundo plano nesta versão. Sessões reais usam persistência de sessão do Firebase Auth; a demonstração usa `sessionStorage`. O service worker guarda apenas arquivos da interface.

## Publicação opcional

Com Firebase CLI instalada e sessão autorizada:

```sh
firebase login
firebase deploy --only firestore:rules --project snpdm-senac
npm run build
firebase deploy --only hosting --project snpdm-senac
```

O agente não publicou nem alterou o console. É necessário acesso administrativo para aplicar a configuração acima. `firebase.json` contém regras, cabeçalhos e fallback de rotas do React Router. Outras hospedagens precisam do mesmo fallback para `index.html` e HTTPS.

## Limites de validação

Os fluxos locais podem ser conferidos na demonstração. As regras precisam ser validadas no Emulator Suite / ambiente de homologação e os fluxos reais de cadastro, login e reserva precisam de verificação após habilitar os serviços no console. Não use registros reais até concluir essa etapa e definir responsável institucional e canal de privacidade.

Referências oficiais: [autenticação](https://firebase.google.com/docs/auth/web/password-auth), [regras do Firestore](https://firebase.google.com/docs/firestore/security/rules-conditions).
