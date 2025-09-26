import React from 'react';

interface FormattedNameProps {
  fullName: string;
  warName: string | null | undefined;
}

export default function FormattedName({ fullName, warName }: FormattedNameProps) {

  const displayName = warName && warName.trim() !== '' ? warName : fullName;

  return <>{displayName}</>;
}