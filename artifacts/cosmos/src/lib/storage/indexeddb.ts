const DB_NAME = "cosmos-os";
const DB_VERSION = 1;

export interface LocalEntry {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
}

let db: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (db) return db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
    req.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains("entries")) {
        const store = database.createObjectStore("entries", { keyPath: "id" });
        store.createIndex("type", "type", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

export async function saveEntry(entry: LocalEntry): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("entries", "readwrite");
    const store = tx.objectStore("entries");
    const req = store.put(entry);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

export async function getEntry(id: string): Promise<LocalEntry | null> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("entries", "readonly");
    const store = tx.objectStore("entries");
    const req = store.get(id);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result ?? null);
  });
}

export async function getAllEntries(type?: string): Promise<LocalEntry[]> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("entries", "readonly");
    const store = tx.objectStore("entries");
    const req = type ? store.index("type").getAll(type) : store.getAll();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result ?? []);
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction("entries", "readwrite");
    const store = tx.objectStore("entries");
    const req = store.delete(id);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}
