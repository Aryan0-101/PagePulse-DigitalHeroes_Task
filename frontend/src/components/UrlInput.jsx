export default function UrlInput({ value, onChange, onSubmit, disabled }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <div className="url-form__row">
        <input
          id="url-input"
          type="text"
          className="url-form__input"
          placeholder="Enter your website URL..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoFocus
        />
        <button type="submit" className="btn btn--primary btn--pill-right" disabled={disabled || !value.trim()}>
          Audit Now &#x2197;
        </button>
      </div>
    </form>
  );
}
