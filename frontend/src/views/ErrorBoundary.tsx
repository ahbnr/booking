import React, { ErrorInfo } from 'react';

/**
 * Dont be confused that react-overlay-error still displays even when an error has been caught by this boundary.
 * The overlay can be closed and is only displayed in development mode.
 */
export default class ErrorBoundary extends React.Component<Properties, State> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `Error boundary caught error: ${error}. Info: ${errorInfo.componentStack}`
    );
  }

  render() {
    return this.state.error != null
      ? this.props.fallback(this.state.error)
      : this.props.children;
  }
}

interface Properties {
  fallback: (e: Error) => React.ReactNode;
}

interface State {
  error?: Error;
}
