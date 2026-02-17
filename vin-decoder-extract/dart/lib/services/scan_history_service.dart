/// Scan history service — ported from scan-history.service.ts
/// Persists completed diagnostic scans to Firestore for
/// vehicle history tracking and trend analysis.

import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/diagnostic_types.dart';

/// Data needed to save a completed scan.
class SaveScanData {
  final String vin;
  final String brand;
  final String model;
  final int year;
  final List<ECUInfo> ecusFound;
  final List<DiagnosticTroubleCode> confirmedDtcs;
  final List<DiagnosticTroubleCode> pendingDtcs;
  final List<DiagnosticTroubleCode> permanentDtcs;
  final Map<String, FreezeFrameData> freezeFrames;
  final List<MonitoringTestResult> monitoringTests;
  final ReadinessMonitors? readinessMonitors;
  final List<LiveDataParameter> liveDataSnapshot;
  final ClearResults? dtcsCleared;
  final List<DiagnosticCase> diagnosticCases;
  final int overallHealthScore;

  const SaveScanData({
    required this.vin,
    required this.brand,
    required this.model,
    required this.year,
    required this.ecusFound,
    required this.confirmedDtcs,
    required this.pendingDtcs,
    required this.permanentDtcs,
    this.freezeFrames = const {},
    this.monitoringTests = const [],
    this.readinessMonitors,
    this.liveDataSnapshot = const [],
    this.dtcsCleared,
    this.diagnosticCases = const [],
    required this.overallHealthScore,
  });
}

class ScanHistoryService {
  static const _collectionName = 'vehicleScans';

  FirebaseFirestore get _firestore => FirebaseFirestore.instance;

  /// Save a completed scan to Firestore. Returns document ID or null on error.
  Future<String?> saveScan(SaveScanData data) async {
    try {
      final doc = await _firestore.collection(_collectionName).add({
        'vin': data.vin,
        'brand': data.brand,
        'model': data.model,
        'year': data.year,
        'scannedAt': FieldValue.serverTimestamp(),
        'ecusFound': data.ecusFound.map((e) => {
          'id': e.id,
          'name': e.name,
          'type': e.type.name,
          'address': e.address,
          'status': e.status.name,
        }).toList(),
        'confirmedDtcs': data.confirmedDtcs.map((d) => {
          'code': d.code,
          'description': d.description,
          'severity': d.severity?.name,
        }).toList(),
        'pendingDtcs': data.pendingDtcs.map((d) => {
          'code': d.code,
          'description': d.description,
          'severity': d.severity?.name,
        }).toList(),
        'permanentDtcs': data.permanentDtcs.map((d) => {
          'code': d.code,
          'description': d.description,
          'severity': d.severity?.name,
        }).toList(),
        'diagnosticCaseCount': data.diagnosticCases.length,
        'overallHealthScore': data.overallHealthScore,
        'totalDtcCount': data.confirmedDtcs.length +
            data.pendingDtcs.length +
            data.permanentDtcs.length,
      });
      return doc.id;
    } catch (e) {
      // Silently fail — scan history is non-critical
      return null;
    }
  }

  /// Retrieve scan history for a given VIN.
  Future<List<VehicleScan>> getHistoryByVin(String vin, {int maxResults = 10}) async {
    try {
      final snapshot = await _firestore
          .collection(_collectionName)
          .where('vin', isEqualTo: vin)
          .orderBy('scannedAt', descending: true)
          .limit(maxResults)
          .get();

      return snapshot.docs.map((doc) {
        final d = doc.data();
        return VehicleScan(
          id: doc.id,
          vin: d['vin'] ?? '',
          brand: d['brand'] ?? '',
          model: d['model'] ?? '',
          year: d['year'] ?? 0,
          scannedAt: ((d['scannedAt'] as Timestamp?)?.toDate() ?? DateTime.now()).toIso8601String(),
          totalDtcCount: d['totalDtcCount'] ?? 0,
          overallHealthScore: d['overallHealthScore'] ?? 0,
        );
      }).toList();
    } catch (e) {
      return [];
    }
  }
}

/// Singleton instance.
final scanHistoryService = ScanHistoryService();
