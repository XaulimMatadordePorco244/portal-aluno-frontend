import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';


interface UsuarioCreateData {
  nome: string;
  cpf: string;
  password: string;
  role: 'ALUNO' | 'ADMIN' | 'RESPONSAVEL';
  status?: 'ATIVO' | 'INATIVO' | 'SUSPENSO';
  email?: string;
  fotoUrl?: string;
  rg?: string;
  rgEstadoEmissor?: string;
  dataNascimento?: string;
  telefone?: string;
  genero?: 'MASCULINO' | 'FEMININO';
  perfilAluno?: PerfilAlunoCreateData;
}

interface PerfilAlunoCreateData {
  numero?: string;
  conceito?: string;
  anoIngresso?: number;
  nomeDeGuerra?: string;
  tipagemSanguinea?: 'A_POSITIVO' | 'A_NEGATIVO' | 'B_POSITIVO' | 'B_NEGATIVO' | 'AB_POSITIVO' | 'AB_NEGATIVO' | 'O_POSITIVO' | 'O_NEGATIVO';
  aptidaoFisicaStatus?: 'LIBERADO' | 'LIBERADO_COM_RESTRICOES' | 'VETADO';
  aptidaoFisicaLaudo?: boolean;
  aptidaoFisicaObs?: string;
  escola?: string;
  serieEscolar?: string;
  endereco?: string;
  termoResponsabilidadeAssinado?: boolean;
  fazCursoExterno?: boolean;
  cursoExternoDescricao?: string;
  cargoId?: string;
  funcaoId?: string;
  companhiaId?: string;
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
    console.error("Erro na criação:", error);
    
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
        errors.push({
          cpf: user.cpf,
          nome: user.nome,
          error: 'Dados obrigatórios faltando'
        });
        continue;
      }

   
      if (user.cpf.length !== 11 || !/^\d+$/.test(user.cpf)) {
        errors.push({
          cpf: user.cpf,
          nome: user.nome,
          error: 'CPF inválido - deve ter 11 dígitos numéricos'
        });
        continue;
      }


      const usuarioExistente = await prisma.usuario.findUnique({
        where: { cpf: user.cpf }
      });

      if (usuarioExistente) {
        duplicatas.push({
          cpf: user.cpf,
          nome: user.nome,
          status: 'já existe'
        });
        continue;
      }

  
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const { perfilAluno, ...userData } = user;

      
      const usuarioData: any = {
        ...userData,
        password: hashedPassword,
        status: user.status || 'ATIVO',
        
        email: user.email?.trim() || null,
      };

      if (user.role === 'ALUNO' && perfilAluno) {
     
        if (perfilAluno.numero) {
          const numeroExistente = await prisma.perfilAluno.findUnique({
            where: { numero: perfilAluno.numero }
          });

          if (numeroExistente) {
            errors.push({
              cpf: user.cpf,
              nome: user.nome,
              error: `Número ${perfilAluno.numero} já está em uso`
            });
            continue;
          }
        }

        usuarioData.perfilAluno = {
          create: {
            ...perfilAluno,
            termoResponsabilidadeAssinado: perfilAluno.termoResponsabilidadeAssinado || false,
            aptidaoFisicaLaudo: perfilAluno.aptidaoFisicaLaudo || false,
            fazCursoExterno: perfilAluno.fazCursoExterno || false,
            conceito: perfilAluno.conceito || '7.0',
            anoIngresso: perfilAluno.anoIngresso || new Date().getFullYear(),
          }
        };
      }


      const result = await prisma.usuario.create({
        data: usuarioData,
        include: {
          perfilAluno: user.role === 'ALUNO'
        }
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
    message: `${results.length} usuários criados com sucesso`,
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
        errors.push({
          alunoCpf: relacao.alunoCpf,
          responsavelCpf: relacao.responsavelCpf,
          error: 'Dados da relação incompletos'
        });
        continue;
      }


      const [aluno, responsavel] = await Promise.all([
        prisma.usuario.findUnique({ 
          where: { cpf: relacao.alunoCpf } 
        }),
        prisma.usuario.findUnique({ 
          where: { cpf: relacao.responsavelCpf } 
        })
      ]);

      if (!aluno) {
        errors.push({ 
          alunoCpf: relacao.alunoCpf, 
          error: 'Aluno não encontrado' 
        });
        continue;
      }

      if (!responsavel) {
        errors.push({ 
          responsavelCpf: relacao.responsavelCpf, 
          error: 'Responsável não encontrado' 
        });
        continue;
      }

      if (aluno.role !== 'ALUNO') {
        errors.push({
          alunoCpf: relacao.alunoCpf,
          error: 'Usuário não é um aluno'
        });
        continue;
      }

      if (responsavel.role !== 'RESPONSAVEL') {
        errors.push({
          responsavelCpf: relacao.responsavelCpf,
          error: 'Usuário não é um responsável'
        });
        continue;
      }

    
      const relacaoExistente = await prisma.responsabilidade.findFirst({
        where: {
          alunoId: aluno.id,
          responsavelId: responsavel.id
        }
      });

      if (relacaoExistente) {
        errors.push({
          alunoCpf: relacao.alunoCpf,
          responsavelCpf: relacao.responsavelCpf,
          error: 'Relação já existe'
        });
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
        alunoId: aluno.id,
        responsavelId: responsavel.id,
        alunoNome: aluno.nome,
        responsavelNome: responsavel.nome,
        tipoParentesco: relacao.tipoParentesco,
        status: 'criado'
      });

    } catch (error) {
      console.error(`Erro ao criar responsabilidade:`, error);
      errors.push({ 
        alunoCpf: relacao.alunoCpf, 
        responsavelCpf: relacao.responsavelCpf, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  return NextResponse.json({
    message: `${results.length} responsabilidades criadas com sucesso`,
    criadas: results,
    erros: errors,
    totalProcessadas: relacoes.length
  });
}