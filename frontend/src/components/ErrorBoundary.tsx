import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('ErrorBoundary caught', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen items-center justify-center bg-background px-4">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">{this.state.error.message}</p>
            <button
              onClick={this.reset}
              className="mt-4 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
