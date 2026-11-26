# SGMLab — UESPI

Aplicação web em React e JavaScript para o gerenciamento e monitoramento dos laboratórios da UESPI, Campus Parnaíba.

## Desenvolvimento local

Use Node.js 22.22.2 ou posterior na linha 22, Node.js 24.15.0 ou posterior na linha 24, ou Node.js 26 ou superior.

```sh
npm ci
npm run dev
```

O Vite mostra a URL local no terminal. `npm start` é um alias para o mesmo servidor.

| Comando | Ação |
| --- | --- |
| `npm run build` | Gera o bundle de produção em `dist/`. |
| `npm run preview` | Serve localmente o bundle já gerado. |
| `npm run lint` | Executa o ESLint. |
| `npm test` | Executa o Vitest uma vez. |

Em hospedagem estática, configure o fallback para `index.html` nas rotas da aplicação para permitir a abertura direta e a atualização da página.

Requisitos e orientações de desenvolvimento estão na [especificação técnica](SGMLab_Especificacao_Tecnica.md) e em [AGENTS.md](AGENTS.md).
