// src/pages/StudentReportsPage.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/formatDate";

const StudentReportsPage = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/borrows/me");
        setBorrows(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const total = borrows.length;
  const active = borrows.filter((b) => b.status === "borrowed").length;
  const overdue = borrows.filter((b) => b.status === "overdue").length;
  const returned = borrows.filter((b) => b.status === "returned").length;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-50">
          My Borrowing Report
        </h2>
        <p className="text-xs text-slate-400">
          Overview of all books you have issued through Book Bank.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="card-glass p-3 text-xs">
          <p className="text-[11px] text-slate-400 uppercase">Total records</p>
          <p className="mt-1 text-xl font-semibold text-slate-50">{total}</p>
        </div>
        <div className="card-glass p-3 text-xs">
          <p className="text-[11px] text-slate-400 uppercase">Active</p>
          <p className="mt-1 text-xl font-semibold text-green-700">{active}</p>
        </div>
        <div className="card-glass p-3 text-xs">
          <p className="text-[11px] text-slate-400 uppercase">Returned</p>
          <p className="mt-1 text-xl font-semibold text-slate-50">{returned}</p>
        </div>
        <div className="card-glass p-3 text-xs">
          <p className="text-[11px] text-slate-400 uppercase">Overdue</p>
          <p className="mt-1 text-xl font-semibold text-red-700">{overdue}</p>
        </div>
      </div>

      <div className="card-glass p-3 text-xs">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Detailed history of all your issues.
          </p>
        </div>
        <div className="max-h-[360px] overflow-auto rounded-xl border border-slate-700/70">
          <table className="min-w-full text-[11px]">
            <thead className="bg-slate-800/60 text-slate-400">
              <tr>
                <th className="px-2 py-2 text-left">Book</th>
                <th className="px-2 py-2 text-left">Issue</th>
                <th className="px-2 py-2 text-left">Due</th>
                <th className="px-2 py-2 text-left">Return</th>
                <th className="px-2 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {borrows.map((b) => (
                <tr
                  key={b._id}
                  className="odd:bg-slate-800/60 even:bg-slate-800/60"
                >
                  <td className="px-2 py-1">
                    <div className="font-medium text-slate-50">
                      {b.book?.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {b.book?.author}
                    </div>
                  </td>
                  <td className="px-2 py-1">
                    {formatDate(b.issueDate)}
                  </td>
                  <td className="px-2 py-1">
                    {formatDate(b.dueDate)}
                  </td>
                  <td className="px-2 py-1">
                    {b.returnDate
                      ? formatDate(b.returnDate)
                      : "-"}
                  </td>
                  <td className="px-2 py-1">
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
                  </td>
                </tr>
              ))}
              {borrows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-slate-400"
                  >
                    No borrowing history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default StudentReportsPage;
