import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/theme_exports.dart';
import '../../providers/diagnostic_provider.dart';

/// Persistent header bar — BYKI branding + connection status + session info
class BykiHeader extends ConsumerWidget implements PreferredSizeWidget {
  const BykiHeader({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(72);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(diagnosticProvider);
    final isWide = MediaQuery.of(context).size.width > 600;

    return Container(
      height: preferredSize.height,
      padding: const EdgeInsets.symmetric(horizontal: BykiSpacing.lg),
      decoration: BoxDecoration(
        color: BykiColors.surface,
        boxShadow: [BykiShadows.soft],
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // Logo + Title
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: BykiColors.primaryGradient,
                borderRadius: BorderRadius.circular(BykiRadius.sm),
              ),
              child: const Center(
                child: Text(
                  'B',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ),
            const SizedBox(width: BykiSpacing.md),
            if (isWide)
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ShaderMask(
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [BykiColors.gray900, BykiColors.gray600],
                    ).createShader(bounds),
                    child: const Text(
                      'BYKI Digital Diagnostic Centre',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        fontFamily: 'Inter',
                      ),
                    ),
                  ),
                  Text(
                    'Professional Automotive Intelligence System',
                    style: BykiTypography.bodyXs.copyWith(
                      color: BykiColors.textSecondary,
                    ),
                  ),
                ],
              ),
            const Spacer(),
            // Status chips
            if (state.isConnected) ...[
              _StatusChip(
                icon: Icons.bluetooth_connected,
                label: 'Connected',
                color: BykiColors.success,
              ),
              const SizedBox(width: BykiSpacing.sm),
            ],
            if (state.vinData != null && isWide) ...[
              _StatusChip(
                icon: Icons.directions_car,
                label: '${state.vinData!.decoded?.brand ?? ""} ${state.vinData!.decoded?.model ?? ""}',
                color: BykiColors.info,
              ),
              const SizedBox(width: BykiSpacing.sm),
            ],
            if (state.sessionStartTime != null)
              _SessionTimer(startTime: state.sessionStartTime!),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _StatusChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: BykiSpacing.sm,
        vertical: BykiSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(BykiRadius.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: BykiTypography.labelSm.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _SessionTimer extends StatelessWidget {
  final DateTime startTime;

  const _SessionTimer({required this.startTime});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: Stream.periodic(const Duration(seconds: 1)),
      builder: (context, snapshot) {
        final elapsed = DateTime.now().difference(startTime);
        final hours = elapsed.inHours.toString().padLeft(1, '0');
        final minutes = (elapsed.inMinutes % 60).toString().padLeft(2, '0');
        final seconds = (elapsed.inSeconds % 60).toString().padLeft(2, '0');

        return Container(
          padding: const EdgeInsets.symmetric(
            horizontal: BykiSpacing.sm,
            vertical: BykiSpacing.xs,
          ),
          decoration: BoxDecoration(
            color: BykiColors.gray100,
            borderRadius: BorderRadius.circular(BykiRadius.full),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.timer_outlined, size: 14, color: BykiColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                '$hours:$minutes:$seconds',
                style: BykiTypography.monoSm.copyWith(
                  color: BykiColors.textSecondary,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
