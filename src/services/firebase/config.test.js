import { describe, expect, test } from "vitest";
import { FirebaseConfigurationError, readFirebaseConfiguration } from "./config";

const completeEnvironment = {
  VITE_FIREBASE_API_KEY: "chave-de-teste",
  VITE_FIREBASE_AUTH_DOMAIN: "sgmlab-uespi.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "sgmlab-uespi",
  VITE_FIREBASE_STORAGE_BUCKET: "sgmlab-uespi.firebasestorage.app",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  VITE_FIREBASE_APP_ID: "1:123456789:web:abcdef",
};

describe("configuração do Firebase", () => {
  test("lista todas as variáveis ausentes quando o ambiente está vazio", () => {
    const configuration = readFirebaseConfiguration({});

    expect(configuration.configured).toBe(false);
    expect(configuration.config).toBeNull();
    expect(configuration.missing).toEqual([
      "VITE_FIREBASE_API_KEY",
      "VITE_FIREBASE_AUTH_DOMAIN",
      "VITE_FIREBASE_PROJECT_ID",
      "VITE_FIREBASE_STORAGE_BUCKET",
      "VITE_FIREBASE_MESSAGING_SENDER_ID",
      "VITE_FIREBASE_APP_ID",
    ]);
  });

  test("aceita configuração completa e remove espaços", () => {
    const configuration = readFirebaseConfiguration({
      ...completeEnvironment,
      VITE_FIREBASE_PROJECT_ID: "  sgmlab-uespi  ",
    });

    expect(configuration.configured).toBe(true);
    expect(configuration.missing).toEqual([]);
    expect(configuration.config).toMatchObject({
      apiKey: "chave-de-teste",
      projectId: "sgmlab-uespi",
      appId: "1:123456789:web:abcdef",
    });
  });

  test("ignora valores vazios ou apenas com espaços", () => {
    const configuration = readFirebaseConfiguration({
      ...completeEnvironment,
      VITE_FIREBASE_APP_ID: "   ",
    });

    expect(configuration.configured).toBe(false);
    expect(configuration.missing).toEqual(["VITE_FIREBASE_APP_ID"]);
  });

  test("expõe mensagem com o nome das variáveis ausentes", () => {
    const error = new FirebaseConfigurationError(["VITE_FIREBASE_API_KEY"]);

    expect(error.message).toContain("VITE_FIREBASE_API_KEY");
    expect(error.message).toContain(".env.local");
    expect(error.missing).toEqual(["VITE_FIREBASE_API_KEY"]);
  });
});
