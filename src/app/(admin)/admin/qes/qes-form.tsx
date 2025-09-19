"use client";

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { createQES } from './actions';

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

    useEffect(() => {
        if (state?.success) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-900">
                    Título do QES
                </label>
                <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    placeholder="Ex: QES - Semana de 09/09 a 15/09"
                />
                {state?.errors?.titulo && <p className="text-sm text-red-500 mt-1">{state.errors.titulo[0]}</p>}
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