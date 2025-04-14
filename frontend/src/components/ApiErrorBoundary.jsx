import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ApiErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizează starea pentru a afișa UI alternativ
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Poți înregistra eroarea într-un serviciu de raportare a erorilor
    console.error('API Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Poți personaliza afișarea erorilor
      return (
        <div className="api-error-container">
          <h2>Eroare la încărcarea datelor</h2>
          <p>Ne pare rău, a apărut o problemă la încărcarea datelor din API.</p>
          <div className="error-details">
            <p>{this.state.error && this.state.error.toString()}</p>
            {this.props.showDetails && this.state.errorInfo && (
              <details style={{ whiteSpace: 'pre-wrap' }}>
                <summary>Detalii eroare</summary>
                {this.state.errorInfo.componentStack}
              </details>
            )}
          </div>
          <button 
            className="retry-button"
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              if (this.props.onRetry) {
                this.props.onRetry();
              } else {
                // Reîncarcă pagina ca ultimă soluție
                window.location.reload();
              }
            }}
          >
            Încearcă din nou
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ApiErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  showDetails: PropTypes.bool,
  onRetry: PropTypes.func
};

ApiErrorBoundary.defaultProps = {
  showDetails: false
};

export default ApiErrorBoundary;