export function DateBillingFilters({
  filter,
  onFilterChange,
  showBillingFilters = false,

  searchName,
  onSearch,
  onSearchNameChange,
  onLoadAll,
}) {
  function updateFilter(key, value) {
    onFilterChange((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleBillingChange(value) {
    onFilterChange((current) => ({
      ...current,
      gstSelected: value === "gst",
      imsSelected: value === "ims",
    }));
  }

  function clearFilters() {
    onFilterChange({
      mode: "all",
      gstSelected: false,
      imsSelected: false,
      from: "",
      to: "",
    });

    onSearchNameChange("");
    onLoadAll();
  }

  return (
    <div className="modern-filter-bar">
      <form
        className="search-filter"
        onSubmit={(e) => {
          e.preventDefault();
          if (typeof onSearch === "function") {
            onSearch(e);
          }
        }}
      >
        <input
          placeholder="Search customer..."
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
        />

        <button type="submit" className="btn secondary">
          Search
        </button>
      </form>

      <div className="filter-group">
        <label>Date Filter</label>

        <select
          value={filter.mode}
          onChange={(e) => updateFilter("mode", e.target.value)}
        >
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {showBillingFilters && (
        <div className="filter-group">
          <label>Billing Type</label>

          <select
            value={filter.gstSelected ? "gst" : filter.imsSelected ? "ims" : ""}
            onChange={(e) => handleBillingChange(e.target.value)}
          >
            <option value="">All</option>
            <option value="gst">GST</option>
            <option value="ims">IMS</option>
          </select>
        </div>
      )}

      <div className="range-container">
        <div className="filter-group">
          <label>From</label>

          <input
            type="date"
            value={filter.from}
            onChange={(e) => updateFilter("from", e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>To</label>

          <input
            type="date"
            value={filter.to}
            onChange={(e) => updateFilter("to", e.target.value)}
          />
        </div>
      </div>

      <button className="btn secondary clear-filter-btn" onClick={clearFilters}>
        Clear
      </button>
    </div>
  );
}
