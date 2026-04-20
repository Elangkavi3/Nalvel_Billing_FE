export function AutocompleteField({ label, value, suggestions, onChange, required = false }) {
  const listId = `${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}-suggestions`;
  const filteredSuggestions =
    value.trim().length >= 3
      ? suggestions.filter((suggestion) => suggestion.toLowerCase().includes(value.trim().toLowerCase())).slice(0, 8)
      : [];

  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        list={listId}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={listId}>
        {filteredSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </label>
  );
}
