import 'package:flutter/material.dart';

import '../../../../core/widgets/coming_soon_view.dart';
import '../../../../core/widgets/rozhna_app_bar.dart';

/// Shop tab — catalog browse (categories + product list). Stub for now.
class ShopScreen extends StatelessWidget {
  const ShopScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: RozhnaAppBar(showCart: true),
      body: ComingSoonView(icon: Icons.storefront_outlined),
    );
  }
}
