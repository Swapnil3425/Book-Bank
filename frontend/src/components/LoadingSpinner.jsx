const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
    </div>
  );
};

export default LoadingSpinner;
