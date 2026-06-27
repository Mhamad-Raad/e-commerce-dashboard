/// Who authored a chat message.
enum ChatRole { user, assistant }

/// One message in an assistant conversation.
class ChatMessage {
  const ChatMessage({required this.role, required this.content});

  final ChatRole role;
  final String content;

  factory ChatMessage.user(String content) =>
      ChatMessage(role: ChatRole.user, content: content);

  factory ChatMessage.assistant(String content) =>
      ChatMessage(role: ChatRole.assistant, content: content);

  bool get isUser => role == ChatRole.user;
}

/// The assistant's reply to a chat turn (the `/app/assistant/chat` response).
class ChatReply {
  const ChatReply({required this.conversationId, required this.message});

  final String conversationId;
  final String message;

  factory ChatReply.fromJson(Map<String, dynamic> json) => ChatReply(
        conversationId: json['conversationId'] as String,
        message: json['message'] as String,
      );
}
