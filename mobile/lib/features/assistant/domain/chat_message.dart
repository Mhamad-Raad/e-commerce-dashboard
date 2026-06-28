import '../../catalog/domain/catalog_product.dart';

/// Who authored a chat message.
enum ChatRole { user, assistant }

/// One message in an assistant conversation. Assistant messages may carry
/// [products] — the items the assistant surfaced this turn, rendered as cards.
class ChatMessage {
  const ChatMessage({
    required this.role,
    required this.content,
    this.products = const [],
  });

  final ChatRole role;
  final String content;
  final List<CatalogProduct> products;

  factory ChatMessage.user(String content) =>
      ChatMessage(role: ChatRole.user, content: content);

  factory ChatMessage.assistant(
    String content, {
    List<CatalogProduct> products = const [],
  }) =>
      ChatMessage(role: ChatRole.assistant, content: content, products: products);

  bool get isUser => role == ChatRole.user;
}

/// The assistant's reply to a chat turn (the `/app/assistant/chat` response):
/// the text plus any products it surfaced for display as cards.
class ChatReply {
  const ChatReply({
    required this.conversationId,
    required this.message,
    this.products = const [],
  });

  final String conversationId;
  final String message;
  final List<CatalogProduct> products;

  factory ChatReply.fromJson(Map<String, dynamic> json) => ChatReply(
        conversationId: json['conversationId'] as String,
        message: json['message'] as String,
        products: (json['products'] as List?)
                ?.whereType<Map>()
                .map((e) => CatalogProduct.fromJson(Map<String, dynamic>.from(e)))
                .toList() ??
            const [],
      );
}
