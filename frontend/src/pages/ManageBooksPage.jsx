// src/pages/ManageBooksPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import Toast from "../components/Toast";

const emptyForm = {
  title: "",
  author: "",
  course: "",
  genre: "",
  isbn: "",
  totalCopies: 1,
};

const ManageBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/books");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "totalCopies" ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, form);
        setToast({ message: "Book updated", type: "success" });
      } else {
        await api.post("/books", form);
        setToast({ message: "Book added", type: "success" });
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchBooks();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Operation failed",
        type: "error",
      });
    }
  };

  const handleEdit = (b) => {
    setEditingId(b._id);
    setForm({
      title: b.title,
      author: b.author,
      course: b.course || "",
      genre: b.genre || "",
      isbn: b.isbn || "",
      totalCopies: b.totalCopies,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this book?")) return;
    try {
      await api.delete(`/books/${id}`);
      setToast({ message: "Book deleted", type: "success" });
      fetchBooks();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Delete failed",
        type: "error",
      });
    }
  };

  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        if (courseFilter === "all") return true;
        return (b.course || "").toLowerCase() === courseFilter.toLowerCase();
      })
      .filter((b) => {
        if (statusFilter === "all") return true;
        const available = b.availableCopies > 0;
        if (statusFilter === "available") return available;
        if (statusFilter === "unavailable") return !available;
        return true;
      })
      .filter((b) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.isbn || "").toLowerCase().includes(q)
        );
      });
  }, [books, courseFilter, statusFilter, search]);

  const courseOptions = Array.from(
    new Set(books.map((b) => b.course).filter(Boolean))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, message: "" })}
      />
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-cyan-300">Manage Books</h2>
          <p className="text-sm text-slate-400">
            Add, edit or remove book records and manage inventory.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* List */}
          <div className="card-glass p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, author or ISBN..."
                  className="input-glass w-60"
                />
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="input-glass"
                >
                  <option value="all">All courses</option>
                  {courseOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-glass"
                >
                  <option value="all">All statuses</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500">
                Showing {filteredBooks.length} of {books.length}
              </p>
            </div>

            <div className="overflow-x-auto text-sm mt-3">
              <table className="w-full text-left border-collapse table-glass">
                <thead>
                  <tr className="text-xs text-cyan-300 border-b border-slate-700 uppercase">
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Author</th>
                    <th className="px-3 py-2">Course</th>
                    <th className="px-3 py-2">Copies</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((b) => (
                    <tr
                      key={b._id}
                      className="hover:bg-slate-900/60 transition border-b border-slate-800"
                    >
                      <td className="px-3 py-2 text-slate-100">
                        <div className="font-medium">{b.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {b.isbn}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-200">{b.author}</td>
                      <td className="px-3 py-2 text-slate-300">
                        {b.course || "-"}
                      </td>
                      <td className="px-3 py-2 text-slate-100">
                        {b.availableCopies}/{b.totalCopies}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleEdit(b)}
                          className="btn-outline mr-2 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="bg-red-500/30 hover:bg-red-500/50 text-red-300 text-xs rounded-md px-3 py-1"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBooks.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-slate-500"
                      >
                        No books match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="card-glass p-4 space-y-3 text-sm"
          >
            <h3 className="text-cyan-300 font-semibold text-base mb-1">
              {editingId ? "Edit Book" : "Add New Book"}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {["title", "author", "course", "genre", "isbn", "totalCopies"].map(
                (field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={
                      field === "totalCopies"
                        ? "Total Copies"
                        : field.charAt(0).toUpperCase() + field.slice(1)
                    }
                    type={field === "totalCopies" ? "number" : "text"}
                    value={form[field]}
                    onChange={handleChange}
                    className="input-glass"
                    required={["title", "author"].includes(field)}
                  />
                )
              )}
            </div>
            <button type="submit" className="btn-primary w-full">
              {editingId ? "Update Book" : "Add Book"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="btn-outline w-full"
              >
                Cancel edit
              </button>
            )}
          </form>
        </div>
      </section>
    </>
  );
};

export default ManageBooksPage;
