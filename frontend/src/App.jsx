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
          <h1 className="hero__title">Audit any URL in seconds</h1>
          <p className="hero__subtitle">
            Get instant insights into SEO, performance, and accessibility. Enter a URL below to start analyzing.
          </p>
        </div>

        <div className="interactive-panel">
          {phase === 'input' && (
            <div className="state-fade">
              <UrlInput value={url} onChange={setUrl} onSubmit={handleSubmit} disabled={false} />
              <ErrorMessage message={error} />
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
