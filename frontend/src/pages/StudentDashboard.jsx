import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/formatDate";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ active: 0, overdue: 0, history: 0 });
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finesSummary, setFinesSummary] = useState({ totalFines: 0, pending: 0, paid: 0 });

  useEffect(() => {
    const fetchBorrows = async () => {
      try {
        const { data } = await api.get("/borrows/me");
        setBorrows(data);
        const active = data.filter((b) => b.status === "borrowed").length;
        const overdue = data.filter((b) => b.status === "overdue").length;
        setStats({ active, overdue, history: data.length });
        try {
          const { data: fines } = await api.get("/borrows/fines/me");
          setFinesSummary(fines.totals || { totalFines: 0, pending: 0, paid: 0 });
        } catch (e) {
          console.error("Failed to load fines for student", e);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBorrows();
  }, []);

  const navigate = useNavigate();

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-50">
          Welcome, {user.name.split(" ")[0]}
        </h2>
        <p className="text-xs text-slate-400">
          Track your active book loans, upcoming returns and overdue items at a
          glance.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Active loans"
          value={stats.active}
          pill="Currently borrowed"
          onClick={() => navigate("/borrows")}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          pill="Return ASAP"
          onClick={() => navigate("/borrows?filter=overdue")}
        />
        <StatCard
          label="Fines Pending"
          value={finesSummary.pending || 0}
          pill="Amount due"
          onClick={() => navigate("/fines")}
        />
      </div>

      <div className="card-glass mt-2 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-50">
          Recent activity
        </h3>
        {borrows.length === 0 ? (
          <p className="text-xs text-slate-400">
            No issued books yet. Borrow your first book from the catalogue.
          </p>
        ) : (
          <div className="space-y-2 text-xs text-slate-300">
            {borrows.slice(0, 5).map((b) => (
              <div
                key={b._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-800/60 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-slate-50">{b.book?.title}</p>
                  <p className="text-[11px] text-slate-400">
                    Issued: {formatDate(b.issueDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end text-[11px]">
                  <span>Due: {formatDate(b.dueDate)}</span>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${b.status === "overdue"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentDashboard;
