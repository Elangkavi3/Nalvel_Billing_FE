export function Pagination({ currentPage, totalPages, onSetPage }) {
  return (
    <div className="pagination">
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <div>
        <button
          type="button"
          className="btn secondary"
          disabled={currentPage === 1}
          onClick={() => onSetPage((page) => Math.max(1, page - 1))}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn secondary"
          disabled={currentPage === totalPages}
          onClick={() => onSetPage((page) => Math.min(totalPages, page + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
