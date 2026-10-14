"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Render-prop fallback receives the error and a reset callback. */
  fallback: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};
type State = { error: Error | null };

/**
 * Class error boundary (hooks cannot catch render errors). Wraps client islands such as
 * the lazy nesting preview so a canvas failure never takes down the whole quote page.
 * (Route-level errors are handled by Next's error.tsx, which is itself a boundary.)
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.reset) : this.props.children;
  }
}
