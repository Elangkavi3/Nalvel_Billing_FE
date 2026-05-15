function getFilterButtonClass(isActive) {
  return isActive ? "filter-pill active" : "filter-pill";
}

export function DateBillingFilters({
  filter,
  onFilterChange,
  showBillingFilters = false,
  dateGroupLabel = "Date filters",
  billingGroupLabel = "Billing filters",
}) {
  function setMode(mode) {
    onFilterChange((current) => ({ ...current, mode }));
  }

  function setRangeValue(key, value) {
    onFilterChange((current) => ({ ...current, mode: "range", [key]: value }));
  }

  function toggleBillingType(key) {
    onFilterChange((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="filter-bar">
      <div className="filter-pills" role="group" aria-label={dateGroupLabel}>
        <button
          type="button"
          className={getFilterButtonClass(filter.mode === "all")}
          onClick={() => setMode("all")}
        >
          All
        </button>
        <button
          type="button"
          className={getFilterButtonClass(filter.mode === "today")}
          onClick={() => setMode("today")}
        >
          Today
        </button>
        <button
          type="button"
          className={getFilterButtonClass(filter.mode === "week")}
          onClick={() => setMode("week")}
        >
          This Week
        </button>
        <button
          type="button"
          className={getFilterButtonClass(filter.mode === "month")}
          onClick={() => setMode("month")}
        >
          This Month
        </button>
        <button
          type="button"
          className={getFilterButtonClass(filter.mode === "year")}
          onClick={() => setMode("year")}
        >
          This Year
        </button>
        <button
          type="button"
          className={getFilterButtonClass(filter.mode === "range")}
          onClick={() => setMode("range")}
        >
          Date Range
        </button>

        {showBillingFilters ? (
          <>
            <button
              type="button"
              className={getFilterButtonClass(Boolean(filter.gstSelected))}
              onClick={() => toggleBillingType("gstSelected")}
              aria-label={`${billingGroupLabel}: GST`}
            >
              GST
            </button>
            <button
              type="button"
              className={getFilterButtonClass(Boolean(filter.imsSelected))}
              onClick={() => toggleBillingType("imsSelected")}
              aria-label={`${billingGroupLabel}: IMS`}
            >
              IMS
            </button>
          </>
        ) : null}
      </div>

      <div className="filter-range">
        <label className="filter-date-field">
          <span>From</span>
          <input
            type="date"
            value={filter.from}
            onChange={(event) => setRangeValue("from", event.target.value)}
          />
        </label>
        <label className="filter-date-field">
          <span>To</span>
          <input
            type="date"
            value={filter.to}
            onChange={(event) => setRangeValue("to", event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
