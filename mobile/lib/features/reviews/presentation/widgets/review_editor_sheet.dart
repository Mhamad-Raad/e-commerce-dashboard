import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../app/theme/app_spacing.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/l10n/l10n_ext.dart';
import '../../../../core/network/api_result.dart';
import '../../../auth/presentation/widgets/auth_widgets.dart';
import '../../data/reviews_repository.dart';
import '../../domain/product_review.dart';
import '../providers/reviews_providers.dart';
import 'rating_stars.dart';

/// Write/edit-review bottom sheet. Pre-fills [existing] and offers delete.
Future<void> showReviewEditorSheet(
  BuildContext context, {
  required String productId,
  MyReview? existing,
}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => _ReviewEditorSheet(productId: productId, existing: existing),
  );
}

class _ReviewEditorSheet extends ConsumerStatefulWidget {
  const _ReviewEditorSheet({required this.productId, this.existing});

  final String productId;
  final MyReview? existing;

  @override
  ConsumerState<_ReviewEditorSheet> createState() => _ReviewEditorSheetState();
}

class _ReviewEditorSheetState extends ConsumerState<_ReviewEditorSheet> {
  late int _rating = widget.existing?.rating ?? 0;
  late final _title = TextEditingController(text: widget.existing?.title ?? '');
  late final _comment =
      TextEditingController(text: widget.existing?.comment ?? '');
  bool _busy = false;

  @override
  void dispose() {
    _title.dispose();
    _comment.dispose();
    super.dispose();
  }

  // PUT semantics: an omitted field clears it, so send the form's current
  // values — null (omit) only when the user left/made the field empty.
  String? get _titleValue =>
      _title.text.trim().isEmpty ? null : _title.text.trim();
  String? get _commentValue =>
      _comment.text.trim().isEmpty ? null : _comment.text.trim();

  Future<void> _submit() async {
    final l10n = context.l10n;
    if (_rating < 1) {
      showMessage(context, l10n.reviewRatingRequired);
      return;
    }
    setState(() => _busy = true);
    final result = await ref.read(reviewsRepositoryProvider).upsertMine(
          widget.productId,
          rating: _rating,
          title: _titleValue,
          comment: _commentValue,
        );
    if (!mounted) return;
    setState(() => _busy = false);
    switch (result) {
      case Success():
        invalidateProductReviews(ref, widget.productId);
        Navigator.pop(context);
        showMessage(context, l10n.reviewSubmitted);
      case Failed(failure: ReviewNotAllowedFailure()):
        showMessage(context, l10n.reviewNotEligible);
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  Future<void> _delete() async {
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.reviewDeleteConfirm),
        content: Text(l10n.reviewDeleteConfirmBody),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(l10n.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(l10n.delete),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    setState(() => _busy = true);
    final result =
        await ref.read(reviewsRepositoryProvider).deleteMine(widget.productId);
    if (!mounted) return;
    setState(() => _busy = false);
    switch (result) {
      case Success():
        invalidateProductReviews(ref, widget.productId);
        Navigator.pop(context);
        showMessage(context, l10n.reviewDeleted);
      case Failed(failure: final f):
        showFailure(context, f);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final text = Theme.of(context).textTheme;
    final editing = widget.existing != null;

    return Padding(
      // Keep the fields above the keyboard.
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.margin,
            0,
            AppSpacing.margin,
            AppSpacing.md,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(editing ? l10n.editReview : l10n.writeReview,
                  style: text.titleLarge),
              const SizedBox(height: AppSpacing.md),
              Text(l10n.reviewRatingLabel, style: text.titleSmall),
              const SizedBox(height: AppSpacing.xs),
              Center(
                child: RatingStarsInput(
                  value: _rating,
                  onChanged: (v) => setState(() => _rating = v),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: _title,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(labelText: l10n.reviewTitleLabel),
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: _comment,
                minLines: 3,
                maxLines: 6,
                decoration: InputDecoration(labelText: l10n.reviewCommentLabel),
              ),
              const SizedBox(height: AppSpacing.lg),
              PrimaryButton(
                label: l10n.reviewSubmit,
                loading: _busy,
                onPressed: _submit,
              ),
              if (editing) ...[
                const SizedBox(height: AppSpacing.xs),
                Center(
                  child: TextButton.icon(
                    onPressed: _busy ? null : _delete,
                    icon: const Icon(Icons.delete_outline),
                    label: Text(l10n.reviewDelete),
                    style: TextButton.styleFrom(
                      foregroundColor: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
