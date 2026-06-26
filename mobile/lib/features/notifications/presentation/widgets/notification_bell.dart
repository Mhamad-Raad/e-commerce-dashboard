import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../providers/notifications_controller.dart';

/// App-bar bell with a live unread-count badge. Opens the notification centre.
class NotificationBell extends ConsumerWidget {
  const NotificationBell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // A failed/loading count simply shows no badge (0).
    final count = ref
        .watch(unreadCountProvider)
        .maybeWhen(data: (c) => c, orElse: () => 0);
    return IconButton(
      onPressed: () => context.push(Routes.notifications),
      icon: Badge(
        isLabelVisible: count > 0,
        label: Text('$count'),
        child: const Icon(Icons.notifications_outlined),
      ),
    );
  }
}
