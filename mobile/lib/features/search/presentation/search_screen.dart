import 'package:flutter/material.dart';

import '../../../core/widgets/coming_soon_view.dart';
import '../../../core/widgets/rozhna_app_bar.dart';

/// Search tab — query + filters/sort over products. Stub for now.
class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: RozhnaAppBar(),
      body: ComingSoonView(icon: Icons.search_outlined),
    );
  }
}
