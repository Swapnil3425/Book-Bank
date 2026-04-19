import { useEffect, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/formatDate";

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
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-800/60 px-3 py-2"
              >
                <div className="min-w-[50%]">
                  <p className="font-medium text-slate-50">{b.book?.title}</p>
                  <p className="text-[11px] text-slate-400">
                    Issued: {formatDate(b.issueDate)} · Due:{" "}
                    {formatDate(b.dueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
