import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <div className="rounded-3xl bg-red-900/20 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400">Oops!</h1>
            <p className="mt-2 text-slate-300">Algo deu errado.</p>
            {this.state.error && (
              <p className="mt-2 text-sm text-slate-400">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="rounded-2xl bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl border border-slate-600 px-6 py-2 font-semibold text-white hover:bg-slate-800"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
