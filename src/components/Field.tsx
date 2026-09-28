export function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <span className="error font-normal">{errors[0]}</span> : null;
}
