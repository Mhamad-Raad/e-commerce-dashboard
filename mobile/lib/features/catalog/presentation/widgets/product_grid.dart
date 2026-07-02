import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/routes.dart';
import '../../../../app/theme/app_spacing.dart';
import '../../domain/catalog_product.dart';
import '../home/widgets/product_card.dart';

/// A responsive product grid that calls [onLoadMore] as it nears the bottom
/// (infinite scroll). Tapping a card opens its detail. Wrap in [Expanded].
class ProductGrid extends StatefulWidget {
  const ProductGrid({
    super.key,
    required this.products,
    this.onLoadMore,
    this.loadingMore = false,
    this.padding = const EdgeInsets.all(AppSpacing.margin),
  });

  final List<CatalogProduct> products;
  final Future<void> Function()? onLoadMore;
  final bool loadingMore;
  final EdgeInsets padding;

  @override
  State<ProductGrid> createState() => _ProductGridState();
}

class _ProductGridState extends State<ProductGrid> {
  final _controller = ScrollController();

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onScroll);
  }

  @override
  void dispose() {
    _controller.removeListener(_onScroll);
    _controller.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (widget.onLoadMore == null) return;
    final pos = _controller.position;
    if (pos.pixels >= pos.maxScrollExtent - 400) widget.onLoadMore!();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) => GridView.builder(
              controller: _controller,
              padding: widget.padding,
              gridDelegate: productGridDelegate(
                constraints.maxWidth - widget.padding.horizontal,
              ),
              itemCount: widget.products.length,
              itemBuilder: (_, i) => ProductCard(
                product: widget.products[i],
                onTap: () =>
                    context.push(Routes.productDetail(widget.products[i].id)),
              ),
            ),
          ),
        ),
        if (widget.loadingMore)
          const Padding(
            padding: EdgeInsets.all(AppSpacing.sm),
            child: CircularProgressIndicator(),
          ),
      ],
    );
  }
}
