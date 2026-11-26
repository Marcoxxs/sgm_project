# SGMLab — Instruções para agentes de desenvolvimento

## 1. Contexto do projeto

O SGMLab é um Trabalho de Conclusão de Curso
destinado ao gerenciamento e monitoramento
dos laboratórios de informática da UESPI,
Campus Parnaíba.

O projeto possui prazo reduzido.
Priorize funcionalidade, segurança, simplicidade
e fidelidade à especificação técnica.

## 2. Fonte oficial de requisitos

Leia integralmente o arquivo:

SGMLab_Especificacao_Tecnica.md

Esse documento é a fonte principal de requisitos,
regras de negócio e decisões arquiteturais.

Não altere requisitos sem autorização.

Caso encontre ambiguidades ou conflitos,
comunique-os antes de implementar.

## 3. Diretrizes de desenvolvimento

- Priorize código simples, legível e modular.
- Reutilize componentes sempre que possível.
- Evite dependências desnecessárias.
- Não adicione funcionalidades fora do escopo.
- Preserve a identidade visual aprovada.
- Não utilize dados fictícios em produção.
- Separe interface, regras de negócio e persistência.
- Não exponha credenciais ou informações sensíveis.

## 4. Regras críticas do SGMLab

- Delta Lab: 15 computadores, matriz 3x5.
- Carnaúba Lab: 24 computadores, matriz 4x6.
- Preserve as posições físicas dos computadores.
- Branco: disponível.
- Azul: ocupado.
- Vermelho: manutenção.
- Impeça sessões simultâneas no mesmo computador.
- Garanta a unicidade das matrículas.
- Preserve o histórico das sessões.
- Centralize os cálculos estatísticos.
- Dashboard e PDF devem compartilhar os cálculos.

## 5. Segurança e Firebase

- Utilize Firebase Authentication.
- Utilize Cloud Firestore para persistência.
- Implemente regras de segurança no Firestore.
- Valide dados antes de gravá-los.
- Utilize timestamps confiáveis.
- Proteja operações concorrentes.
- Nunca exponha credenciais privadas.

## 6. Controle de versão

- Não modifique diretamente a branch main.
- Preserve o código existente antes da reconstrução.
- Trabalhe em etapas incrementais.
- Não exclua arquivos sem justificativa.
- Não execute commits ou pushes sem autorização.

## 7. Testes e qualidade

Após cada implementação:

- Verifique erros de compilação.
- Execute os testes disponíveis.
- Valide as regras de negócio.
- Verifique possíveis regressões.
- Informe problemas encontrados.

Nunca declare uma funcionalidade como concluída
sem verificar seu funcionamento.

## 8. Comunicação

Ao finalizar cada tarefa, apresente:

- Resumo das alterações.
- Arquivos criados ou modificados.
- Testes executados e seus resultados.
- Problemas e limitações.
- Decisões técnicas tomadas.
- Próxima etapa recomendada.

Aguarde autorização antes de iniciar
uma nova etapa de implementação.
