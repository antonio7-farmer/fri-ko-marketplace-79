import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle size={24} />
              <h1 className="text-xl font-semibold">Nešto je pošlo po krivu</h1>
            </div>
            <p className="text-gray-700 mb-4">
              Došlo je do neočekivane greške. Molimo osvježite stranicu ili se vratite na početnu stranicu.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-gray-100 p-3 rounded text-sm text-gray-800 mb-4 overflow-auto">
                <p className="font-mono">{this.state.error.message}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-[#22C55E] text-white py-2 px-4 rounded-lg hover:bg-[#16A34A] transition-colors"
              >
                Idi na početnu
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Osvježi stranicu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
