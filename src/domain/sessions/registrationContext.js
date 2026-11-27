import { isRegistration } from "../people/people";
import { labs } from "./labs";

export function readRegistrationContext(context) {
  if (typeof context?.registration !== "string" || !isRegistration(context.registration)) return null;
  const lab = labs.find(({ id }) => id === context.labId);
  const number = typeof context.computerId === "string" ? Number(context.computerId.split("_")[1]) : NaN;
  if (!lab || !Number.isInteger(number) || number < 1 || number > lab.rows * lab.columns) return null;
  if (context.computerId !== `${lab.id}_${String(number).padStart(2, "0")}`) return null;
  return { labId: lab.id, computerId: context.computerId, registration: context.registration };
}
