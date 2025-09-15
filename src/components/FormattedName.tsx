
interface FormattedNameProps {
  fullName: string | null | undefined;
  warName: string | null | undefined;
}

export default function FormattedName({ fullName, warName }: FormattedNameProps) {
  if (!fullName) {
    return null;
  }

  if (!warName || !fullName.includes(warName)) {
    return <span>{fullName}</span>;
  }

  const parts = fullName.split(warName);

  return (
    <span>
      {parts[0]}
      <strong className="font-bold">{warName}</strong>
      {parts[1]}
    </span>
  );
}