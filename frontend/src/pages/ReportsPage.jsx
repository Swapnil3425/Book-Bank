// src/pages/ReportsPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { showToast } from "../utils/toastService";


const ReportsPage = () => {
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get("filter");
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [sendingMail, setSendingMail] = useState(false);
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [studentFilter, setStudentFilter] = useState("");
  const [bookFilter, setBookFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/borrows");
      let filtered = filterType ? data.filter((b) => b.status === filterType) : data;
      if (studentFilter) filtered = filtered.filter((b) => b.student?._id === studentFilter);
      if (bookFilter) filtered = filtered.filter((b) => b.book?._id === bookFilter);
      if (dateFrom) filtered = filtered.filter((b) => new Date(b.issueDate) >= new Date(dateFrom));
      if (dateTo) filtered = filtered.filter((b) => new Date(b.issueDate) <= new Date(dateTo));
      setBorrows(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, [filterType, studentFilter, bookFilter, dateFrom, dateTo]);

  useEffect(() => {
    // Fetch students and books for dropdowns
    const fetchMeta = async () => {
      try {
        const [{ data: users }, { data: books }] = await Promise.all([
          api.get("/admin/users"),
          api.get("/books")
        ]);
        setStudents(users);
        setBooks(books);
      } catch (err) {
        // ignore
      }
    };
    fetchMeta();
  }, []);

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const buildQuery = () => {
    const params = [];
    if (studentFilter) params.push(`student=${studentFilter}`);
    if (bookFilter) params.push(`book=${bookFilter}`);
    if (dateFrom) params.push(`dateFrom=${dateFrom}`);
    if (dateTo) params.push(`dateTo=${dateTo}`);
    return params.length ? `?${params.join("&")}` : "";
  };

  const downloadCSV = () => {
    window.open(`${apiBase}/admin/report/csv${buildQuery()}`, "_blank");
  };

  const downloadPDF = () => {
    window.open(`${apiBase}/admin/report/pdf${buildQuery()}`, "_blank");
  };

  const sendOverdueEmail = async (borrowId) => {
    try {
      setSendingMail(true);
      await api.post(`/admin/borrows/${borrowId}/send-overdue-email`);
      showToast("Email sent successfully!", "success");
      setSelectedBorrow(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to send email.", "error");
    } finally {
      setSendingMail(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-cyan-300">
            {filterType === "overdue" ? "Overdue Books" : "Reports & History"}
          </h2>
          <p className="text-sm text-slate-400">
            {filterType === "overdue"
              ? "Showing all overdue borrowing records."
              : "Exportable view of borrowing history, overdue accounts, and inventory summary."}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Use the filters and download buttons below to narrow down the report by student, book, or date range, and export the filtered data as CSV or PDF.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="input-glass h-9 w-40"
          value={studentFilter}
          onChange={e => setStudentFilter(e.target.value)}
        >
          <option value="">Student</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>{s.name} ({s.institutionalId})</option>
          ))}
        </select>
        <select
          className="input-glass h-9 w-40"
          value={bookFilter}
          onChange={e => setBookFilter(e.target.value)}
        >
          <option value="">Book</option>
          {books.map(b => (
            <option key={b._id} value={b._id}>{b.title}</option>
          ))}
        </select>
        <input
          type="date"
          className="input-glass h-9 w-36"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          placeholder="From"
        />
        <input
          type="date"
          className="input-glass h-9 w-36"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          placeholder="To"
        />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={downloadPDF} className="btn-primary rounded px-4 h-9 font-semibold">
          Inventory PDF
        </button>
        <button onClick={downloadCSV} className="btn-outline rounded px-4 h-9 font-semibold">
          Download CSV
        </button>
      </div>

      <div className="card-glass p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Total records:{" "}
            <span className="font-semibold text-slate-100">
              {borrows.length}
            </span>
          </p>
        </div>

        <div className="max-h-[440px] overflow-auto rounded-xl border border-slate-800/70">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-900/90 text-cyan-300 uppercase border-b border-slate-700 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left">Student</th>
                <th className="px-3 py-2 text-left">Book</th>
                <th className="px-3 py-2 text-left">Issue</th>
                <th className="px-3 py-2 text-left">Due</th>
                <th className="px-3 py-2 text-left">Return</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {borrows.map((b) => (
                <tr
                  key={b._id}
                  className="odd:bg-slate-900/60 even:bg-slate-900/40 hover:bg-slate-800/60 transition"
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-100">
                      {b.student?.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {b.student?.institutionalId}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-100">
                      {b.book?.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {b.book?.author}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {new Date(b.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {new Date(b.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {b.returnDate
                      ? new Date(b.returnDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${b.status === "overdue"
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/40"
                        : b.status === "returned"
                          ? "bg-slate-700/70 text-slate-200 border border-slate-500/40"
                          : b.status === "cancelled"
                            ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40"
                            : b.status === "pending"
                              ? "bg-blue-500/10 text-blue-300 border border-blue-500/40"
                              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                        }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                    {b.status === "overdue" && (
                      <button
                        onClick={() => setSelectedBorrow(b)}
                        className="ml-2 px-2 py-0.5 text-[10px] rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        Send Mail
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {borrows.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="py-4 text-center text-slate-400"
                  >
                    No records available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBorrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="card-glass w-full max-w-md p-6">
            <h3 className="mb-4 text-lg font-semibold text-cyan-300">
              Send Overdue Email
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              Send a reminder email for the overdue book to{" "}
              <span className="font-medium text-slate-100">
                {selectedBorrow.student?.name}
              </span>
              .
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedBorrow(null)}
                className="btn-glass h-9 px-4 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => sendOverdueEmail(selectedBorrow._id)}
                className="btn-primary h-9 px-4 font-semibold"
                disabled={sendingMail}
              >
                {sendingMail ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReportsPage;
