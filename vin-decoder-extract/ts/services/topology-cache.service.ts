// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - TOPOLOGY CACHE SERVICE
// ECU Discovery Result Caching with 24hr TTL
// Prevents redundant 90-180s scans on page refresh
// ============================================================

import { ECUInfo } from '@/types';

interface CachedTopology {
  vin: string;
  timestamp: number;
  scannedAt: Date;
  ecus: ECUInfo[];
  expiresAt: number;
  vciType: 'ELM327' | 'USB_CAN';
  scanDuration: number; // seconds
  version: string;
}

const CACHE_VERSION = '1.0.0';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const DB_NAME = 'byki_topology_cache';
const STORE_NAME = 'topology';

class TopologyCacheService {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB connection
   */
  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => {
        console.error('Failed to open topology cache database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store with VIN as key
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'vin' });
          
          // Indexes for efficient queries
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
          
          console.log('✓ Topology cache database initialized');
        }
      };
    });
  }

  /**
   * Get cached topology for a VIN
   * Returns null if not cached or expired
   */
  async get(vin: string): Promise<CachedTopology | null> {
    if (!vin) return null;

    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.get(vin);

        request.onsuccess = () => {
          const cached = request.result as CachedTopology | undefined;

          if (!cached) {
            resolve(null);
            return;
          }

          // Check if expired
          if (cached.expiresAt < Date.now()) {
            console.log(`⚠ Topology cache expired for VIN ${vin}`);
            this.delete(vin); // Clean up expired entry
            resolve(null);
            return;
          }

          // Check version compatibility
          if (cached.version !== CACHE_VERSION) {
            console.log(`⚠ Topology cache version mismatch for VIN ${vin}`);
            this.delete(vin);
            resolve(null);
            return;
          }

          console.log(`✓ Topology cache hit for VIN ${vin} (${cached.ecus.length} ECUs, scanned ${formatAge(cached.timestamp)} ago)`);
          resolve(cached);
        };

        request.onerror = () => {
          console.error('Failed to retrieve cached topology');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Topology cache retrieval error:', error);
      return null; // Fail gracefully
    }
  }

  /**
   * Store topology scan results
   */
  async set(
    vin: string,
    ecus: ECUInfo[],
    vciType: 'ELM327' | 'USB_CAN',
    scanDuration: number
  ): Promise<void> {
    if (!vin || !ecus || ecus.length === 0) {
      console.warn('Cannot cache empty topology');
      return;
    }

    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const now = Date.now();
      const cached: CachedTopology = {
        vin,
        timestamp: now,
        scannedAt: new Date(),
        ecus,
        expiresAt: now + CACHE_TTL_MS,
        vciType,
        scanDuration,
        version: CACHE_VERSION,
      };

      return new Promise((resolve, reject) => {
        const request = store.put(cached);

        request.onsuccess = () => {
          console.log(`✓ Topology cached for VIN ${vin} (${ecus.length} ECUs, expires in 24h)`);
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to cache topology');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Topology cache storage error:', error);
      // Don't throw - caching is optional
    }
  }

  /**
   * Delete cached topology for a VIN
   */
  async delete(vin: string): Promise<void> {
    if (!vin) return;

    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.delete(vin);

        request.onsuccess = () => {
          console.log(`✓ Topology cache cleared for VIN ${vin}`);
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to delete cached topology');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Topology cache deletion error:', error);
    }
  }

  /**
   * Get all cached topologies
   */
  async getAll(): Promise<CachedTopology[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const all = request.result as CachedTopology[];
          
          // Filter out expired entries
          const valid = all.filter(cached => cached.expiresAt > Date.now());
          
          resolve(valid);
        };

        request.onerror = () => {
          console.error('Failed to retrieve all cached topologies');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Topology cache retrieval error:', error);
      return [];
    }
  }

  /**
   * Clear all expired entries
   */
  async cleanupExpired(): Promise<number> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('expiresAt');

      const now = Date.now();
      let deletedCount = 0;

      return new Promise((resolve, reject) => {
        const request = index.openCursor(IDBKeyRange.upperBound(now));

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            if (deletedCount > 0) {
              console.log(`✓ Cleaned up ${deletedCount} expired topology cache entries`);
            }
            resolve(deletedCount);
          }
        };

        request.onerror = () => {
          console.error('Failed to cleanup expired cache');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Topology cache cleanup error:', error);
      return 0;
    }
  }

  /**
   * Clear all cached topologies
   */
  async clearAll(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
          console.log('✓ All topology cache cleared');
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to clear topology cache');
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Topology cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalEntries: number;
    totalECUs: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    avgScanDuration: number;
  }> {
    const all = await this.getAll();

    if (all.length === 0) {
      return {
        totalEntries: 0,
        totalECUs: 0,
        oldestEntry: null,
        newestEntry: null,
        avgScanDuration: 0,
      };
    }

    const totalECUs = all.reduce((sum, cached) => sum + cached.ecus.length, 0);
    const timestamps = all.map(cached => cached.timestamp);
    const oldestEntry = new Date(Math.min(...timestamps));
    const newestEntry = new Date(Math.max(...timestamps));
    const avgScanDuration = all.reduce((sum, cached) => sum + cached.scanDuration, 0) / all.length;

    return {
      totalEntries: all.length,
      totalECUs,
      oldestEntry,
      newestEntry,
      avgScanDuration,
    };
  }
}

/**
 * Format cache age in human-readable format
 */
function formatAge(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

// Singleton instance
export const topologyCacheService = new TopologyCacheService();

// Cleanup expired entries on app load
if (typeof window !== 'undefined') {
  topologyCacheService.cleanupExpired().catch(console.error);
}
