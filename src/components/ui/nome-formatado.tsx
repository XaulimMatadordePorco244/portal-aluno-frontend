
interface NomeFormatadoProps {
  nomeCompleto: string;
  nomeDeGuerra?: string | null;
  className?: string;
}

export function NomeFormatado({ nomeCompleto, nomeDeGuerra, className }: NomeFormatadoProps) {
  if (!nomeDeGuerra || !nomeDeGuerra.trim()) {
    return <span className={`text-muted-foreground/70 font-normal ${className || ''}`}>{nomeCompleto}</span>;
  }

  const guerra = nomeDeGuerra.trim();

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapeRegExp(guerra)})`, 'gi');
  
  const partes = nomeCompleto.split(regex);

  if (partes.length === 1) {
    return (
      <span className={className}>
        <span className="text-muted-foreground/70 font-normal">{nomeCompleto}</span>
        {' '}
        <span className="font-bold text-foreground">({guerra})</span>
      </span>
    );
  }

  return (
    <span className={className}>
      {partes.map((parte, index) => {
        if (parte.toLowerCase() === guerra.toLowerCase()) {
          return (
            <span key={index} className="font-semibold text-foreground dark:text-white">
              {parte}
            </span>
          );
        }
        
        return (
          <span key={index} className="text-muted-foreground font-normal">
            {parte}
          </span>
        );
      })}
    </span>
  );
}