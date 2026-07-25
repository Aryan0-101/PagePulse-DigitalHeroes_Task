import { useCountUp } from '../hooks/useCountUp';
import { computeScore } from '../utils/score';

export default function AuditReport({ report, targetUrl, onReset }) {
  const score = report ? computeScore(report) : 0;
  const animatedScore = useCountUp(score);
  const animatedWords = useCountUp(report ? report.approximate_word_count : 0);
  const animatedResponseTime = useCountUp(report ? report.response_time_ms : 0);
  
  if (!report) return null;

  const isOk = report.status >= 200 && report.status < 300;
  const hasMissingAlt = report.images_missing_alt > 0;
  
  // Cap max response time representation at 2000ms for the bar
  const responseFill = Math.min((report.response_time_ms / 2000) * 100, 100);

  return (
    <>
      <div className="unified-report-card">
      <div className="report-header">
        <div className="target-url-group">
          <span className="cell-label">Target URL</span>
          <h2 className="target-url" title={targetUrl}>{targetUrl}</h2>
        </div>
        <div className="header-actions">
          <div className="score-pill">
             <span className="score-pill-label">Score</span>
             <span className="score-pill-val">{animatedScore}</span>
          </div>
          <button type="button" className="btn btn--text reset-btn-bracket" onClick={onReset}>
            New Audit
          </button>
        </div>
      </div>

      <div className="report-body">
        <div className="report-row">
          <div className="report-cell">
            <span className="cell-label">HTTP Status</span>
            <div className={`status-pill ${isOk ? 'status-pill--ok' : 'status-pill--error'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isOk ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></> : <><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></>}
              </svg>
              {report.status} {isOk ? 'OK' : 'ERROR'}
            </div>
          </div>
          <div className="report-cell">
            <span className="cell-label">Response Time</span>
            <div className="response-time-val">{animatedResponseTime}ms</div>
            <div className="response-bar-container">
              <div className="response-bar" style={{ '--fill': `${responseFill}%` }}></div>
            </div>
          </div>
        </div>

        <div className="report-row">
          <div className="report-cell">
            <span className="cell-label">Page Title</span>
            <div className="cell-value truncate-2-lines" title={report.page_title}>{report.page_title || '—'}</div>
          </div>
          <div className="report-cell">
            <span className="cell-label">Meta Description</span>
            <div className="cell-value truncate-2-lines" title={report.meta_description}>{report.meta_description || '—'}</div>
          </div>
        </div>

        <div className="report-row">
          <div className="report-cell">
            <span className="cell-label">Content Structure</span>
            <div className="kv-row">
              <span className="kv-key">H1 Count</span>
              <span className="kv-val" style={{ color: report.h1_count !== 1 ? 'var(--error)' : 'inherit' }}>{report.h1_count}</span>
            </div>
            <div className="kv-row">
              <span className="kv-key">Word Count</span>
              <span className="kv-val">~{animatedWords.toLocaleString()}</span>
            </div>
          </div>
          <div className="report-cell">
            <span className="cell-label">Accessibility</span>
            <div className={`alert-box ${hasMissingAlt ? 'alert-box--warning' : 'alert-box--success'}`}>
              <div className="alert-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {hasMissingAlt ? <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></> : <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></>}
                </svg>
                <span className="alert-title">{hasMissingAlt ? 'Images missing Alt Text' : 'All images have Alt Text'}</span>
              </div>
              {hasMissingAlt && <div className="alert-desc">{report.images_missing_alt} instances found</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
      
    <div className="score-guidelines-card" style={{ marginTop: '24px', animationDelay: '400ms' }}>
        <div className="score-guidelines-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>
        <div className="score-guidelines-card__content">
          <h3>How is the score calculated?</h3>
          <p>Every page starts at <strong>100</strong>. Points are deducted for slow response times (&gt;500ms), non-200 HTTP status codes, missing SEO tags (Title, Description, H1), and missing image Alt text (2 pts per image, capped at 10).</p>
        </div>
      </div>
    </>
  );
}
