# SGMLab — Configuração manual do Firebase

Projeto: **SGMLab-UESPI** (`sgmlab-uespi`), plano Spark, autenticação por e-mail e senha,
Cloud Firestore `(default)` em `southamerica-east1`.

O código desta etapa já autentica e autoriza monitores, mas **mantém os dados operacionais em
memória**. As regras publicadas bloqueiam as coleções operacionais; isso é intencional até o
PROMPT 07B.

## 1. Variáveis de ambiente

1. Copie `.env.example` para `.env.local` na raiz do projeto.
2. No console do Firebase, em **Configurações do projeto → Seus apps → Web**, copie o objeto
   `firebaseConfig` e preencha:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3. `.env.local` está no `.gitignore` e não deve ser versionado. As variáveis `VITE_*` são
   incorporadas ao bundle: identificam o projeto público, não protegem segredos.
4. Reinicie o servidor de desenvolvimento após alterar o arquivo.

Sem essas variáveis a tela de login exibe o aviso de configuração incompleta e mantém o botão
Entrar desabilitado.

## 2. Primeiro monitor autorizado

1. Em **Authentication → Users**, confirme a conta de monitor de teste e copie o **UID**.
2. Em **Firestore Database → Iniciar coleção**, crie a coleção `monitors`.
3. Document ID: o UID copiado.
4. Campos:
   - `name` (string): nome exibido na sidebar;
   - `active` (boolean): `true` para autorizar;
   - `email` (string, opcional): apenas exibição.
5. Para revogar o acesso, altere `active` para `false` (ou remova o documento).

Sem esse documento, a conta autentica mas vê a tela **Acesso não autorizado**.

## 3. Regras de segurança

As regras versionadas estão em `firestore.rules`. **Não publique sem autorização.** Depois de
aprovadas, a publicação pode ser feita pelo console (Firestore → Regras) ou por:

```bash
npx firebase deploy --only firestore:rules --project sgmlab-uespi
```

Nesta etapa as regras permitem apenas a leitura do próprio documento em `monitors` e negam
todas as demais leituras e gravações de clientes.

## 4. Verificação do login

1. `npm run dev` e abra a aplicação.
2. Entre com a conta de monitor criada no Firebase Authentication.
3. Confirme que a Home abre, que a sidebar mostra o nome do documento `monitors/{uid}` e que
   nenhuma tela operacional aparece antes da verificação.
4. Clique em **Sair** e confirme o retorno para `/login`.
5. Tente abrir `/registros` sem sessão: deve redirecionar para `/login`.
6. Desative o monitor (`active: false`) e confirme a tela de acesso não autorizado.

## 5. Emulador local e testes de regras

Requisitos: Java 11+ e as dependências de desenvolvimento instaladas.

```bash
npm run test:rules
```

O comando inicia apenas o emulador do Firestore (porta 8080) com `firestore.rules`, executa
`tests/rules` e encerra o emulador. Nenhum dado real é utilizado.

Para desenvolvimento com emuladores, defina em `.env.local`:

```
VITE_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
VITE_FIREBASE_FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

e execute `npx firebase emulators:start --only auth,firestore --project demo-sgmlab`.
Mantenha essas variáveis vazias em produção.
