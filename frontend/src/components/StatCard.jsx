const StatCard = ({ label, value, pill, onClick }) => {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {pill && (
          <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
            {pill}
          </span>
        )}
      </div>
      <span className="text-3xl font-bold text-slate-50 mt-1">{value}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="card-glass w-full text-left p-5 hover:bg-slate-900/60 transition-colors flex flex-col gap-1 shadow-sm border-slate-700"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="card-glass p-5 flex flex-col gap-1 shadow-sm border-slate-700">
      {content}
    </div>
  );
};

export default StatCard;
