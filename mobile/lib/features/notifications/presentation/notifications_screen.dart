import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../app/theme/app_radii.dart';
import '../../../app/theme/app_spacing.dart';
import '../../../core/l10n/intl_locale.dart';
import '../../../core/l10n/l10n_ext.dart';
import '../../../core/widgets/status_views.dart';
import '../domain/app_notification.dart';
import 'notification_presentation.dart';
import 'notification_target_nav.dart';
import 'providers/notifications_controller.dart';

/// The in-app notification centre. Lists the customer's notifications newest
/// first; tapping one marks it read and deep-links to its target (order detail).
class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final async = ref.watch(notificationsControllerProvider);
    final hasUnread = async.maybeWhen(
      data: (items) => items.any((n) => !n.isRead),
      orElse: () => false,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.notifications),
        actions: [
          if (hasUnread)
            TextButton(
              onPressed: () => ref
                  .read(notificationsControllerProvider.notifier)
                  .markAllRead(),
              child: Text(l10n.notifMarkAllRead),
            ),
        ],
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => ErrorRetry(
          message: l10n.notificationsLoadError,
          onRetry: () =>
              ref.read(notificationsControllerProvider.notifier).refresh(),
        ),
        data: (items) => items.isEmpty
            ? const _Empty()
            : RefreshIndicator(
                onRefresh: () => ref
                    .read(notificationsControllerProvider.notifier)
                    .refresh(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.margin),
                  itemCount: items.length,
                  separatorBuilder: (_, _) =>
                      const SizedBox(height: AppSpacing.sm),
                  itemBuilder: (_, i) =>
                      _NotificationRow(notification: items[i]),
                ),
              ),
      ),
    );
  }
}

class _NotificationRow extends ConsumerWidget {
  const _NotificationRow({required this.notification});

  final AppNotification notification;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final scheme = Theme.of(context).colorScheme;
    final locale = Localizations.localeOf(context).languageCode;
    final unread = !notification.isRead;
    final imageUrl = notification.announcement?.imageUrl;

    return InkWell(
      borderRadius: AppRadii.cardRadius,
      onTap: () {
        ref
            .read(notificationsControllerProvider.notifier)
            .markRead(notification.id);
        final ann = notification.announcement;
        if (ann != null) {
          openNotificationTarget(
            context,
            ann.targetType,
            ann.targetId,
            ann.url,
          );
        } else {
          final route = notificationRoute(notification);
          if (route != null) context.push(route);
        }
      },
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          // Unread rows get a subtle primary tint so they stand out.
          color: unread ? scheme.primary.withValues(alpha: 0.06) : null,
          borderRadius: AppRadii.cardRadius,
          border: Border.all(
            color: unread
                ? scheme.primary.withValues(alpha: 0.35)
                : scheme.outlineVariant,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (imageUrl != null && imageUrl.isNotEmpty) ...[
              ClipRRect(
                borderRadius: AppRadii.cardRadius,
                child: AspectRatio(
                  aspectRatio: 3,
                  child: CachedNetworkImage(
                    imageUrl: imageUrl,
                    fit: BoxFit.cover,
                    errorWidget: (_, _, _) =>
                        ColoredBox(color: scheme.surfaceContainerHighest),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
            ],
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(notificationIcon(notification), color: scheme.primary),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        notificationTitle(l10n, notification),
                        style: text.titleSmall?.copyWith(
                          fontWeight: unread
                              ? FontWeight.w700
                              : FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        notificationBody(l10n, notification),
                        style: text.bodyMedium,
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        DateFormat.yMMMd(
                          intlLocale(locale),
                        ).add_jm().format(notification.createdAt.toLocal()),
                        style: text.bodySmall?.copyWith(
                          color: scheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                if (unread)
                  Container(
                    margin: const EdgeInsets.only(top: 6),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: scheme.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.notifications_none_outlined,
              size: 48,
              color: scheme.onSurfaceVariant,
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              l10n.noNotificationsYet,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(l10n.notificationsHint, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
