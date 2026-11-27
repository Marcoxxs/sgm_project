import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";

const [emulatorHost, emulatorPort] = (process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080").split(":");

let environment;

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: process.env.GCLOUD_PROJECT ?? "demo-sgmlab",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: emulatorHost,
      port: Number(emulatorPort),
    },
  });
});

afterAll(async () => {
  await environment.cleanup();
});

beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "monitors/active-monitor"), { name: "Monitor Ativo", active: true });
    await setDoc(doc(db, "monitors/inactive-monitor"), { name: "Monitor Inativo", active: false });
    await setDoc(doc(db, "people/person-1"), { name: "Pessoa de teste", type: "visitor" });
    await setDoc(doc(db, "sessions/session-1"), { personId: "person-1", status: "active" });
    await setDoc(doc(db, "computers/delta_01"), { labId: "delta", pcNumber: 1, status: "available" });
    await setDoc(doc(db, "personKeys/visitor_VIS-0001"), { personId: "person-1", kind: "visitor" });
    await setDoc(doc(db, "maintenanceEvents/event-1"), { computerId: "delta_01", action: "entered" });
    await setDoc(doc(db, "counters/visitorCode"), { value: 1 });
    await setDoc(doc(db, "notes/note-1"), { title: "Nota", body: "Teste" });
  });
});

const monitorDatabase = (uid = "active-monitor") => environment.authenticatedContext(uid).firestore();
const anonymousDatabase = () => environment.unauthenticatedContext().firestore();

describe("autorização de monitores", () => {
  it("nega leitura para usuário não autenticado", async () => {
    const db = anonymousDatabase();

    await assertFails(getDoc(doc(db, "monitors/active-monitor")));
    await assertFails(getDoc(doc(db, "people/person-1")));
  });

  it("permite ao monitor ler somente o próprio documento", async () => {
    const db = monitorDatabase();

    await assertSucceeds(getDoc(doc(db, "monitors/active-monitor")));
    await assertFails(getDoc(doc(db, "monitors/inactive-monitor")));
  });

  it("permite ao monitor desativado ler o próprio documento, mas mantém os dados operacionais bloqueados", async () => {
    const db = monitorDatabase("inactive-monitor");

    const snapshot = await assertSucceeds(getDoc(doc(db, "monitors/inactive-monitor")));
    expect(snapshot.data().active).toBe(false);
    await assertFails(getDoc(doc(db, "people/person-1")));
  });

  it("nega a listagem da coleção de monitores", async () => {
    const db = monitorDatabase();

    await assertFails(getDocs(collection(db, "monitors")));
  });

  it("impede criação de novos documentos de monitor", async () => {
    const db = monitorDatabase();

    await assertFails(setDoc(doc(db, "monitors/new-monitor"), { name: "Invasor", active: true }));
    await assertFails(setDoc(doc(db, "monitors/active-monitor"), { name: "Trocado", active: true }));
  });

  it("impede alteração e exclusão do próprio documento de autorização", async () => {
    const db = monitorDatabase();

    await assertFails(updateDoc(doc(db, "monitors/active-monitor"), { active: false }));
    await assertFails(deleteDoc(doc(db, "monitors/active-monitor")));
  });
});

describe("bloqueio das coleções operacionais", () => {
  const operationalDocuments = [
    ["people/person-1"],
    ["sessions/session-1"],
    ["computers/delta_01"],
    ["personKeys/visitor_VIS-0001"],
    ["maintenanceEvents/event-1"],
    ["counters/visitorCode"],
    ["notes/note-1"],
  ];

  it.each(operationalDocuments)("bloqueia leitura e escrita em %s para monitor ativo", async (path) => {
    const db = monitorDatabase();

    await assertFails(getDoc(doc(db, path)));
    await assertFails(getDocs(collection(db, path.split("/")[0])));
    await assertFails(setDoc(doc(db, path), { alterado: true }));
  });

  it("bloqueia coleções desconhecidas", async () => {
    const db = monitorDatabase();

    await assertFails(getDoc(doc(db, "desconhecida/documento")));
    await assertFails(setDoc(doc(db, "desconhecida/documento"), { qualquer: "valor" }));
  });
});
