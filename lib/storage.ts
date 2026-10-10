import type { Design } from "./canvas";
export type Entry = {
  id: string;
  title: string;
  body: string;
  kind: "Reflection" | "Prayer" | "Gratitude" | "Saved scripture";
  createdAt: string;
  updatedAt: string;
};
export type State = {
  designs: Design[];
  entries: Entry[];
  favorites: string[];
  templates: number[];
  challenge: Record<string, string[]>;
  activity: Record<string, string[]>;
  preferences: { name: string };
};
export const emptyState: State = {
  designs: [],
  entries: [],
  favorites: [],
  templates: [],
  challenge: {},
  activity: {},
  preferences: { name: "" },
};
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("daily-scripture-studio", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("studio");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error(
          "Browser storage is unavailable. Check your browser privacy settings.",
        ),
      );
    request.onblocked = () =>
      reject(new Error("Close other Studio tabs and try again."));
  });
}
export async function readState(): Promise<State> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("studio", "readonly");
    const request = tx.objectStore("studio").get("state");
    request.onsuccess = () =>
      resolve(request.result ?? structuredClone(emptyState));
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => database.close();
  });
}
export async function writeState(state: State) {
  const database = await db();
  return new Promise<void>((resolve, reject) => {
    const tx = database.transaction("studio", "readwrite");
    tx.objectStore("studio").put(state, "state");
    tx.oncomplete = () => {
      database.close();
      resolve();
    };
    tx.onabort = () => {
      database.close();
      reject(
        new Error(
          "Your changes could not be saved. Browser storage may be full. Export a backup and free some space.",
        ),
      );
    };
  });
}
export function validateBackup(value: unknown): State {
  if (!value || typeof value !== "object")
    throw new Error("This is not a Studio backup.");
  const envelope = value as { version?: number; data?: State };
  const s = envelope.data;
  if (
    envelope.version !== 1 ||
    !s ||
    !Array.isArray(s.designs) ||
    !Array.isArray(s.entries) ||
    !Array.isArray(s.favorites) ||
    !Array.isArray(s.templates) ||
    !s.challenge ||
    !s.activity ||
    !s.preferences
  )
    throw new Error("Invalid or unsupported backup format.");
  if (
    s.entries.some(
      (e) =>
        !e ||
        typeof e.id !== "string" ||
        typeof e.title !== "string" ||
        typeof e.body !== "string" ||
        !["Reflection", "Prayer", "Gratitude", "Saved scripture"].includes(
          e.kind,
        ) ||
        !Number.isFinite(Date.parse(e.createdAt)) ||
        !Number.isFinite(Date.parse(e.updatedAt)),
    )
  )
    throw new Error("Invalid journal data in backup.");
  const safeBackground = (b: string) =>
    /^#[0-9a-f]{6}$/i.test(b) ||
    b === "gradient" ||
    /^\/images\/(lake|mountain|forest|sunrise)\.jpg$/.test(b) ||
    /^data:image\/(png|jpeg|webp);base64,/.test(b);
  if (
    s.designs.some(
      (d) =>
        !d ||
        typeof d.id !== "string" ||
        typeof d.title !== "string" ||
        typeof d.decoration !== "boolean" ||
        !Number.isFinite(Date.parse(d.updatedAt)) ||
        (d.exportedAt !== undefined &&
          !Number.isFinite(Date.parse(d.exportedAt))) ||
        typeof d.text !== "string" ||
        typeof d.reference !== "string" ||
        typeof d.background !== "string" ||
        !safeBackground(d.background) ||
        !["1:1", "4:5", "9:16", "16:9"].includes(d.ratio) ||
        !["Editorial", "Georgia", "Arial"].includes(d.font) ||
        !["left", "center", "right"].includes(d.align) ||
        ![d.size, d.x, d.y, d.spacing, d.lineHeight, d.overlay].every(
          Number.isFinite,
        ) ||
        d.size < 18 ||
        d.size > 120 ||
        d.x < 0 ||
        d.x > 100 ||
        d.y < 0 ||
        d.y > 100 ||
        d.overlay < 0 ||
        d.overlay > 1 ||
        d.spacing < 0 ||
        d.spacing > 8 ||
        d.lineHeight < 0.8 ||
        d.lineHeight > 2 ||
        !/^#[0-9a-f]{6}$/i.test(d.color),
    )
  )
    throw new Error("Invalid design data in backup.");
  if (
    s.favorites.some((f) => typeof f !== "string") ||
    s.templates.some((t) => !Number.isInteger(t) || t < 0 || t > 5) ||
    Object.values(s.challenge).some(
      (a) => !Array.isArray(a) || a.some((x) => typeof x !== "string"),
    ) ||
    Object.values(s.activity).some(
      (a) => !Array.isArray(a) || a.some((x) => typeof x !== "string"),
    ) ||
    typeof s.preferences.name !== "string"
  )
    throw new Error("Invalid progress data in backup.");
  return s;
}
