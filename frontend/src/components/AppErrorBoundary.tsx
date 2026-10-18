import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error.message, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-5">
          <h1 className="font-heading text-3xl font-semibold">This page could not be shown</h1>
          <p className="mt-3 text-lg leading-relaxed">
            Reload QuantumShield India to try again.
          </p>
        </main>
      );
    }

    return this.props.children;
  }
}
