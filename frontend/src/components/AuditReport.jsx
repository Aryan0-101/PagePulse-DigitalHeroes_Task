function responseTimeWidth(ms) {
  const MAX_MS = 1000;
  return `${Math.min(100, Math.round((ms / MAX_MS) * 100))}%`;
}

export default function AuditReport({ report, targetUrl, onReset }) {
  if (!report) return null;

  const isOk = report.status >= 200 && report.status < 300;
  const hasMissingAlt = report.images_missing_alt > 0;

  return (
    <div className="report-card">
      <div className="report-card__header">
        <div>
          <div className="report-card__label">Target URL</div>
          <div className="report-card__url">{targetUrl}</div>
        </div>
        <button type="button" className="btn btn--outline" onClick={onReset}>
          New Audit
        </button>
      </div>

      <div className="report-grid">
        <div className="report-cell">
          <div className="report-cell__label">HTTP Status</div>
          <div className={`status-pill${isOk ? '' : ' status-pill--warning'}`}>
            <span className="material-symbols-outlined">{isOk ? 'check_circle' : 'warning'}</span>
            {report.status} {isOk ? 'OK' : ''}
          </div>
        </div>

        <div className="report-cell">
          <div className="report-cell__label">Response Time</div>
          <div className="report-cell__big">{report.response_time_ms}ms</div>
          <div className="response-bar">
            <div className="response-bar__fill" style={{ width: responseTimeWidth(report.response_time_ms) }} />
          </div>
        </div>

        <div className="report-cell report-cell--span2">
          <div className="meta-grid">
            <div>
              <div className="report-cell__label">Page Title</div>
              <div className="report-cell__text">{report.page_title || '—'}</div>
            </div>
            <div>
              <div className="report-cell__label">Meta Description</div>
              <div className="report-cell__text">{report.meta_description || '—'}</div>
            </div>
          </div>
        </div>

        <div className="report-cell">
          <div className="report-cell__label">Content Structure</div>
          <div className="stat-row">
            <span>H1 Count</span>
            <span className="stat-row__value">{report.h1_count}</span>
          </div>
          <div className="stat-row stat-row--last">
            <span>Word Count</span>
            <span className="stat-row__value">~{report.approximate_word_count.toLocaleString()}</span>
          </div>
        </div>

        <div className="report-cell">
          <div className="report-cell__label">Accessibility</div>
          <div className={`callout${hasMissingAlt ? ' callout--warning' : ' callout--success'}`}>
            <span className="material-symbols-outlined">{hasMissingAlt ? 'warning' : 'check_circle'}</span>
            <div>
              <div className="callout__title">
                {hasMissingAlt ? 'Images missing Alt Text' : 'All images have Alt Text'}
              </div>
              {hasMissingAlt && (
                <div className="callout__detail">{report.images_missing_alt} instances found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
