import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Actualizar el estado para mostrar la UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // También podemos registrar el error en un servicio de reporte de errores
    console.error('Error capturado por el boundary:', error);
    console.error('Información del componente:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  // Método para reiniciar el estado del error boundary
  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Si se proporcionó un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // UI alternativa por defecto
      return (
        <div className="p-4 bg-red-50 border border-red-300 rounded-md">
          <h3 className="text-lg font-semibold text-red-700">Algo salió mal</h3>
          <p className="text-red-600 mt-2">
            {this.state.error?.message || 'Ocurrió un error inesperado.'}
          </p>
          {this.state.errorInfo && (
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">Ver detalles del error</summary>
              <pre className="mt-2 overflow-auto p-3 bg-gray-100 text-xs rounded">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={this.reset}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;