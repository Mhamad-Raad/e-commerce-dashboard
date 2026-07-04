import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:pinput/pinput.dart';

import '../../../../app/theme/app_radii.dart';
import '../../../../app/theme/app_sizes.dart';

/// Akkooo-style 6-box code entry: auto-focus, numeric keyboard, paste and SMS
/// autofill support, auto-submit on the last digit. Boxes stay LTR in RTL
/// locales. Pass [forceError] to paint the error border after a failed verify.
class OtpCodeInput extends StatelessWidget {
  const OtpCodeInput({
    super.key,
    required this.controller,
    required this.onCompleted,
    this.forceError = false,
    this.onChanged,
    this.length = 6,
    this.autofocus = true,
    this.closeKeyboardWhenCompleted = true,
  });

  final TextEditingController controller;
  final ValueChanged<String> onCompleted;
  final ValueChanged<String>? onChanged;
  final bool forceError;
  final int length;
  final bool autofocus;
  final bool closeKeyboardWhenCompleted;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    final basePinTheme = PinTheme(
      width: AppSizes.controlHeight,
      height: AppSizes.controlHeight,
      textStyle: text.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
      decoration: BoxDecoration(
        color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
        borderRadius: AppRadii.fieldRadius,
      ),
    );

    return Directionality(
      textDirection: TextDirection.ltr,
      child: Pinput(
        controller: controller,
        length: length,
        autofocus: autofocus,
        keyboardType: TextInputType.number,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        autofillHints: const [AutofillHints.oneTimeCode],
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        closeKeyboardWhenCompleted: closeKeyboardWhenCompleted,
        forceErrorState: forceError,
        defaultPinTheme: basePinTheme,
        focusedPinTheme: basePinTheme.copyWith(
          decoration: basePinTheme.decoration!.copyWith(
            border: Border.all(color: scheme.primary, width: 2),
          ),
        ),
        errorPinTheme: basePinTheme.copyWith(
          decoration: basePinTheme.decoration!.copyWith(
            color: scheme.errorContainer.withValues(alpha: 0.3),
            border: Border.all(color: scheme.error, width: 1.5),
          ),
        ),
        onCompleted: onCompleted,
        onChanged: onChanged,
      ),
    );
  }
}
