export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="error-alert" role="alert">
      <svg
        className="error-alert__icon"
        viewBox="0 0 20 20"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 6v4.5" />
        <path d="M10 13.6v.1" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
