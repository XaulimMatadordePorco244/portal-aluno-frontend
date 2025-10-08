import { Parte, User, Cargo, Analise, EtapaProcesso } from '@prisma/client';


export type ProcessoCompleto = Parte & {
    autor: User & {
        cargo: Cargo | null;
    };
    analises: (Analise & {
        analista: User;
    })[];
    etapas: (EtapaProcesso & {
        responsavel: User | null;
    })[];
};