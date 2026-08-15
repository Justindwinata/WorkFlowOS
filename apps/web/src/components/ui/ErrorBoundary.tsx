'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center border rounded-xl bg-surface border-outline-variant">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-on-surface mb-2">Terjadi Kesalahan</h3>
          <p className="text-sm text-on-surface-variant mb-4 max-w-sm">
            {this.state.error?.message || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-button-label text-button-label hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
