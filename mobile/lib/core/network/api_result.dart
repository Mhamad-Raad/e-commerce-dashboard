import '../error/failure.dart';

/// Repositories return [Result] — never throw above the data layer.
/// Dart-native sealed class (no freezed codegen).
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  const Success(this.value);
  final T value;
}

class Failed<T> extends Result<T> {
  const Failed(this.failure);
  final Failure failure;
}

extension ResultX<T> on Result<T> {
  R fold<R>({
    required R Function(T value) success,
    required R Function(Failure failure) failure,
  }) {
    final self = this;
    return switch (self) {
      Success<T>() => success(self.value),
      Failed<T>() => failure(self.failure),
    };
  }

  /// Convenience for Notifiers that convert to AsyncValue via AsyncValue.guard.
  T unwrapOrThrow() {
    final self = this;
    return switch (self) {
      Success<T>() => self.value,
      Failed<T>() => throw self.failure,
    };
  }
}
