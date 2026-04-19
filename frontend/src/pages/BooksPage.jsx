import { useEffect, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import BookCard from "../components/BookCard";
import Toast from "../components/Toast";

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const fetchBooks = async (query = "") => {
    try {
      setLoading(true);
      const { data } = await api.get("/books", {
        params: query ? { search: query } : {}
      });
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrow = async (bookId) => {
    try {
      const due = new Date();
      due.setDate(due.getDate() + 15); // 15 days
      await api.post("/borrows", { bookId, dueDate: due });
      setToast({ message: "Borrow request successful", type: "success" });
      fetchBooks(search);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Borrow failed",
        type: "error"
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, message: "" })}
      />
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">Browse Books</h2>
            <p className="text-xs text-slate-400">
              Search by title or author and borrow instantly if available.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="w-52 rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-50 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            />
            <button
              onClick={() => fetchBooks(search)}
              className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-50 hover:bg-slate-700"
            >
              Search
            </button>
          </div>
        </div>

        {books.length === 0 ? (
          <p className="text-xs text-slate-400">
            No books found. Try a different search keyword.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onBorrow={() => handleBorrow(book._id)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default BooksPage;
