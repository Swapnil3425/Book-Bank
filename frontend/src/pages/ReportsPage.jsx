// src/pages/ReportsPage.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { showToast } from "../utils/toastService";
import { formatDate } from "../utils/formatDate";


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

  const markAsReturned = async (borrowId) => {
    try {
      setLoading(true);
      await api.patch(`/admin/borrows/${borrowId}/return`);
      showToast("Book marked as returned!", "success");
      fetchBorrows();
    } catch (err) {
      console.error(err);
      showToast("Failed to mark returned.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-primary-700">
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
            <span className="font-semibold text-slate-50">
              {borrows.length}
            </span>
          </p>
        </div>

        <div className="max-h-[440px] overflow-auto rounded-xl border border-slate-700/70">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-800/60 text-primary-700 uppercase border-b border-slate-600 sticky top-0 z-10">
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
                  className="odd:bg-slate-800/60 even:bg-slate-800/60 hover:bg-slate-800 transition"
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-50">
                      {b.student?.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {b.student?.institutionalId}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-50">
                      {b.book?.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {b.book?.author}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {formatDate(b.issueDate)}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {formatDate(b.dueDate)}
                  </td>
                  <td className="px-3 py-2 text-slate-300">
                    {b.returnDate
                      ? formatDate(b.returnDate)
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${b.status === "overdue"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : b.status === "returned"
                          ? "bg-slate-700 text-slate-200 border border-slate-500/40"
                          : b.status === "cancelled"
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : b.status === "pending"
                              ? "bg-blue-500/10 text-blue-700 border border-blue-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                    {b.status === "overdue" && (
                      <div className="flex flex-col gap-1 mt-2 shrink-0 items-start">
                        {b.fineAmount > 0 && !b.finePaid && (
                          <span className="text-[10px] font-semibold text-red-400">
                            Fine: Rs {b.fineAmount}
                          </span>
                        )}
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => setSelectedBorrow(b)}
                            className="px-2 py-0.5 text-[10px] rounded bg-blue-600 hover:bg-blue-700 text-white font-medium whitespace-nowrap"
                          >
                            Send Mail
                          </button>
                          <button
                            onClick={() => markAsReturned(b._id)}
                            className="px-2 py-0.5 text-[10px] rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium whitespace-nowrap"
                          >
                            Mark Return
                          </button>
                        </div>
                      </div>
                    )}
                    {b.status === "borrowed" && (
                       <div className="flex flex-col gap-1 mt-2 shrink-0 items-start">
                        <button
                          onClick={() => markAsReturned(b._id)}
                          className="px-2 py-0.5 text-[10px] rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium whitespace-nowrap"
                        >
                          Mark Return
                        </button>
                      </div>
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
            <h3 className="mb-4 text-lg font-semibold text-primary-700">
              Send Overdue Email
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              Send a reminder email for the overdue book to{" "}
              <span className="font-medium text-slate-50">
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
