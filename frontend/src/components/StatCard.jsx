const StatCard = ({ label, value, pill, onClick }) => {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </span>
        {pill && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            {pill}
          </span>
        )}
      </div>
      <span className="text-2xl font-semibold text-slate-50">{value}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="card-glass w-full text-left px-4 py-3 hover:bg-slate-900/70 transition flex flex-col gap-2"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="card-glass p-4 flex flex-col gap-2">
      {content}
    </div>
  );
};

export default StatCard;
