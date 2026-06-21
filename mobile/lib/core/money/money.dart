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
    return '${f.format(amount)} $currency';
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
