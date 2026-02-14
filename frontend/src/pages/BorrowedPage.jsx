import { useEffect, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

const BorrowedPage = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/borrows/me");
      setBorrows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);


  if (loading) return <LoadingSpinner />;

  return (
    <>
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            My Borrowed Books
          </h2>
          <p className="text-xs text-slate-400">
            View all your issued books, their due dates and update returns.
          </p>
        </div>

        {borrows.length === 0 ? (
          <p className="text-xs text-slate-400">No active or past borrows yet.</p>
        ) : (
          <div className="space-y-2 text-xs">
            {borrows.map((b) => (
              <div
                key={b._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/70 px-3 py-2"
              >
                <div className="min-w-[50%]">
                  <p className="font-medium text-slate-100">{b.book?.title}</p>
                  <p className="text-[11px] text-slate-400">
                    Issued: {new Date(b.issueDate).toLocaleDateString()} · Due:{" "}
                    {new Date(b.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                  {/* Admin will mark returns; students cannot mark returned here */}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default BorrowedPage;
