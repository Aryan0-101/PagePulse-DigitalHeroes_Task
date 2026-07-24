export default function UrlInput({ value, onChange, onSubmit, disabled }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <span className="url-form__prefix">https://</span>
      <input
        type="text"
        className="url-form__input"
        placeholder="example.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus
      />
      <button type="submit" className="btn btn--primary url-form__submit" disabled={disabled || !value.trim()}>
        Audit URL
      </button>
    </form>
  );
}
