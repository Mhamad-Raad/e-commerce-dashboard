import 'package:flutter/material.dart';

import '../../features/cart/presentation/widgets/cart_button.dart';
import '../../features/notifications/presentation/widgets/notification_bell.dart';
import '../l10n/l10n_ext.dart';

/// The shared app bar used across the app: "Rozhna's Store" wordmark centered,
/// optional back (left) and notification/cart actions (right). Uses
/// colorScheme.primary so the wordmark stays readable in dark mode. When
/// [showNotifications]/[showCart] are set, those actions carry a live badge.
class RozhnaAppBar extends StatelessWidget implements PreferredSizeWidget {
  const RozhnaAppBar({
    super.key,
    this.showBack = false,
    this.showCart = false,
    this.showNotifications = false,
  });

  final bool showBack;
  final bool showCart;
  final bool showNotifications;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: showBack,
      title: Text(
        context.l10n.brandName,
        style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Theme.of(context).colorScheme.primary,
              fontStyle: FontStyle.italic,
              fontWeight: FontWeight.w700,
            ),
      ),
      actions: [
        if (showNotifications) const NotificationBell(),
        if (showCart) const CartButton(),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
