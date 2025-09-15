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

  const regex = new RegExp(`(${warName})`, 'gi'); 
  const parts = fullName.split(regex).filter(Boolean); 

  return (
    <span>
      {parts.map((part, index) => {
        if (part.toLowerCase() === warName.toLowerCase()) { 
          return <strong key={index} className="font-bold text-gray-900">{part}</strong>;
        } else {
          
          return <span key={index} className="text-gray-750">{part}</span>;
        }
      })}
    </span>
  );
}