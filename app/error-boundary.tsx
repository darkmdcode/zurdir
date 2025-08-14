"use client";
import * as Sentry from '@sentry/nextjs';
import React from 'react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
}, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center mt-[10vh] space-y-4">
          <h1 className="text-3xl font-bold text-[#003B6F]">Something went wrong</h1>
          <p className="text-muted-foreground">Our TARDIS engineers have been alerted</p>
          <Button onClick={this.handleReset} className="bg-tardis-blue hover:bg-tardis-blue/80">Try Again</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
