import React, { ErrorInfo } from 'react';
import { boundClass } from 'autobind-decorator';

/**
 * Dont be confused that react-overlay-error still displays even when an error has been caught by this boundary.
 * The overlay can be closed and is only displayed in development mode.
 */
@boundClass
export default class ErrorBoundary extends React.PureComponent<
  Properties,
  State
> {
  constructor(props: Properties) {
    super(props);

    this.state = {
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    this.setState({
      error: event.reason,
    });
  };

  private clearError() {
    this.setState({
      error: undefined,
    });
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `Error boundary caught error: ${error}. Info: ${errorInfo.componentStack}`
    );
  }

  componentDidMount() {
    // catch unhandled promise rejections
    window.addEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  componentWillUnmount() {
    window.removeEventListener(
      'unhandledrejection',
      this.promiseRejectionHandler
    );
  }

  render() {
    return this.state.error != null
      ? this.props.fallback(this.state.error, this.clearError)
      : this.props.children;
  }
}

interface Properties {
  fallback: (e: Error, clearError: () => unknown) => React.ReactNode;
}

interface State {
  error?: Error;
}
