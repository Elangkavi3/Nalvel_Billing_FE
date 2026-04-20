export function ReadOnlyField({ label, value, highlight = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className={highlight ? 'readonly profit-input' : 'readonly'} value={value} readOnly />
    </label>
  );
}
