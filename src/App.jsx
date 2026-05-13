import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Component } from 'react'
import Landing from './pages/Landing.jsx'
import Audit from './pages/Audit.jsx'
import Results from './pages/Results.jsx'
import Share from './pages/Share.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="font-mono text-xs text-muted uppercase tracking-wider">Something went wrong</div>
          <p className="text-dim text-sm max-w-md">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/audit' }}
            className="btn-primary mt-4"
          >
            Go back to audit
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/results" element={<Results />} />
            <Route path="/share/:id" element={<Share />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
