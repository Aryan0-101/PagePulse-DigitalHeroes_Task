import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import UrlInput from './components/UrlInput';
import Loading from './components/Loading';
import ErrorMessage from './components/ErrorMessage';
import AuditReport from './components/AuditReport';
import { auditUrl } from './services/auditApi';
import './App.css';

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function App() {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState('input');
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [targetUrl, setTargetUrl] = useState('');

  const handleSubmit = async () => {
    if (!url.trim() || phase === 'loading') return;

    const fullUrl = normalizeUrl(url);
    setError(null);
    setPhase('loading');

    try {
      const result = await auditUrl(fullUrl);
      setReport(result);
      setTargetUrl(fullUrl);
      setPhase('report');
    } catch (err) {
      setError(err.message);
      setPhase('input');
    }
  };

  const handleReset = () => {
    setUrl('');
    setReport(null);
    setError(null);
    setPhase('input');
  };

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <div className="hero">
          <h1 className="hero__title">A precise read on any page.</h1>
          <div className="hero__orb"></div>
        </div>

        <div className="interactive-panel">
          {phase === 'input' && (
            <div className="state-fade">
              <UrlInput value={url} onChange={setUrl} onSubmit={handleSubmit} disabled={false} />
              <ErrorMessage message={error} />
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </div>
                  <div className="feature-card__content">
                    <h3>Response Metrics</h3>
                    <p>Check HTTP status & response time</p>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                  </div>
                  <div className="feature-card__content">
                    <h3>Page Structure</h3>
                    <p>Analyze title, descriptions & headings</p>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-card__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                  </div>
                  <div className="feature-card__content">
                    <h3>Accessibility</h3>
                    <p>Inspect image alt text & word count</p>
                  </div>
                </div>
              </div>
              
              <div className="score-guidelines-card">
                <div className="score-guidelines-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <div className="score-guidelines-card__content">
                  <h3>Scoring Parameters</h3>
                  <p>The auditor computes a comprehensive score out of <strong>100</strong> based directly on the response metrics, page structure, and accessibility parameters listed above.</p>
                </div>
              </div>
            </div>
          )}

          {phase === 'loading' && (
            <div className="state-fade">
              <Loading />
            </div>
          )}

          {phase === 'report' && (
            <div className="state-slide-up">
              <AuditReport report={report} targetUrl={targetUrl} onReset={handleReset} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
