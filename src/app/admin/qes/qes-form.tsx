"use client";

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { createQES } from './actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Enviando...' : 'Enviar QES'}
    </Button>
  );
}

export default function QESForm() {
  const [state, formAction] = useActionState(createQES, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setDataInicio(undefined);
      setDataFim(undefined);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-900 mb-1">
            Data de Início da Semana
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataInicio && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dataInicio} onSelect={setDataInicio} initialFocus locale={ptBR} />
            </PopoverContent>
          </Popover>
          {dataInicio && <input type="hidden" name="dataInicio" value={dataInicio.toISOString()} />}
          {state?.errors?.dataInicio && <p className="text-sm text-red-500 mt-1">{state.errors.dataInicio[0]}</p>}
        </div>
        <div>
          <label htmlFor="dataFim" className="block text-sm font-medium text-gray-900 mb-1">
            Data de Fim da Semana
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataFim && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataFim ? format(dataFim, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dataFim} onSelect={setDataFim} initialFocus locale={ptBR} />
            </PopoverContent>
          </Popover>
          {dataFim && <input type="hidden" name="dataFim" value={dataFim.toISOString()} />}
          {state?.errors?.dataFim && <p className="text-sm text-red-500 mt-1">{state.errors.dataFim[0]}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="arquivo" className="block text-sm font-medium text-gray-900">
          Arquivo (PDF)
        </label>
        <input
          type="file"
          id="arquivo"
          name="arquivo"
          required
          accept="application/pdf"
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {state?.errors?.arquivo && <p className="text-sm text-red-500 mt-1">{state.errors.arquivo[0]}</p>}
      </div>

      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
      {state?.success && <p className="text-sm text-green-500">QES enviado com sucesso!</p>}

      <SubmitButton />
    </form>
  );
}