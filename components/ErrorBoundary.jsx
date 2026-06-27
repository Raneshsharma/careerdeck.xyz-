"use client";

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Something went wrong</h1>
            <p className="text-sm text-[#64748B] mb-4">Please try refreshing the page.</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm">
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
