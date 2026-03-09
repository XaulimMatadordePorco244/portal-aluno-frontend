import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

import { SendButton } from './SendButton';
import { DownloadButton } from './DownloadButton';
import { DeleteButton } from '@/components/partes/DeleteButton';

async function getParteDetails(id: string) {
  const user = await getCurrentUser();
  const parte = await prisma.parte.findUnique({
    where: { id },
    include: {
      autor: {
        include: {
          perfilAluno: {
            include: {
              cargo: true,
              companhia: true,
            }
          }
        }
      },
      analises: {
        include: {
          analista: {
            include: {
              perfilAluno: {
                include: {
                  cargo: true,
                  companhia: true,
                }
              }
            }
          }
        }
      },
      etapas: {
        include: {
          responsavel: {
            include: {
              perfilAluno: {
                include: {
                  cargo: true,
                  companhia: true,
                }
              }
            }
          }
        }
      },
      logs: true,
    },
  });

  if (!parte || parte.autorId !== user?.userId) {
    return null;
  }
  return parte;
}

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const parte = await getParteDetails(id);

  if (!parte) {
    notFound();
  }

  const perfil = parte.autor.perfilAluno;
  const nomeFormatado = `${perfil?.cargo?.abreviacao || ''} GM ${perfil?.nomeDeGuerra || parte.autor.nome
    }`;

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/partes"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Minhas Partes
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{parte.assunto}</CardTitle>
              <CardDescription className="mt-2">
                Criado em: {new Date(parte.createdAt).toLocaleDateString('pt-BR')} por {nomeFormatado}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={parte.status === 'RASCUNHO' ? 'outline' : 'default'}>
                {parte.status.charAt(0).toUpperCase() +
                  parte.status.slice(1).toLowerCase().replace('_', ' ')}
              </Badge>
              <DownloadButton parteData={parte} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap min-h-[100px]">
            {parte.conteudo}
          </div>

          {parte.status === 'RASCUNHO' && (
            <div className="mt-8 border-t pt-6">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  Este documento ainda é um rascunho. Revise, edite se necessário, ou envie para análise.
                </p>

                <div className="flex flex-wrap justify-center gap-3 w-full">
                  <Link href={`/partes/${parte.id}/editar`}>
                    <Button variant="outline">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </Link>

                  <DeleteButton parteId={parte.id} />

                  <SendButton parteId={parte.id} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}