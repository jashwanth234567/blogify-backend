import { Component } from "react";

/**
 * ErrorBoundary — catches runtime errors in any child component tree.
 * Usage: <ErrorBoundary fallback={<CustomFallback />}><MyComponent /></ErrorBoundary>
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ info: errorInfo });
        // Could send to logging service here
        console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, info: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[260px] p-8 text-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 m-4">
                    <span className="text-4xl mb-3">⚠️</span>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                        Something went wrong
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
                        {this.state.error?.message || "An unexpected error occurred. Please try again."}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
