import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[Chillz] Page crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
          <div className="text-5xl">⚠️</div>
          <p className="text-white font-black text-lg">Something went wrong</p>
          <p className="text-muted text-sm max-w-xs">{this.state.error.message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload() }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
