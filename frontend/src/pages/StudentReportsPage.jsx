// src/pages/StudentReportsPage.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

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
          <p className="mt-1 text-xl font-semibold text-emerald-300">{active}</p>
        </div>
        <div className="card-glass p-3 text-xs">
          <p className="text-[11px] text-slate-400 uppercase">Returned</p>
          <p className="mt-1 text-xl font-semibold text-slate-100">{returned}</p>
        </div>
        <div className="card-glass p-3 text-xs">
          <p className="text-[11px] text-slate-400 uppercase">Overdue</p>
          <p className="mt-1 text-xl font-semibold text-rose-300">{overdue}</p>
        </div>
      </div>

      <div className="card-glass p-3 text-xs">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Detailed history of all your issues.
          </p>
        </div>
        <div className="max-h-[360px] overflow-auto rounded-xl border border-slate-800/70">
          <table className="min-w-full text-[11px]">
            <thead className="bg-slate-900/90 text-slate-400">
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
                  className="odd:bg-slate-900/60 even:bg-slate-900/30"
                >
                  <td className="px-2 py-1">
                    <div className="font-medium text-slate-100">
                      {b.book?.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {b.book?.author}
                    </div>
                  </td>
                  <td className="px-2 py-1">
                    {new Date(b.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-1">
                    {new Date(b.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-1">
                    {b.returnDate
                      ? new Date(b.returnDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-2 py-1">
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
