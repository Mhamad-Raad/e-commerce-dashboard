/// What the payment-options step hands to the review step. The review screen
/// still lets the user change the address / payment method before placing.
class CheckoutDraft {
  const CheckoutDraft({
    required this.addressId,
    required this.paymentMethod,
    this.notes = '',
  });

  final String addressId;
  final String paymentMethod;
  final String notes;
}
