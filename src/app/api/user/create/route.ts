import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { 
  Role, 
  StatusUsuario, 
  GeneroUsuario, 
  tipagemSanguinea, 
  AptidaoFisicaStatus, 
  CargoHistoryStatus,
  SerieEscolar 
} from '@prisma/client';

interface PerfilAlunoCreateData {
  numero: string;
  nomeDeGuerra: string;
  companhiaId: string;
  cargoId: string;
  conceitoInicial?: string;
  anoIngresso?: number;
  foraDeData?: boolean;
  
  tipagemSanguinea?: tipagemSanguinea;
  aptidaoFisicaStatus?: AptidaoFisicaStatus;
  aptidaoFisicaLaudo?: boolean;
  aptidaoFisicaObs?: string;
  
  escola?: string;
  serieEscolar?: string;
  endereco?: string;
  
  termoResponsabilidadeAssinado?: boolean;
  fazCursoExterno?: boolean;
  cursoExternoDescricao?: string;
  funcaoId?: string;
}

interface UsuarioCreateData {
  nome: string;
  cpf: string;
  password: string;
  role: Role;
  status?: StatusUsuario;
  email?: string;
  fotoUrl?: string;
  rg?: string;
  rgEstadoEmissor?: string;
  dataNascimento?: string; 
  telefone?: string;
  genero?: GeneroUsuario;
  
  perfilAluno?: PerfilAlunoCreateData;
}

interface RelacaoResponsabilidade {
  alunoCpf: string;
  responsavelCpf: string;
  tipoParentesco: string;
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Método não permitido' },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const { action, data } = body;

    if (action === 'criar-usuario') {
      return await criarUsuarios(data);
    }

    if (action === 'criar-responsabilidades') {
      return await criarResponsabilidades(data);
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida. Use "criar-usuario" ou "criar-responsabilidades".' },
      { status: 400 }
    );

  } catch (error) {
    console.error("Erro na rota API:", error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function criarUsuarios(data: UsuarioCreateData | UsuarioCreateData[]) {
  const users = Array.isArray(data) ? data : [data];
  const results = [];
  const errors = [];
  const duplicatas = [];

  for (const user of users) {
    try {
      if (!user.nome || !user.cpf || !user.password || !user.role) {
        errors.push({ cpf: user.cpf, nome: user.nome, error: 'Dados obrigatórios faltando' });
        continue;
      }

      if (user.cpf.length !== 11 || !/^\d+$/.test(user.cpf)) {
        errors.push({ cpf: user.cpf, nome: user.nome, error: 'CPF inválido - deve ter 11 dígitos numéricos' });
        continue;
      }

      const usuarioExistente = await prisma.usuario.findUnique({
        where: { cpf: user.cpf }
      });

      if (usuarioExistente) {
        duplicatas.push({ cpf: user.cpf, nome: user.nome, status: 'CPF já existe' });
        continue;
      }

      if (user.role === 'ALUNO' && user.perfilAluno?.numero) {
        const numeroExistente = await prisma.perfilAluno.findUnique({
          where: { numero: user.perfilAluno.numero }
        });
        if (numeroExistente) {
          errors.push({ cpf: user.cpf, nome: user.nome, error: `Número ${user.perfilAluno.numero} já está em uso` });
          continue;
        }
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      const result = await prisma.$transaction(async (tx) => {
        const novoUsuario = await tx.usuario.create({
          data: {
            nome: user.nome,
            cpf: user.cpf,
            email: user.email?.trim() || null,
            password: hashedPassword,
            role: user.role,
            status: user.status || StatusUsuario.ATIVO,
            fotoUrl: user.fotoUrl || null,
            rg: user.rg || null,
            rgEstadoEmissor: user.rgEstadoEmissor || null,
            dataNascimento: user.dataNascimento ? new Date(user.dataNascimento) : null,
            telefone: user.telefone || null,
            genero: user.genero || null,
          }
        });

        if (user.role === Role.ALUNO && user.perfilAluno) {
          const perfilData = user.perfilAluno;
          const conceito = perfilData.conceitoInicial || "7.0";

          const novoPerfil = await tx.perfilAluno.create({
            data: {
              usuarioId: novoUsuario.id,
              numero: perfilData.numero,
              nomeDeGuerra: perfilData.nomeDeGuerra,
              companhiaId: perfilData.companhiaId,
              cargoId: perfilData.cargoId,
              funcaoId: perfilData.funcaoId,
              
              conceitoInicial: conceito,
              conceitoAtual: conceito,
              anoIngresso: perfilData.anoIngresso || new Date().getFullYear(),
              foraDeData: !!perfilData.foraDeData,

              tipagemSanguinea: perfilData.tipagemSanguinea,
              aptidaoFisicaStatus: perfilData.aptidaoFisicaStatus || AptidaoFisicaStatus.LIBERADO,
              aptidaoFisicaLaudo: !!perfilData.aptidaoFisicaLaudo,
              aptidaoFisicaObs: perfilData.aptidaoFisicaObs,
              
              escolaId: perfilData.escola,
              serieEscolar: perfilData.serieEscolar as SerieEscolar | undefined,
              
              endereco: perfilData.endereco,
              
              termoResponsabilidadeAssinado: !!perfilData.termoResponsabilidadeAssinado,
              fazCursoExterno: !!perfilData.fazCursoExterno,
              cursoExternoDescricao: perfilData.cursoExternoDescricao,
            }
          });

          if (perfilData.cargoId) {
            const cargo = await tx.cargo.findUnique({ where: { id: perfilData.cargoId } });
            if (cargo) {
              await tx.cargoHistory.create({
                data: {
                  alunoId: novoPerfil.id,
                  cargoId: cargo.id,
                  cargoNomeSnapshot: cargo.nome,
                  conceitoInicial: parseFloat(conceito),
                  conceitoAtual: parseFloat(conceito),
                  status: CargoHistoryStatus.ATIVO,
                  motivo: "Criação via API/Importação"
                }
              });
            }
          }
        }

        return novoUsuario;
      });

      results.push({
        id: result.id,
        nome: result.nome,
        cpf: result.cpf,
        role: result.role,
        status: 'criado'
      });

    } catch (error) {
      console.error(`Erro ao criar usuário ${user.nome}:`, error);
      errors.push({
        cpf: user.cpf,
        nome: user.nome,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  return NextResponse.json({
    message: `Processamento concluído. ${results.length} criados.`,
    criados: results,
    duplicatas: duplicatas,
    erros: errors,
    totalProcessados: users.length
  });
}

async function criarResponsabilidades(relacoes: RelacaoResponsabilidade[]) {
  const results = [];
  const errors = [];

  for (const relacao of relacoes) {
    try {
      if (!relacao.alunoCpf || !relacao.responsavelCpf || !relacao.tipoParentesco) {
        errors.push({ alunoCpf: relacao.alunoCpf, error: 'Dados incompletos' });
        continue;
      }

      const aluno = await prisma.usuario.findUnique({ where: { cpf: relacao.alunoCpf } });
      const responsavel = await prisma.usuario.findUnique({ where: { cpf: relacao.responsavelCpf } });

      if (!aluno || aluno.role !== Role.ALUNO) {
        errors.push({ alunoCpf: relacao.alunoCpf, error: 'Aluno não encontrado ou inválido' });
        continue;
      }

      if (!responsavel || responsavel.role !== Role.RESPONSAVEL) {
        errors.push({ responsavelCpf: relacao.responsavelCpf, error: 'Responsável não encontrado ou inválido' });
        continue;
      }

      const existe = await prisma.responsabilidade.findUnique({
        where: {
          responsavelId_alunoId: {
            alunoId: aluno.id,
            responsavelId: responsavel.id
          }
        }
      });

      if (existe) {
        errors.push({ alunoCpf: relacao.alunoCpf, responsavelCpf: relacao.responsavelCpf, error: 'Relação já existe' });
        continue;
      }

      const result = await prisma.responsabilidade.create({
        data: {
          alunoId: aluno.id,
          responsavelId: responsavel.id,
          tipoParentesco: relacao.tipoParentesco
        }
      });

      results.push({
        id: result.id,
        alunoNome: aluno.nome,
        responsavelNome: responsavel.nome,
        tipo: relacao.tipoParentesco
      });

    } catch (error) {
      console.error(`Erro ao criar responsabilidade:`, error);
      errors.push({ 
        alunoCpf: relacao.alunoCpf, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  }

  return NextResponse.json({
    message: `${results.length} responsabilidades criadas.`,
    criadas: results,
    erros: errors
  });
}