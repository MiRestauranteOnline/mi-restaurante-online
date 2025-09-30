import React from "react";

interface DebugErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface DebugErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class DebugErrorBoundary extends React.Component<DebugErrorBoundaryProps, DebugErrorBoundaryState> {
  constructor(props: DebugErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): DebugErrorBoundaryState {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error: any, info: any) {
    // Log to console for debugging
    console.error("ErrorBoundary caught: ", error, info);
  }

  handleReset = () => {
    // Simple reset: reload the page section
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <div className="font-medium text-destructive">Hubo un problema al cargar el formulario de pago.</div>
          <div className="mt-1 text-muted-foreground">{this.state.message || "Intenta nuevamente."}</div>
          <button onClick={this.handleReset} className="mt-3 inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent">
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
