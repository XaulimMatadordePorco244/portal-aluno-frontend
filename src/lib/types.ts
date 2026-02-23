import { Prisma, Usuario, PerfilAluno, Cargo, Companhia, Funcao } from '@prisma/client';


export type UsuarioComPerfil = Usuario & {
  perfilAluno: (PerfilAluno & {
    cargo: Cargo | null;
    companhia: Companhia | null;
    funcao: Funcao | null;
  }) | null;
};


export type AnotacaoComRelacoes = Prisma.AnotacaoGetPayload<{
  include: {
    tipo: true;
    autor: {
      include: {
        perfilAluno: {
          include: {
            cargo: true;
          }
        }
      }
    };
  }
}>;


export type ProcessoCompleto = Prisma.ParteGetPayload<{
    include: {
        autor: {
            include: {
                perfilAluno: {
                    include: { cargo: true }
                }
            }
        };
        analises: {
            include: {
                analista: {
                    include: {
                        perfilAluno: {
                            include: { cargo: true }
                        }
                    }
                }
            };
            orderBy: { createdAt: 'desc' }
        };
        etapas: {
            include: {
                responsavel: {
                    include: {
                        perfilAluno: {
                            include: { cargo: true }
                        }
                    }
                }
            };
            orderBy: { createdAt: 'asc' }
        };
    }
}>;