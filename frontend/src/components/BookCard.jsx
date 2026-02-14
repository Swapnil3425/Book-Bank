const BookCard = ({ book, onBorrow }) => {
  const available = book.availableCopies > 0;

  return (
    <div className="card-glass p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-50 line-clamp-2">{book.title}</h3>
          <p className="text-xs text-slate-400 mt-1">by {book.author}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            available
              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
              : "bg-rose-500/10 text-rose-300 border border-rose-500/40"
          }`}
        >
          {available ? "Available" : "Unavailable"}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span>{book.course || "General"}</span>
        <span>{book.genre || "N/A"}</span>
        <span>Copies: {book.availableCopies}/{book.totalCopies}</span>
      </div>
      <button
        disabled={!available}
        onClick={onBorrow}
        className={`mt-3 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
          available
            ? "bg-primary-500 text-slate-950 hover:bg-primary-400"
            : "bg-slate-800 text-slate-500 cursor-not-allowed"
        }`}
      >
        {available ? "Borrow" : "Not Available"}
      </button>
    </div>
  );
};

export default BookCard;