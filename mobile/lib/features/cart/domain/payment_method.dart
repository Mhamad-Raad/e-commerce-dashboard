import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';

/// A selectable payment method. `code` is the backend `PaymentMethod` enum value
/// sent at checkout; the label is localized. No gateway in v1 — every method is
/// recorded as PENDING and settled manually (COD on delivery).
class PaymentOption {
  const PaymentOption(this.code, this.icon);
  final String code;
  final IconData icon;

  String label(AppLocalizations l10n) => switch (code) {
        'COD' => l10n.payCod,
        'ZAIN_CASH' => l10n.payZainCash,
        'FIB' => l10n.payFib,
        'TRANSFER' => l10n.payTransfer,
        'CARD' => l10n.payCard,
        'WALLET' => l10n.payWallet,
        _ => code,
      };
}

/// Offered methods, in display order.
const paymentOptions = <PaymentOption>[
  PaymentOption('COD', Icons.payments_outlined),
  PaymentOption('ZAIN_CASH', Icons.account_balance_wallet_outlined),
  PaymentOption('FIB', Icons.account_balance_outlined),
  PaymentOption('TRANSFER', Icons.swap_horiz_outlined),
  PaymentOption('CARD', Icons.credit_card_outlined),
  PaymentOption('WALLET', Icons.wallet_outlined),
];
