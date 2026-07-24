export default function Loading() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="spinner" />
      <h3 className="loading__title">Fetching page data...</h3>
      <p className="loading__subtitle">Analyzing headers, performance, and structure.</p>
    </div>
  );
}
