# SGMLab — Estrutura proposta do Cloud Firestore

Documento de planejamento da persistência definitiva. Nesta etapa (PROMPT 07A) **nenhum
documento operacional é criado no banco real**: Home, Cadastros e Registros continuam usando
o `memoryLabRepository`. A implementação das transações e do repositório Firestore ocorre no
PROMPT 07B.

## 1. Princípios

- Uma única fonte de verdade por conceito: pessoas, sessões, computadores, manutenção e notas.
- Identificadores internos estáveis (`personId`, `computerId`, `sessionId`) preservados.
- Matrícula sempre armazenada como **string**, preservando zeros à esquerda (`"00123"`).
- Código VIS único, sequencial e imutável (`VIS-0001`), gerado por transação.
- Timestamps gravados com `serverTimestamp()`; exibição em `America/Fortaleza`.
- Toda operação concorrente (cadastro, início/encerramento de sessão, manutenção) em transação.
- Nenhum histórico é apagado ao editar uma pessoa; `personAcademicSnapshot` preserva o curso,
  turno e período vigentes no momento da sessão.
- Consultas sempre limitadas por índice/intervalo, compatíveis com as cotas do plano Spark.

## 2. Coleções

### 2.1 `monitors/{uid}`

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| `name` | string | sim | Nome exibido na sidebar |
| `active` | boolean | sim | Somente `true` autoriza o acesso |
| `email` | string | não | Apenas exibição |
| `createdAt` / `updatedAt` | timestamp | não | Auditoria administrativa |

Documento identificado pelo UID do Firebase Authentication. Criado e alterado **somente** por
administração confiável (Firebase Console nesta etapa). O cliente apenas lê o próprio documento.

### 2.2 `people/{personId}`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | string | Igual ao ID do documento (`person-1`, …); vínculo estável com sessões |
| `type` | `"student" \| "visitor"` | Aluno ou visitante |
| `name`, `nameNormalized` | string | Nome e versão sem acento/caixa para busca |
| `registration` | string \| null | Somente aluno; dígitos, zeros à esquerda preservados |
| `visitorCode` | string \| null | Somente visitante; `VIS-XXXX` imutável |
| `course`, `courseShift` | string \| null | IDs do catálogo acadêmico |
| `academicPeriod` | number \| null | 1 a 10 |
| `createdAt`, `updatedAt` | timestamp | `updatedAt` alterado apenas na edição cadastral |
| `createdBy` | string | UID do monitor responsável |
| `active` | boolean | Pessoas com histórico não são excluídas |

### 2.3 `sessions/{sessionId}`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `personId` | string | Referência a `people` |
| `personName`, `personIdentifier` | string | Snapshot de exibição no histórico |
| `personAcademicSnapshot` | map | `{ type, course, academicPeriod, courseShift }` |
| `labId` | `"delta" \| "carnauba"` | |
| `computerId` | string | `delta_01` … `carnauba_24` |
| `pcNumber` | number | 1–15 (Delta) ou 1–24 (Carnaúba) |
| `status` | `"active" \| "closed"` | |
| `startedAt`, `endedAt` | timestamp \| null | `endedAt` nulo enquanto ativa |
| `durationSeconds` | number \| null | Conveniência no fechamento; recalculável |
| `startedBy`, `endedBy` | string | UID do monitor responsável |

Coleção somente de inserção e atualização de fechamento: sessões encerradas nunca são apagadas.

### 2.4 `computers/{computerId}`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `labId` | `"delta" \| "carnauba"` | |
| `pcNumber` | number | Posição física imutável |
| `status` | `"available" \| "occupied" \| "maintenance"` | |
| `activeSessionId` | string \| null | Sessão ativa do PC |
| `updatedAt` | timestamp | |
| `updatedBy` | string | UID do monitor |

39 documentos fixos, semeados uma única vez: Delta 01–15 (3×5) e Carnaúba 01–24 (4×6).
A posição nunca é reordenada, nem em telas estreitas.

### 2.5 `personKeys/{key}`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `personId` | string | Pessoa proprietária do identificador |
| `kind` | `"student" \| "visitor"` | |
| `createdAt` | timestamp | |

IDs determinísticos: `student_<matricula>` e `visitor_<codigoVIS>`. A criação em transação
com `people` garante unicidade mesmo com envios simultâneos; a consulta prévia na interface é
apenas conveniência. A edição de matrícula atualiza a chave na mesma transação.

### 2.6 `counters/{counterId}`

Documento único `counters/visitorCode` com `value: number`. O próximo código VIS é obtido por
`runTransaction` (leitura + incremento + criação da pessoa e de `personKeys`), nunca pela
contagem de documentos carregados. Códigos emitidos não são reaproveitados.

### 2.7 `maintenanceEvents/{eventId}`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `computerId` | string | |
| `action` | `"entered" \| "exited"` | |
| `timestamp` | timestamp | |
| `actorUid` | string | Monitor responsável |
| `note` | string | Opcional |

### 2.8 `notes/{noteId}`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `title`, `body` | string | Conteúdo do recado |
| `color` | string | Paleta permitida |
| `authorUid` | string | Definido pela sessão, nunca por campo livre |
| `authorName` | string | Snapshot de exibição |
| `createdAt`, `updatedAt` | timestamp | |

## 3. Concorrência e integridade

- **Início de sessão** (transação): ler `computers/{id}` e as sessões ativas da pessoa;
  falhar se o PC não estiver `available` ou se a pessoa já possuir sessão ativa; criar a sessão
  com `startedAt = serverTimestamp()`, marcar o PC como `occupied` e gravar `activeSessionId`.
- **Encerramento** (transação): validar que a sessão é a ativa do PC, gravar `endedAt`,
  `durationSeconds` não negativo, `status = closed`, liberar o PC e limpar `activeSessionId`.
- **Manutenção** (transação): entrada só em PC `available`; saída só em `maintenance`;
  registrar evento com o UID do monitor.
- **Cadastro/edição** (transação): validar dados, garantir `personKeys` livre, atualizar
  `people` e a chave de identificador juntos.
- Duas sessões simultâneas no mesmo PC ou da mesma pessoa são impedidas pela releitura dentro
  da transação; se a 07B exigir, um documento `activePersons/{personId}` reforça a unicidade.
- Falha de rede não deve produzir estado visual de sucesso: a interface só confirma após o
  commit da transação.

## 4. Índices

Índices de campo único são automáticos. Os compostos abaixo serão criados apenas quando as
consultas correspondentes existirem (PROMPT 07B), em `firestore.indexes.json`:

| Coleção | Campos | Uso |
| --- | --- | --- |
| `sessions` | `personId` ASC, `startedAt` DESC | Histórico individual e último acesso |
| `sessions` | `personId` ASC, `status` ASC | Verificação de sessão ativa da pessoa |
| `sessions` | `status` ASC, `startedAt` DESC | Sessões ativas e mapa |
| `sessions` | `labId` ASC, `startedAt` ASC | Dashboard por laboratório e período |
| `people` | `active` ASC, `nameNormalized` ASC | Listagem de Registros |
| `notes` | `createdAt` DESC | Mural recente primeiro |

Estratégia de cotas (Spark): consultas sempre filtradas por pessoa, laboratório ou intervalo de
datas; paginação no histórico; nenhuma varredura de coleção completa; Dashboard calculado a
partir de consultas limitadas ao período selecionado.

## 5. Regras de segurança nesta etapa (07A)

`firestore.rules` adota negação por padrão:

- Nenhum acesso para usuários não autenticados.
- `monitors/{uid}`: `get` somente do próprio documento; `list`, `create`, `update` e `delete`
  negados.
- Todas as coleções operacionais (`people`, `sessions`, `computers`, `personKeys`,
  `maintenanceEvents`, `counters`, `notes`) e coleções desconhecidas: leitura e escrita negadas.

As permissões operacionais por operação serão definidas no PROMPT 07B, sempre condicionadas a
`monitors/{uid}.active == true`, com validação de campos, autoria e transições de estado.

## 6. Pendências para o PROMPT 07B

- Implementar `firestoreLabRepository` com transações e listeners em tempo real.
- Definir e publicar os índices compostos após as consultas reais.
- Regras operacionais completas e testes de integração no emulador.
- Migração dos dados em memória e semeadura única dos 39 computadores.
- Política de retenção e exportação nominal (LGPD) com a coordenação.
