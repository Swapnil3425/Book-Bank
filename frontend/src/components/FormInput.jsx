const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required
}) => (
  <label className="flex flex-col gap-1 text-sm text-slate-200">
    <span className="font-medium">{label}</span>
    <input
      className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-500"
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </label>
);

export default FormInput;
