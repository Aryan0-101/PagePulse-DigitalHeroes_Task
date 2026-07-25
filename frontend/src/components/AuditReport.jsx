import { useCountUp } from '../hooks/useCountUp';
import { computeScore, scoreBand } from '../utils/score';

function responseTimeWidth(ms) {
  const MAX_MS = 1000;
  return `${Math.min(100, Math.round((ms / MAX_MS) * 100))}%`;
}

export default function AuditReport({ report, targetUrl, onReset }) {
  const score = report ? computeScore(report) : 0;
  const animatedScore = useCountUp(score);
  const animatedWords = useCountUp(report ? report.approximate_word_count : 0);

  if (!report) return null;

  const isOk = report.status >= 200 && report.status < 300;
  const hasMissingAlt = report.images_missing_alt > 0;
  const band = scoreBand(score);

  return (
    <div className="report">
      <div className="report__header">
        <div>
          <div className="report__label">Target URL</div>
          <div className="report__url">{targetUrl}</div>
        </div>
        <button type="button" className="btn btn--text" onClick={onReset}>
          New audit
        </button>
      </div>

      <div className="report__score">
        <div className="report__score-number" style={{ color: `var(${band.var})` }}>
          {animatedScore}
        </div>
        <div className="report__score-meta">
          <div className="report__score-band" style={{ color: `var(${band.var})` }}>
            {band.label}
          </div>
          <div className="report__score-caption">Page Pulse Score, out of 100</div>
        </div>
      </div>
      <div className="report__score-underline">
        <div
          className="report__score-underline-fill"
          style={{ '--target-width': `${score}%`, background: `var(${band.var})` }}
        />
      </div>

      <dl className="report__rows">
        <div className="report__row" style={{ '--i': 0 }}>
          <dt>HTTP status</dt>
          <dd className={isOk ? 'is-good' : 'is-warning'}>
            {report.status} {isOk ? 'OK' : ''}
          </dd>
        </div>

        <div className="report__row" style={{ '--i': 1 }}>
          <dt>Response time</dt>
          <dd>
            <span className="report__mono">{report.response_time_ms}ms</span>
            <span className="report__bar">
              <span
                className="report__bar-fill"
                style={{ '--target-width': responseTimeWidth(report.response_time_ms) }}
              />
            </span>
          </dd>
        </div>

        <div className="report__row" style={{ '--i': 2 }}>
          <dt>Page title</dt>
          <dd>{report.page_title || '—'}</dd>
        </div>

        <div className="report__row" style={{ '--i': 3 }}>
          <dt>Meta description</dt>
          <dd>{report.meta_description || '—'}</dd>
        </div>

        <div className="report__row" style={{ '--i': 4 }}>
          <dt>H1 count</dt>
          <dd className={report.h1_count === 1 ? '' : 'is-warning'}>{report.h1_count}</dd>
        </div>

        <div className="report__row" style={{ '--i': 5 }}>
          <dt>Word count</dt>
          <dd>~{animatedWords.toLocaleString()}</dd>
        </div>

        <div className="report__row" style={{ '--i': 6 }}>
          <dt>Accessibility</dt>
          <dd className={hasMissingAlt ? 'is-warning' : 'is-good'}>
            {hasMissingAlt
              ? `${report.images_missing_alt} image${report.images_missing_alt === 1 ? '' : 's'} missing alt text`
              : 'All images have alt text'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
