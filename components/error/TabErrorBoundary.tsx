"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";

type TabErrorBoundaryProps = {
  children: ReactNode;
  resetKey?: string;
  onReset?: () => void;
};

type TabErrorBoundaryState = {
  hasError: boolean;
};

export class TabErrorBoundary extends Component<
  TabErrorBoundaryProps,
  TabErrorBoundaryState
> {
  state: TabErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): TabErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidUpdate(previousProps: TabErrorBoundaryProps) {
    if (
      this.state.hasError &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Tab crashed:", error, info);
  }

  reset = () => {
    this.setState({
      hasError: false,
    });

    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <GlassPanel className="p-8 text-center">
          <p className="text-xl font-semibold text-foreground">
            Something went wrong in this tab.
          </p>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-(--text-muted)">
            Try resetting this tab or refreshing the page.
          </p>

          <button
            type="button"
            onClick={this.reset}
            className="focus-ring mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-(--accent-primary) px-5 py-3 font-medium text-white shadow-[0_0_24px_rgba(124,107,255,0.35)] transition hover:bg-(--accent-glow)"
          >
            Try Again
          </button>
        </GlassPanel>
      );
    }

    return this.props.children;
  }
}
