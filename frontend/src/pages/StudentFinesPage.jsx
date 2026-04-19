import { useEffect, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/formatDate";

const fmt = (val) => {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val || 0);
  } catch (e) {
    return `Rs ${val || 0}`;
  }
};

const StudentFinesPage = () => {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ totalFines: 0, pending: 0, paid: 0 });
  const [fines, setFines] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/borrows/fines/me");
        setTotals(data.totals || {});
        setFines(data.fines || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-primary-700">My Fines</h2>
        <p className="text-sm text-slate-400">Overview of fines on your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card-glass p-4">
          <p className="text-xs text-slate-400 uppercase">Total Fines</p>
          <p className="mt-2 text-2xl font-semibold">{fmt(totals.totalFines)}</p>
        </div>
        <div className="card-glass p-4">
          <p className="text-xs text-slate-400 uppercase">Pending</p>
          <p className="mt-2 text-2xl font-semibold">{fmt(totals.pending)}</p>
        </div>
        <div className="card-glass p-4">
          <p className="text-xs text-slate-400 uppercase">Paid</p>
          <p className="mt-2 text-2xl font-semibold">{fmt(totals.paid)}</p>
        </div>
      </div>

      <div className="card-glass p-4">
        <h3 className="text-sm font-semibold text-slate-50 mb-2">Fines Details</h3>
        <ul className="divide-y divide-slate-800/70 text-sm">
          {fines.map((f) => {
            const due = f.dueDate ? new Date(f.dueDate) : null;
            const isOverdue = due && Date.now() > due.getTime();
            const daysOverdue = isOverdue ? Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            return (
              <li key={f._id} className="px-3 py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.book?.title}</div>
                  <div className="text-[11px] text-slate-400">Issue: {formatDate(f.issueDate)}</div>
                  {isOverdue && <div className="text-[11px] text-amber-700">Overdue: {formatDate(f.dueDate)} ({daysOverdue} days)</div>}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{fmt(f.fineAmount)}</div>
                  <div className="text-[11px] text-slate-400">{f.finePaid ? `Paid ${formatDate(f.finePaidAt)}` : "Pending"}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default StudentFinesPage;
