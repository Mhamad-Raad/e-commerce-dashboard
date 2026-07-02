import 'package:intl/intl.dart';

/// IQD money. The backend stores **whole dinars** (0 decimals), so [amount]
/// is a whole-dinar integer. All currency formatting lives here — widgets
/// never touch raw ints.
class Money {
  const Money(this.amount, {this.currency = 'IQD'});

  final int amount; // whole dinars
  final String currency;

  String format({String? locale}) {
    // intl has no `ckb` number data — use Arabic digits (same script) for it.
    final loc = locale == 'ckb' ? 'ar' : (locale ?? 'en');
    final f = NumberFormat.decimalPattern(loc);
    // Arabic-script locales show the dinar as "د.ع" (Iraqi convention), not the
    // Latin ISO code.
    final label = currency == 'IQD' && (locale == 'ar' || locale == 'ckb')
        ? 'د.ع'
        : currency;
    return '${f.format(amount)} $label';
  }

  Money operator +(Money other) {
    assert(other.currency == currency);
    return Money(amount + other.amount, currency: currency);
  }

  Money operator *(int qty) => Money(amount * qty, currency: currency);

  @override
  bool operator ==(Object other) =>
      other is Money && other.amount == amount && other.currency == currency;

  @override
  int get hashCode => Object.hash(amount, currency);

  @override
  String toString() => format();
}
