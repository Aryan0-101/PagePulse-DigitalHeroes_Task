export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="error-alert" role="alert">
      <span className="material-symbols-outlined">error</span>
      <span>{message}</span>
    </div>
  );
}
