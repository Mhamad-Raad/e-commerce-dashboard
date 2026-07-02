import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/l10n/l10n_ext.dart';
import '../../core/version_gate/version_gate_controller.dart';
import '../../features/notifications/data/push_service.dart';
import '../theme/app_spacing.dart';

/// The authenticated app shell: a body that swaps between the four main tabs
/// (Home / Products / Assistant / Profile) with a frosted-glass bottom nav bar.
/// Each tab keeps its own navigation state (StatefulShellRoute).
class MainShell extends ConsumerStatefulWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  @override
  void initState() {
    super.initState();
    // The shell only mounts when authenticated, so this runs on every login —
    // a good moment to (re)register the FCM device token (inert if push is off)
    // and to (re)schedule the daily local skincare-routine reminder. The latter
    // is independent of Firebase and re-scheduled here so a language change is
    // picked up. Strings are read inside the post-frame callback where context
    // is safely available.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final push = ref.read(pushServiceProvider);
      push.onAuthenticated();
      final l10n = context.l10n;
      push.scheduleDailyRoutineReminder(
        title: l10n.routineReminderTitle,
        body: l10n.routineReminderBody,
      );
      // The launch check may already have resolved before the shell mounted —
      // the ref.listen in build only catches later changes.
      _maybeShowUpdateNudge();
    });
  }

  /// Dismissible "update available" sheet, shown once per latestAppVersion
  /// (dismissNudge persists it). Hard blocks never reach here — the router
  /// redirects to UpdateRequiredScreen before the shell builds.
  void _maybeShowUpdateNudge() {
    final gate = ref.read(versionGateControllerProvider);
    if (gate.nudgeVersion == null) return;
    ref.read(versionGateControllerProvider.notifier).dismissNudge();

    final l10n = context.l10n;
    final storeUrl = gate.storeUrl;
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
              AppSpacing.margin, 0, AppSpacing.margin, AppSpacing.md),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.system_update_alt,
                  size: 40, color: Theme.of(sheetContext).colorScheme.primary),
              const SizedBox(height: AppSpacing.md),
              Text(l10n.updateAvailableTitle,
                  style: Theme.of(sheetContext).textTheme.titleMedium),
              const SizedBox(height: AppSpacing.xs),
              Text(l10n.updateAvailableBody,
                  style: Theme.of(sheetContext).textTheme.bodyMedium,
                  textAlign: TextAlign.center),
              const SizedBox(height: AppSpacing.lg),
              if (storeUrl != null)
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () {
                      Navigator.pop(sheetContext);
                      launchUrl(Uri.parse(storeUrl),
                          mode: LaunchMode.externalApplication);
                    },
                    child: Text(l10n.updateNow),
                  ),
                ),
              TextButton(
                onPressed: () => Navigator.pop(sheetContext),
                child: Text(l10n.notNow),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final navigationShell = widget.navigationShell;
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;

    // A slow gate check can resolve after the shell mounted.
    ref.listen(versionGateControllerProvider, (prev, next) {
      if (next.nudgeVersion != null && prev?.nudgeVersion == null) {
        _maybeShowUpdateNudge();
      }
    });

    return Scaffold(
      // Let content scroll behind the translucent bar for the frosted effect.
      extendBody: true,
      body: navigationShell,
      bottomNavigationBar: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
          child: NavigationBar(
            backgroundColor: scheme.surface.withValues(alpha: 0.72),
            elevation: 0,
            surfaceTintColor: Colors.transparent,
            selectedIndex: navigationShell.currentIndex,
            onDestinationSelected: (index) => navigationShell.goBranch(
              index,
              // Tapping the active tab again returns it to its initial route.
              initialLocation: index == navigationShell.currentIndex,
            ),
            destinations: [
              NavigationDestination(
                icon: const Icon(Icons.home_outlined),
                selectedIcon: const Icon(Icons.home),
                label: l10n.tabHome,
              ),
              NavigationDestination(
                icon: const Icon(Icons.grid_view_outlined),
                selectedIcon: const Icon(Icons.grid_view),
                label: l10n.tabProducts,
              ),
              NavigationDestination(
                icon: const Icon(Icons.auto_awesome_outlined),
                selectedIcon: const Icon(Icons.auto_awesome),
                label: l10n.tabAssistant,
              ),
              NavigationDestination(
                icon: const Icon(Icons.person_outline),
                selectedIcon: const Icon(Icons.person),
                label: l10n.tabProfile,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
