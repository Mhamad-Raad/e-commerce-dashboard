import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/l10n/l10n_ext.dart';
import '../../features/notifications/data/push_service.dart';

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
    // a good moment to (re)register the FCM device token. Inert if push is off.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(pushServiceProvider).onAuthenticated();
    });
  }

  @override
  Widget build(BuildContext context) {
    final navigationShell = widget.navigationShell;
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;

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
