import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log error if needed
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ textAlign: 'center', marginTop: '10vh' }}><h1>Something went wrong.</h1></div>;
    }
    return this.props.children;
  }
}
