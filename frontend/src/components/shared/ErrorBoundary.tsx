import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-background-primary/50 text-center">
          <AlertCircle className="w-12 h-12 text-accent-danger mb-4" />
          <h2 className="text-xl font-display font-semibold text-text-primary mb-2">UI Component Error</h2>
          <p className="text-sm font-body text-text-secondary max-w-md">
            {this.state.error?.message || "An unexpected error occurred in this view."}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-6 px-4 py-2 bg-background-surface hover:bg-background-elevated border border-border-subtle rounded-lg text-sm transition-colors font-medium"
          >
            Try Recovering
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
