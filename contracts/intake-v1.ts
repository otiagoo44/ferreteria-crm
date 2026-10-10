export const units = [
  "unidad",
  "bolsa",
  "kg",
  "m",
  "m2",
  "m3",
  "l",
  "por_confirmar",
] as const;
export type Unit = (typeof units)[number];
export const unitLabels: Record<Unit, string> = {
  unidad: "unidad",
  bolsa: "bolsa",
  kg: "kg",
  m: "m",
  m2: "m²",
  m3: "m³",
  l: "litro",
  por_confirmar: "Por confirmar",
};
export const decimalUnits: readonly Unit[] = [
  "kg",
  "m",
  "m2",
  "m3",
  "l",
  "por_confirmar",
];
export const limits = {
  bodyBytes: 32768,
  items: 50,
  name: 100,
  message: 2000,
  description: 300,
  productRef: 100,
  consentVersion: 50,
  attribution: 200,
  quantity: 1000000,
} as const;
export type IntakeItem = {
  product_ref?: string;
  description: string;
  quantity: number;
  unit: Unit;
};
export type IntakeV1 = {
  schema_version: 1;
  submission_id: string;
  name: string;
  phone: string;
  message: string;
  items: IntakeItem[];
  fulfilment_preference?: "pickup" | "delivery" | "unsure";
  contact_consent: true;
  consent_version: string;
  attribution?: { source?: string; campaign?: string };
};
export type IntakeReceipt = {
  status: "received";
  reference: string;
  received_at: string;
};
export type IntakeResult = { httpStatus: 200 | 201; receipt: IntakeReceipt };
export const consentVersion = "contact-v1-draft";
