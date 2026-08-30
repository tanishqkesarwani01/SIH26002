// Offline-First IndexedDB and LocalStorage Buffer Manager for Remote Field Operations

const DB_NAME = "NER_LRP_OFFLINE_DB";
const STORE_NAME = "incident_buffer_queue";
const DB_VERSION = 1;

class OfflineStorageManager {
  constructor() {
    this.db = null;
    this.initDb();
  }

  initDb() {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        resolve(null);
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  // Save report to offline queue
  async queueIncident(incident) {
    const queueItem = {
      ...incident,
      id: incident.id || `OFFLINE-INC-${Date.now()}`,
      status: "PENDING_OFFLINE_BUFFER",
      queuedAt: new Date().toISOString(),
    };

    // Save to LocalStorage fallback
    const localQueue = this.getLocalStorageQueue();
    localQueue.unshift(queueItem);
    localStorage.setItem(STORE_NAME, JSON.stringify(localQueue));

    // Try IndexedDB if open
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(queueItem);
      } catch (err) {
        console.warn("IndexedDB write fallback to localStorage:", err);
      }
    }

    return queueItem;
  }

  getLocalStorageQueue() {
    try {
      const data = localStorage.getItem(STORE_NAME);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Get all pending buffered items
  async getPendingQueue() {
    const local = this.getLocalStorageQueue();
    return local.filter((i) => i.status === "PENDING_OFFLINE_BUFFER");
  }

  // Mark all items as synced after network restore
  async markAllSynced() {
    const local = this.getLocalStorageQueue();
    const updated = local.map((item) => ({
      ...item,
      status: "SYNCED",
      syncedAt: new Date().toISOString(),
    }));
    localStorage.setItem(STORE_NAME, JSON.stringify(updated));

    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        updated.forEach((item) => store.put(item));
      } catch (err) {
        console.warn("IndexedDB sync update:", err);
      }
    }

    return updated;
  }

  // Clear or reset storage
  clearQueue() {
    localStorage.removeItem(STORE_NAME);
  }
}

export const offlineStorage = new OfflineStorageManager();
