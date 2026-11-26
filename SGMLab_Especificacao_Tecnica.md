# SGMLab — Especificação Técnica e Plano de Implementação

**Projeto:** Sistema de Gerenciamento e Monitoramento dos Laboratórios — UESPI, Campus Parnaíba  
**Versão:** 1.0 — baseline funcional para implementação  
**Data:** 22 de novembro de 2026  
**Repositório de referência:** `Marcoxxs/sgm_project`  
**Situação:** Especificação proposta; requer conferência com código, infraestrutura e requisitos acadêmicos antes do deploy.

## 1. Objetivo e princípios

Desenvolver aplicação web para registrar, acompanhar e analisar a utilização dos laboratórios Delta Lab e Carnaúba Lab, substituindo registros manuais e permitindo que monitores autorizados operem sessões, cadastros, manutenção, recados e relatórios para a coordenação.

**Princípios:** interface limpa e responsiva; mapa fiel ao espaço físico; uma fonte de verdade para dados; consistência entre Dashboard e PDF; autorização no servidor; operações auditáveis; sem funcionalidades fora do escopo; acessibilidade e tratamento explícito de estados vazios, erros e carregamento.

**Escopo da primeira entrega (MVP):** Login, Home, Cadastros, Registros, Dashboard, PDF, Anotações, Ajuda. Fora do MVP: IA de otimização, biometria, notificações, chatbot, permissões administrativas complexas, reservas e integrações externas.

## 2. Stack e arquitetura

- **Frontend:** React com JavaScript, Material UI e React Router; componentes reutilizáveis, tema único e rotas protegidas.
- **Backend gerenciado:** Firebase Authentication (e-mail/senha) e Cloud Firestore. Firebase Hosting ou hospedagem compatível com SPA, conforme ambiente confirmado.
- **Relatórios:** geração de PDF no cliente a partir do mesmo objeto de estatísticas usado pelo Dashboard, com biblioteca selecionada após avaliação de paginação, gráficos e fontes; não depender de captura de tela como única fonte de dados.
- **Tempo:** timestamps Firestore em UTC, exibidos no fuso `America/Fortaleza` para Parnaíba. Usar horário de servidor em gravações, evitando confiar no relógio do navegador.
- **Organização sugerida:** `src/pages`, `src/components`, `src/services/firebase`, `src/services/repositories`, `src/domain/sessions`, `src/domain/analytics`, `src/domain/reports`, `src/routes`, `src/theme`, `src/utils`.

**Antes de editar:** conferir scripts, dependências, componentes, Firebase, assets e branches do repositório; criar branch de implementação e ponto de restauração; registrar inventário técnico. Não presumir que o repositório atual esteja funcional ou que o Firebase já esteja configurado.

## 3. Identidade visual e navegação

Sidebar com marca UESPI e título **SGMLab — UESPI**. Entradas: **Home, Cadastros, Registros, Dashboard, Anotações, Ajuda**; perfil do monitor e logout. Cadastros é **uma única página** com seletor Aluno/Visitante — não implementar submenus separados, mesmo que mockups antigos os mostrem.

Tema: fundo cinza muito claro, superfícies brancas, azul institucional como ação principal, texto azul-escuro, cartões arredondados, espaçamento generoso, feedback de Snackbar, estados hover/foco visíveis. Responsividade sem alterar ordem física dos PCs. Acessibilidade básica: labels, teclado, contraste, foco, feedback textual além da cor.

## 4. Autenticação e autorização

- Login por e-mail/senha no Firebase Authentication, sem autocadastro público.
- Somente contas previamente autorizadas podem ler/escrever dados. Definir allowlist de UIDs ou documento `monitors/{uid}` com `active: true`, provisionado por administrador; autenticação por si só **não** concede acesso ao Firestore.
- Proteger rotas na interface e aplicar Firestore Security Rules por operação/coleção. Atribuir autor da anotação pelo UID autenticado, nunca por campo livre enviado pelo cliente.
- Logout, sessão persistida pelo SDK, estados de carregamento, credenciais inválidas e acesso revogado tratados.
- Não guardar senhas no Firestore. Configuração pública Firebase via variáveis de ambiente; nenhuma chave administrativa no frontend.

## 5. Modelo de dados proposto — Firestore

Os nomes abaixo são uma proposta consistente; ajustar somente após auditar o repositório.

### 5.1 `people/{personId}`

`type: 'student'|'visitor'`, `name`, `nameNormalized`, `registration` (string numérica, somente aluno), `visitorCode` (string VIS-XXXX, somente visitante), `course`, `academicPeriod`, `courseShift` (somente aluno), `createdAt`, `updatedAt`, `createdBy`, `active`.

**Unicidade:** usar índices auxiliares com IDs determinísticos, por exemplo `personKeys/student_<matricula>` e `personKeys/visitor_<codigo>`, criados/atualizados em transação junto ao cadastro. Pesquisa prévia na interface não substitui garantia transacional. Matrícula como string para preservar zeros à esquerda. Código VIS gerado por transação/contador ou identificador sem colisão, não pelo número de documentos carregados.

### 5.2 `sessions/{sessionId}`

`personId`, `labId: 'delta'|'carnauba'`, `pcNumber`, `startedAt`, `endedAt|null`, `status: 'active'|'closed'`, `startedBy`, `endedBy`, `createdAt`, `updatedAt`. `durationSeconds` pode ser persistido no fechamento como conveniência, mas deve ser validado/recalculável a partir dos timestamps. Preservar o laboratório e PC históricos em cada sessão. Não apagar sessões ao editar pessoas.

### 5.3 `computers/{labId_pcNumber}`

`labId`, `pcNumber`, `status: 'available'|'occupied'|'maintenance'`, `activeSessionId|null`, `updatedAt`, `updatedBy`. São **39 computadores fixos**: Delta 01–15, Carnaúba 01–24. A lista é semeada uma vez, sem duplicação. Mudanças de estado e sessões precisam ser transacionais.

### 5.4 `maintenanceEvents/{eventId}`

`computerId`, `action: 'entered'|'exited'`, `timestamp`, `actorUid`, `note?`. Registrar eventos de manutenção permite futura análise da capacidade disponível. Não inferir retrospectivamente manutenção anterior à implantação.

### 5.5 `notes/{noteId}`

`title`, `body`, `color` (paleta permitida), `authorUid`, `authorDisplayName` (snapshot de exibição), `createdAt`, `updatedAt`. Mural compartilhado, sem respostas ou notificações. Edição/exclusão por autor ou regra administrativa explicitamente definida; para MVP, preferir somente autor.

### 5.6 `monitors/{uid}` e `personKeys/{key}`

`monitors`: `displayName`, `email`, `active`, `createdAt`. `personKeys`: `personId`, `kind`, `createdAt`. Proteger criação/alteração por mecanismo administrativo confiável. As regras do Firestore devem impedir que usuários comuns se tornem administradores ou criem credenciais autorizadas.

**Índices:** criar os índices compostos que as consultas realmente exigirem, após implementar consultas por intervalo, laboratório, status e ordenação. Documentar regras e índices no repositório.

## 6. Home — mapa e sessões

**Delta Lab:** grade imutável 3 linhas × 5 colunas (15 PCs). **Carnaúba Lab:** 4 linhas × 6 colunas (24 PCs). Numeração sequencial por linha; nunca reordenar as posições em telas menores: escalar ou oferecer rolagem horizontal.

Estados visuais: **branco disponível, azul ocupado, vermelho manutenção**. Hover em PC ocupado: nome e matrícula/código VIS; não expor dados pessoais além do necessário. Modal único por computador, com três ações sempre visíveis: **Iniciar Sessão, Manutenção/Retirar da manutenção, Encerrar Sessão**. Ações inválidas ficam bloqueadas ou mostram Snackbar explicativo.

**Iniciar:** digitar matrícula ou VIS, localizar pessoa, mostrar prévia, exigir confirmação; transação verifica PC disponível e ausência de sessão ativa conflitante, cria sessão e marca PC ocupado. Não permitir duas sessões ativas no mesmo PC; idealmente impedir pessoa simultaneamente ativa em PCs diferentes, mediante mecanismo de unicidade transacional por pessoa (ex.: `activePersons/{personId}`).

**Encerrar:** transação verifica sessão ativa e PC correspondente, define `endedAt` e `status=closed`, calcula duração não negativa, libera PC e remove vínculo de sessão ativa da pessoa. Falha de rede não deve gerar estado visual falso de sucesso.

**Manutenção:** entrada somente se PC não estiver ocupado; retirada somente se estiver em manutenção; registrar eventos de mudança. Timer da sessão em andamento calculado localmente para exibição, sem escrita periódica no Firestore. Atualização em tempo real via listeners e limpeza adequada dos listeners.

**Cadastro contextual:** matrícula não encontrada → opção “Cadastrar aluno”; abrir Cadastros com matrícula e contexto de laboratório/PC via estado de navegação; após salvar, voltar ao mesmo PC e reabrir confirmação; **não** iniciar automaticamente. Cancelamento volta ao laboratório quando iniciado na Home; no acesso direto permanece em Cadastros.

## 7. Cadastros — formulário único

Seletor **Aluno / Visitante**.

**Aluno (obrigatórios):** nome completo, matrícula, curso da lista oficial configurável, período acadêmico numérico e turno do curso. Matrícula só com dígitos, string, única. Não coletar CPF, foto, data de nascimento, endereço ou estado civil.

**Visitante:** nome completo; código único VIS-XXXX gerado pelo sistema e imutável. Nomes repetidos são permitidos; distinguir visitantes pelo código. Formulários com validação, mensagens claras, reset e confirmação de gravação. A edição de dados acontece em Registros, não nesta página.

## 8. Registros — central de usuários

Tabela **uma linha por pessoa cadastrada**, inclusive quem nunca acessou. Cabeçalho “Registros de Acesso”. Busca por nome, matrícula ou VIS, acionada pela lupa; filtros **Curso** e **Acessos** (Ordem alfabética padrão, Mais recentes, Mais antigos), aplicados pelo botão Filtrar; Limpar restaura defaults. Ordenação A–Z por padrão, inclusive resultados da busca.

Colunas: **Nome | Matrícula | Laboratório | Computador | Último acesso | Tempo total**. Para visitantes, coluna matrícula mostra badge VIS; para zero acessos, “—”, “Sem acessos” e “0h”. Laboratório/PC/último acesso vêm da sessão mais recente da pessoa; tempo total soma sessões encerradas. Sem botão de exportação ou atualização no topo; sem menu de reticências por linha.

**Clique no nome → Detalhes do Usuário:** cartão com identificação, curso/período/turno para aluno, total de acessos e tempo acumulado; botões **Editar dados** e **Voltar**. Histórico paginado, mais recente primeiro, com **Data | Laboratório | Computador | Entrada | Saída | Duração**. Sessão ativa mostra “Em andamento” em saída/duração conforme regra visual. Estado vazio explícito.

**Editar dados:** edição inline; botão vira **Concluir**; valida e persiste; falha mantém modo de edição; Voltar com alterações não salvas pede confirmação. VIS imutável; matrícula única em transação. Alteração cadastral não reescreve históricos.

## 9. Dashboard — regras matemáticas

**Filtros:** período (semana/mês/semestre/personalizado), curso, laboratório, turno de utilização e, em opções avançadas, faixa de horário. Botões Aplicar filtros e Limpar. Turno de utilização é definido pelo relógio da sessão, **não** pelo turno acadêmico do aluno. Definir e documentar horários exatos de manhã/tarde/noite antes da implementação.

**Regra de base:** acesso = sessão iniciada no intervalo selecionado. Usuários distintos = conjunto de `personId` dessas sessões. Duração/ocupação = interseção temporal de cada sessão encerrada com a janela filtrada; não atribuir a novembro horas que ocorreram em dezembro. Para sessões abertas, indicadores de duração consolidada consideram apenas parte encerrada; exibir acessos ativos separadamente se necessário. O filtro por curso consulta a associação do usuário; decidir se relatórios históricos refletem o curso atual (MVP) ou snapshot do curso no momento da sessão (mais fiel historicamente); **recomendação: gravar snapshot mínimo de curso/turno na sessão** para consistência temporal.

**KPIs:** (1) total de acessos = contagem de sessões iniciadas no período; (2) usuários distintos = cardinalidade de IDs; (3) tempo total de uso = soma de segundos de uso no período; (4) duração média = tempo total de sessões encerradas / número de sessões encerradas elegíveis. **Atenção:** a média da sessão completa não deve dividir horas recortadas por número de sessões inteiras; apresentar “duração média das sessões encerradas iniciadas no período” e usar duração integral dessas sessões, ou renomear como “tempo médio registrado por acesso no intervalo” se usar tempo recortado. Recomenda-se a primeira definição para evitar ambiguidade.

**Gráficos:** acessos por dia da semana (dia de início), distribuição de acessos por laboratório (contagens e percentuais), horários de maior movimento (horas de uso por faixa, calculadas por interseção), computadores mais utilizados (Top 5 por tempo acumulado, chave laboratório + PC). O gráfico mensal compara meses do intervalo selecionado, com contagem de sessões por mês; exibir quantidade de dias com operação registrada quando necessário para contextualizar diferenças.

**Percentual de ocupação:** somente se houver denominador válido: `tempo ocupado / tempo potencialmente disponível`, considerando 15 PCs no Delta e 24 no Carnaúba, horários de funcionamento definidos e períodos de manutenção conhecidos. Sem esses dados, usar **horas de uso** e **número de acessos**, não porcentagens fictícias. Evitar percentuais de crescimento sem período comparativo equivalente e dados suficientes.

**Precisão:** trabalhar internamente com segundos ou milissegundos; arredondar apenas na apresentação; divisão por zero → 0 ou “Sem dados”; timestamps e limites de intervalos em timezone consistente; evitar dupla contagem nas bordas usando intervalos semiabertos `[início, fim)`.

## 10. PDF institucional

Botão **Gerar Relatório (PDF)** no Dashboard; respeitar exatamente os filtros aplicados. Relatório paginado em A4, preferencialmente 5–6 páginas conforme conteúdo, com identificação **UESPI — Campus Parnaíba / SGMLab**, capa azul, páginas internas claras, cabeçalho, rodapé, numeração e data/hora de emissão.

**Estrutura:** capa e escopo; resumo executivo com KPIs; evolução temporal por semana/mês; distribuição por laboratório, curso, turno e horários; Top 5 computadores e tempo de uso; síntese técnica e metodologia/filtros. Se o período abranger vários meses, incluir comparação mensal; em período curto, apresentar evolução semanal. Mostrar estado “sem dados” sem gráficos inventados. Texto de síntese deve ser gerado somente a partir de métricas verificadas, sem afirmar causalidade.

**Integridade:** PDF e Dashboard consomem **o mesmo objeto calculado** no módulo `analytics`; validar somas, percentuais e totais antes de renderizar. Os mockups aprovados são referências **visuais**, não fontes de números ou datas: valores ilustrativos neles não são consistentes entre si. Não reproduzi-los como resultados reais. Se o volume exceder uma página, paginar tabelas e repetir cabeçalhos. Considerar impressão em preto e branco e legibilidade.

## 11. Anotações — mural compartilhado

Página de notas estilo **Notas Autoadesivas do Windows**, com cartões em cores suaves. Criar nota (título, texto, cor); exibir autor e data automáticos; editar/excluir com confirmação; ordenar recentes primeiro. Todas as contas autorizadas visualizam o mesmo mural. Sem respostas, status de resolução, chat, anexos, push ou notificações. Para o MVP, permitir edição/exclusão apenas pelo autor; política pode ser revisada pela coordenação.

## 12. Ajuda

Página estática com FAQ curto: iniciar/encerrar sessão; cadastrar; consultar histórico; manutenção; filtros e PDF; mural. Bloco **Contato e Suporte** com telefone e e-mail oficiais da coordenação, configuráveis e **não inventados**. Links `tel:` e `mailto:` somente quando os contatos reais forem fornecidos. Sem chatbot ou sistema de chamados.

## 13. Segurança, privacidade e confiabilidade

- Princípio do menor privilégio; Security Rules testadas em emulador; bloqueio explícito a acesso anônimo e escrita de campos protegidos.
- Não expor dados de alunos em logs, mensagens de erro, URLs ou exportações desnecessárias. Relatório agregado por padrão; exportação nominal somente se requisito institucional e autorização forem confirmados.
- Validar entradas no cliente e nas regras/serviços; transações para operações concorrentes; evitar exclusão em cascata de histórico.
- Tratar estados offline, timeout, listeners duplicados, refresh durante sessão, falha de geração do PDF e sessão ativa após troca de monitor.
- Documentar política de retenção, acesso e finalidade dos dados com orientação institucional, considerando LGPD.

## 14. Critérios de aceitação — testes mínimos

1. Delta tem exatamente 15 PCs em 3×5 e Carnaúba 24 em 4×6; posições não mudam em viewport estreita.
2. Dois monitores tentando iniciar no mesmo PC: só uma sessão é criada.
3. PC em manutenção não aceita início; PC ocupado não entra em manutenção.
4. Encerramento libera PC e grava duração coerente; erro de rede não apresenta sucesso falso.
5. Matrícula duplicada é rejeitada mesmo com envios simultâneos; zeros à esquerda preservados.
6. VIS é único e imutável; visitante pode ter acessos repetidos.
7. Cadastro contextual retorna ao PC correto sem iniciar sessão automaticamente.
8. Registros lista pessoas sem acesso e soma corretamente históricos; busca/ordenação funcionam.
9. Edição não altera sessões passadas; cancelamento com mudanças pede confirmação.
10. Filtros do Dashboard alteram todas as métricas e o PDF da mesma maneira.
11. Sessão atravessando meia-noite/mês/turno é recortada corretamente nas horas de uso.
12. Acessos, usuários distintos, duração e percentuais batem com fixtures conhecidas; zero dados não causa divisão inválida.
13. PDF paginado, sem texto cortado, com filtros e data de emissão corretos.
14. Usuário não autenticado ou não autorizado não lê/escreve Firestore nem abre páginas privadas.
15. Anotações aparecem para outros monitores e respeitam regra de edição; Ajuda exibe somente contatos confirmados.

## 15. Plano de implementação em ordem de risco

**Fase 0 — Auditoria e proteção:** inventário read-only, branch, backup, scripts, assets, credenciais, dependências e desenho do Firestore.

**Fase 1 — Fundação:** tema, layout/sidebar, rotas, Firebase Auth, autorização, regras e emuladores; seed de computadores.

**Fase 2 — Núcleo operacional:** Cadastros, Home, transações de sessão/manutenção e cadastro contextual. Prioridade máxima: consistência dos dados.

**Fase 3 — Histórico:** Registros e detalhe/edição de usuários.

**Fase 4 — Estatísticas:** módulo puro de analytics com testes de fixtures, filtros e Dashboard.

**Fase 5 — Relatório:** PDF usando o mesmo objeto de estatísticas; verificação visual e conferência de totais.

**Fase 6 — Complementos:** Anotações, Ajuda, polimento, testes E2E e deploy.

Cada fase deve entregar código compilável, testes pertinentes, mudanças documentadas e um resumo dos riscos. Não executar refatoração geral não solicitada.

## 16. Instruções de execução para o Codex

1. Comece com **auditoria somente leitura** do repositório. Liste arquitetura atual, dependências, rotas, assets, componentes reaproveitáveis, problemas e diferenças em relação a esta especificação. **Não edite arquivos na auditoria.**
2. Apresente plano por fases com arquivos previstos, decisões pendentes e riscos; aguarde aprovação antes de alterações destrutivas.
3. Crie branch de trabalho e ponto de restauração; preserve `main`.
4. Implemente uma fase por vez, com commits pequenos e mensagens claras. Não invente cursos oficiais, contatos da coordenação, horários de turno ou credenciais.
5. Escreva testes para operações concorrentes, datas e métricas; rode build/lint/test e informe resultados reais, sem alegar sucesso sem executar.
6. Nunca introduza dados fictícios no ambiente de produção ou no PDF; dados demonstrativos devem ser explicitamente isolados e rotulados.
7. Solicite confirmação para mudanças de escopo, regras de segurança, migrações irreversíveis e deploy.

## 17. Pendências a confirmar antes do desenvolvimento final

- Lista oficial dos cursos da UESPI no campus e opções válidas de período/turno.
- Horários exatos de manhã/tarde/noite e funcionamento de cada laboratório, para métricas de ocupação.
- Contato oficial de suporte (telefone/e-mail).
- Quem provisiona contas de monitores e quem pode editar/excluir recados de terceiros.
- Regras de dados históricos: snapshot de curso/turno no início da sessão; política de retenção e exportação nominal.
- Firebase Project ID, ambiente de homologação e destino de deploy, sem compartilhar segredos em chat/documentos.
- Requisitos formais do orientador para relatório e documentação acadêmica.

**Decisão de engenharia:** nenhuma dessas pendências deve bloquear a auditoria e o esqueleto da interface; porém não devem ser substituídas por valores inventados na implementação de produção.
