const BookCard = ({ book, onBorrow }) => {
  const available = book.availableCopies > 0;

  return (
    <div className="card-glass p-4 flex flex-col gap-2 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-50 line-clamp-2 leading-tight">{book.title}</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">by {book.author}</p>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            available
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {available ? "Available" : "Unavailable"}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span className="bg-slate-800 px-2 py-0.5 rounded">{book.course || "General"}</span>
        <span className="bg-slate-800 px-2 py-0.5 rounded">{book.genre || "N/A"}</span>
        <span className="font-medium text-slate-400">Copies: {book.availableCopies}/{book.totalCopies}</span>
      </div>
      <button
        disabled={!available}
        onClick={onBorrow}
        className={`mt-4 w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
          available
            ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
            : "bg-slate-800 text-slate-500 cursor-not-allowed"
        }`}
      >
        {available ? "Borrow Book" : "Not Available"}
      </button>
    </div>
  );
};

export default BookCard;