import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/l10n/l10n_ext.dart';

/// The authenticated app shell: a body that swaps between the four main tabs
/// (Home / Shop / Search / Profile) with a Material 3 bottom navigation bar.
/// Each tab keeps its own navigation state (StatefulShellRoute).
class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
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
            icon: const Icon(Icons.storefront_outlined),
            selectedIcon: const Icon(Icons.storefront),
            label: l10n.tabShop,
          ),
          NavigationDestination(
            icon: const Icon(Icons.search_outlined),
            selectedIcon: const Icon(Icons.search),
            label: l10n.tabSearch,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            selectedIcon: const Icon(Icons.person),
            label: l10n.tabProfile,
          ),
        ],
      ),
    );
  }
}
