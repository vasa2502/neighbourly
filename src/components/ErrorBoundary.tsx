import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[JOINN ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(40,33%,98%)] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-xl font-semibold text-[hsl(155,25%,12%)] mb-2">
              {this.props.fallbackTitle || "Something went wrong"}
            </h1>
            <p className="text-sm text-[hsl(155,8%,42%)] mb-6">
              {this.props.fallbackMessage || "An unexpected error occurred. Please try refreshing the page."}
            </p>
            {this.state.error && (
              <p className="text-xs text-red-400 mb-4 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                variant="outline"
                className="border-[hsl(155,45%,32%)]/20"
              >
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[hsl(155,45%,32%)] text-white hover:bg-[hsl(155,45%,28%)]"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
