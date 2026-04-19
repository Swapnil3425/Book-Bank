export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString('en-GB'); // dd/mm/yyyy
};
