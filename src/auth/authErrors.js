const messages = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Informe um e-mail válido.",
  "auth/invalid-login-credentials": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-disabled": "Esta conta foi desativada. Procure a coordenação.",
  "auth/too-many-requests": "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.",
  "auth/network-request-failed": "Não foi possível conectar ao serviço de autenticação. Verifique sua conexão.",
  "auth/operation-not-allowed": "O login por e-mail e senha não está habilitado no Firebase.",
};

export function authErrorMessage(error) {
  return messages[error?.code] ?? "Não foi possível entrar. Tente novamente.";
}
