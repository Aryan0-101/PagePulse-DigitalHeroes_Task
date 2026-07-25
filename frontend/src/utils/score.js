export function computeScore(report) {
  let score = 100;

  const isOk = report.status >= 200 && report.status < 300;
  if (!isOk) score -= 30;

  if (report.response_time_ms > 2000) score -= 30;
  else if (report.response_time_ms > 1000) score -= 15;
  else if (report.response_time_ms > 500) score -= 5;

  if (report.h1_count !== 1) score -= 10;
  if (!report.page_title) score -= 10;
  if (!report.meta_description) score -= 5;
  score -= Math.min(30, report.images_missing_alt * 5);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreBand(score) {
  if (score >= 90) return { label: 'Excellent', var: '--score-excellent' };
  if (score >= 70) return { label: 'Good', var: '--score-good' };
  if (score >= 50) return { label: 'Fair', var: '--score-fair' };
  return { label: 'Poor', var: '--score-poor' };
}
