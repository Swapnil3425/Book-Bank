const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required
}) => (
  <label className="flex flex-col gap-1.5 text-sm text-slate-300">
    <span className="font-semibold">{label}</span>
    <input
      className="input-glass"
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
