import { Parte, Usuario, Cargo, Analise, EtapaProcesso } from '@prisma/client';


export type ProcessoCompleto = Parte & {
    autor: Usuario & {
        cargo: Cargo | null;
    };
    analises: (Analise & {
        analista: Usuario;
    })[];
    etapas: (EtapaProcesso & {
        responsavel: Usuario | null;
    })[];
};