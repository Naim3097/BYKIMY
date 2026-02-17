// ============================================================
// BYKI WORKSHOP DIAGNOSTIC - SCAN HISTORY SERVICE
// Firebase/Firestore CRUD for vehicle scan sessions
// ============================================================

import { db, isConfigured } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import type {
  VehicleScan,
  ECUInfo,
  DiagnosticTroubleCode,
  LiveDataParameter,
  MonitoringTestResult,
  ReadinessMonitors,
  DiagnosticCase,
  ClearResults,
  FreezeFrameData,
} from '@/types';

// ============ Types ============

export interface SaveScanData {
  vin: string;
  brand: string;
  model: string;
  year: number;
  ecusFound: ECUInfo[];
  confirmedDtcs: DiagnosticTroubleCode[];
  pendingDtcs: DiagnosticTroubleCode[];
  permanentDtcs: DiagnosticTroubleCode[];
  freezeFrames: Record<string, FreezeFrameData>;
  monitoringTests: MonitoringTestResult[];
  readinessMonitors: ReadinessMonitors | null;
  liveDataSnapshot: LiveDataParameter[];
  dtcsCleared: ClearResults | null;
  diagnosticCases: DiagnosticCase[];
  overallHealthScore: number;
}

// ============ Service ============

class ScanHistoryService {
  private collectionName = 'vehicleScans';

  /**
   * Save a complete scan session to Firestore
   */
  async saveScan(data: SaveScanData): Promise<string | null> {
    if (!isConfigured || !db) {
      console.warn('Firebase not configured — scan not saved');
      return null;
    }

    try {
      // Serialize DTC objects to plain data for Firestore
      const docData = {
        vin: data.vin,
        scannedAt: serverTimestamp(),
        brand: data.brand,
        model: data.model,
        year: data.year,
        ecusFound: data.ecusFound.map((e) => ({
          type: e.type,
          name: e.name,
          address: e.address,
          status: e.status,
        })),
        confirmedDtcs: data.confirmedDtcs.map((d) => ({
          code: d.code,
          description: d.definition.description,
          severity: d.definition.severity,
        })),
        pendingDtcs: data.pendingDtcs.map((d) => ({
          code: d.code,
          description: d.definition.description,
        })),
        permanentDtcs: data.permanentDtcs.map((d) => ({
          code: d.code,
          description: d.definition.description,
        })),
        freezeFrames: Object.entries(data.freezeFrames).reduce(
          (acc, [code, ff]) => ({
            ...acc,
            [code]: {
              engineRPM: ff.engineRPM,
              vehicleSpeed: ff.vehicleSpeed,
              coolantTemp: ff.coolantTemp,
              engineLoad: ff.engineLoad,
            },
          }),
          {}
        ),
        monitoringTests: data.monitoringTests.map((t) => ({
          component: t.component,
          healthPct: t.healthPct,
          passed: t.passed,
        })),
        readinessMonitors: data.readinessMonitors
          ? {
              milOn: data.readinessMonitors.milOn,
              monitors: data.readinessMonitors.monitors.map((m) => ({
                name: m.name,
                available: m.available,
                complete: m.complete,
              })),
            }
          : null,
        overallHealthScore: data.overallHealthScore,
        dtcCount:
          data.confirmedDtcs.length +
          data.pendingDtcs.length +
          data.permanentDtcs.length,
      };

      const docRef = await addDoc(collection(db, this.collectionName), docData);
      return docRef.id;
    } catch (error) {
      console.error('Failed to save scan:', error);
      return null;
    }
  }

  /**
   * Load scan history for a specific VIN (most recent first)
   */
  async getHistoryByVin(vin: string, maxResults = 10): Promise<VehicleScan[]> {
    if (!isConfigured || !db) {
      return [];
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('vin', '==', vin),
        orderBy('scannedAt', 'desc'),
        limit(maxResults)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          vin: data.vin,
          scannedAt: data.scannedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          brand: data.brand || '',
          model: data.model || '',
          year: data.year || 0,
          confirmedDtcs: (data.confirmedDtcs || []).map((d: any) => d.code),
          pendingDtcs: (data.pendingDtcs || []).map((d: any) => d.code),
          permanentDtcs: (data.permanentDtcs || []).map((d: any) => d.code),
          healthScore: data.overallHealthScore ?? null,
          monitoringTests: data.monitoringTests || [],
        };
      });
    } catch (error) {
      console.error('Failed to load scan history:', error);
      return [];
    }
  }
}

export const scanHistoryService = new ScanHistoryService();
