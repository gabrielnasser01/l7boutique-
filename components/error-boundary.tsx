'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ivory px-6">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-serif text-charcoal mb-4">Algo deu errado</h1>
            <p className="text-sm font-sans text-charcoal/60 mb-8">
              Ocorreu um erro inesperado. Por favor, recarregue a pagina.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-[11px] tracking-boutique font-sans text-ivory bg-charcoal px-10 py-4 uppercase hover:bg-charcoal/90 transition-colors"
            >
              RECARREGAR PAGINA
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
