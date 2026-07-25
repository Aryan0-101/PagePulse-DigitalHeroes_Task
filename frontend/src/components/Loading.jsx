import { useEffect, useState } from 'react';

const STAGES = ['Connecting', 'Fetching page', 'Parsing markup', 'Scoring results'];

export default function Loading() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return undefined;

    const id = setInterval(() => {
      setStageIndex((i) => (i + 1 < STAGES.length ? i + 1 : i));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading__rule">
        <div className="loading__rule-fill" />
      </div>
      <p className="loading__stage">{STAGES[stageIndex]}&hellip;</p>
    </div>
  );
}
