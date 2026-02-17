import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/theme_exports.dart';
import '../../models/diagnostic_types.dart';
import '../../providers/diagnostic_provider.dart';
import '../../services/agent_bridge_service.dart';
import '../../services/vin_decoder_service.dart';
import '../../widgets/shared/shared_exports.dart';

/// Phase 3: VIN — input + decode + vehicle profile + scan history
class VINScreen extends ConsumerStatefulWidget {
  const VINScreen({super.key});

  @override
  ConsumerState<VINScreen> createState() => _VINScreenState();
}

class _VINScreenState extends ConsumerState<VINScreen> {
  late TextEditingController _vinController;
  bool _isDecoding = false;
  bool _isAutoReading = false;

  @override
  void initState() {
    super.initState();
    _vinController = TextEditingController(
      text: ref.read(diagnosticProvider).vin ?? '',
    );
  }

  @override
  void dispose() {
    _vinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(diagnosticProvider);
    final isWide = MediaQuery.of(context).size.width > 768;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(BykiSpacing.lg),
      child: isWide
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: _leftColumn(state)),
                const SizedBox(width: BykiSpacing.lg),
                Expanded(child: _rightColumn(state)),
              ],
            )
          : Column(
              children: [
                _leftColumn(state),
                const SizedBox(height: BykiSpacing.lg),
                _rightColumn(state),
              ],
            ),
    );
  }

  Widget _leftColumn(DiagnosticState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Vehicle Identification',
            style: BykiTypography.h2.copyWith(color: BykiColors.textPrimary)),
        const SizedBox(height: BykiSpacing.lg),

        // VIN Input
        BykiCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('VIN Number',
                  style: BykiTypography.h4
                      .copyWith(color: BykiColors.textPrimary)),
              const SizedBox(height: BykiSpacing.md),
              BykiInput(
                controller: _vinController,
                hint: 'Enter 17-character VIN...',
                mono: true,
                maxLength: 17,
                onChanged: (v) {
                  ref.read(diagnosticProvider.notifier).setVIN(v.toUpperCase());
                },
                suffixIcon:
                    _vinController.text.length == 17 ? Icons.check_circle : null,
              ),
              const SizedBox(height: BykiSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: BykiButton(
                      label: 'Auto-Read from ECU',
                      icon: Icons.auto_fix_high,
                      variant: BykiButtonVariant.secondary,
                      isLoading: _isAutoReading,
                      onPressed: _handleAutoRead,
                    ),
                  ),
                  const SizedBox(width: BykiSpacing.sm),
                  Expanded(
                    child: BykiButton(
                      label: 'Decode VIN',
                      icon: Icons.qr_code_scanner,
                      isLoading: _isDecoding,
                      onPressed: _vinController.text.length == 17
                          ? _handleDecode
                          : null,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: BykiSpacing.lg),

        // VIN Structure Breakdown
        if (state.vin != null && state.vin!.length == 17)
          BykiCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('VIN Structure',
                    style: BykiTypography.h4
                        .copyWith(color: BykiColors.textPrimary)),
                const SizedBox(height: BykiSpacing.md),
                Row(
                  children: [
                    _VINSegment(
                      label: 'WMI',
                      value: state.vin!.substring(0, 3),
                      color: BykiColors.primary,
                      description: 'World Manufacturer ID',
                    ),
                    _VINSegment(
                      label: 'VDS',
                      value: state.vin!.substring(3, 9),
                      color: BykiColors.info,
                      description: 'Vehicle Description',
                    ),
                    _VINSegment(
                      label: 'VIS',
                      value: state.vin!.substring(9, 17),
                      color: BykiColors.purple,
                      description: 'Vehicle Identifier',
                    ),
                  ],
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _rightColumn(DiagnosticState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Vehicle Profile
        if (state.vinData != null) ...[
          BykiCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: BykiColors.emerald50,
                        borderRadius: BorderRadius.circular(BykiRadius.md),
                      ),
                      child: const Center(
                        child:
                            Icon(Icons.directions_car, color: BykiColors.primary),
                      ),
                    ),
                    const SizedBox(width: BykiSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${state.vinData!.decoded?.brand ?? ''} ${state.vinData!.decoded?.model ?? ''}',
                            style: BykiTypography.h3
                                .copyWith(color: BykiColors.textPrimary),
                          ),
                          Text(
                            '${state.vinData!.decoded?.year ?? ''} · ${state.vinData!.decoded?.bodyType ?? "Sedan"}',
                            style: BykiTypography.bodySm
                                .copyWith(color: BykiColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    const BykiBadge(
                      label: 'Decoded',
                      variant: BykiBadgeVariant.success,
                    ),
                  ],
                ),
                const SizedBox(height: BykiSpacing.lg),
                _DetailGrid(state.vinData!),
              ],
            ),
          ),
          const SizedBox(height: BykiSpacing.lg),
        ],

        // Action buttons
        BykiCard(
          child: Column(
            children: [
              BykiButton(
                label: 'Proceed to System Scan',
                icon: Icons.arrow_forward,
                onPressed: state.vinData != null
                    ? () {
                        ref
                            .read(diagnosticProvider.notifier)
                            .setCurrentPhase(DiagnosticPhase.topologyScan);
                        context.go('/topology');
                      }
                    : null,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _handleAutoRead() async {
    setState(() => _isAutoReading = true);
    try {
      // Try reading VIN from the connected ECU via agent bridge
      final bridge = ref.read(agentBridgeProvider);
      final vinResponse = await bridge.readVIN();
      if (vinResponse != null && vinResponse.isNotEmpty) {
        _vinController.text = vinResponse.toUpperCase();
        ref.read(diagnosticProvider.notifier).setVIN(vinResponse.toUpperCase());
        setState(() => _isAutoReading = false);
        _handleDecode();
        return;
      }
    } catch (_) {
      // Fall through to manual entry prompt
    }
    setState(() => _isAutoReading = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not auto-read VIN. Please enter manually.'),
        ),
      );
    }
  }

  Future<void> _handleDecode() async {
    setState(() => _isDecoding = true);
    await Future.delayed(const Duration(milliseconds: 300));

    final vinText = _vinController.text.trim().toUpperCase();
    // Offline decode first (instant)
    var decoded = vinDecoder.decode(vinText);
    ref.read(diagnosticProvider.notifier).setVINData(decoded);

    // Attempt NHTSA vPIC enrichment (async, best-effort)
    vinDecoder.decodeWithEnrichment(vinText).then((enriched) {
      if (!mounted) return;
      if (enriched.decoded?.model != decoded.decoded?.model ||
          enriched.decoded?.brand != decoded.decoded?.brand) {
        ref.read(diagnosticProvider.notifier).setVINData(enriched);
      }
    });

    ref.read(diagnosticProvider.notifier).addNotification(UINotification(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: decoded.isValid ? NotificationType.success : NotificationType.warning,
      title: decoded.isValid ? 'VIN Decoded' : 'VIN Validation Warning',
      message: decoded.isValid
          ? 'Vehicle identified: ${decoded.decoded?.brand ?? "Unknown"} ${decoded.decoded?.model ?? ""}'
          : 'VIN may be invalid — decoded with best effort',
    ));
    setState(() => _isDecoding = false);
  }
}

class _VINSegment extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final String description;

  const _VINSegment({
    required this.label,
    required this.value,
    required this.color,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: BykiSpacing.sm),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(BykiRadius.sm),
            ),
            child: Center(
              child: Text(
                value,
                style: BykiTypography.mono.copyWith(
                  color: color,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(label,
              style:
                  BykiTypography.labelSm.copyWith(color: BykiColors.textPrimary)),
          Text(description,
              style: BykiTypography.bodyXs
                  .copyWith(color: BykiColors.textTertiary)),
        ],
      ),
    );
  }
}

class _DetailGrid extends StatelessWidget {
  final VINData data;

  const _DetailGrid(this.data);

  @override
  Widget build(BuildContext context) {
    final items = [
      _DetailItem('Engine', data.decoded?.engine ?? '—', Icons.speed),
      _DetailItem('Transmission', data.decoded?.transmission ?? '—', Icons.settings),
      _DetailItem('Fuel', data.decoded?.fuelType.name ?? '—', Icons.local_gas_station),
      _DetailItem('Market', data.decoded?.marketRegion.name ?? '—', Icons.public),
    ];

    return Wrap(
      spacing: BykiSpacing.md,
      runSpacing: BykiSpacing.md,
      children: items.map((item) {
        return SizedBox(
          width: 140,
          child: Row(
            children: [
              Icon(item.icon, size: 18, color: BykiColors.textTertiary),
              const SizedBox(width: BykiSpacing.xs),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.label,
                        style: BykiTypography.bodyXs
                            .copyWith(color: BykiColors.textTertiary)),
                    Text(item.value,
                        style: BykiTypography.bodySm.copyWith(
                          color: BykiColors.textPrimary,
                          fontWeight: FontWeight.w500,
                        )),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _DetailItem {
  final String label;
  final String value;
  final IconData icon;

  const _DetailItem(this.label, this.value, this.icon);
}
