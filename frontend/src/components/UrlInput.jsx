export default function UrlInput({ value, onChange, onSubmit, disabled }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <label className="url-form__label" htmlFor="url-input">
        URL to audit
      </label>
      <div className="url-form__row">
        <span className="url-form__prefix">https://</span>
        <input
          id="url-input"
          type="text"
          className="url-form__input"
          placeholder="example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoFocus
        />
        <button type="submit" className="btn btn--primary" disabled={disabled || !value.trim()}>
          Run audit
        </button>
      </div>
    </form>
  );
}
