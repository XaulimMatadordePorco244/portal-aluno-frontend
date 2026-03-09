import { FiltroMeses } from "@/components/aniversariantes/FiltroMeses";
import { AniversariantesList } from "@/components/aniversariantes/AniversariantesList";

export default async function MuralAniversariantesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const params = await searchParams;
  const mesSelecionado = params.mes ? parseInt(params.mes) : new Date().getMonth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-foreground">
             Aniversariantes
          </h1>
        </div>
        
        <FiltroMeses />
      </div>

      <AniversariantesList mesSelecionado={mesSelecionado}  />
    </div>
  );
}