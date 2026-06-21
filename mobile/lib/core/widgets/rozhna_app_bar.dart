import 'package:flutter/material.dart';

import '../l10n/l10n_ext.dart';

/// The shared app bar used across the app: "Rozhna's Store" wordmark centered,
/// optional back (left) and cart (right). Uses colorScheme.primary so the
/// wordmark stays readable in dark mode.
class RozhnaAppBar extends StatelessWidget implements PreferredSizeWidget {
  const RozhnaAppBar({
    super.key,
    this.showBack = false,
    this.showCart = false,
    this.onCartTap,
  });

  final bool showBack;
  final bool showCart;
  final VoidCallback? onCartTap;

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
        if (showCart)
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined),
            onPressed: onCartTap,
          ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
