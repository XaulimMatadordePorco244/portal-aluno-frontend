import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { EscalaPDFBuilder } from "@/lib/escalaPdfGenerator"; 

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const escalaId = params.id;

    const escala = await prisma.escala.findUnique({
      where: { id: escalaId },
      include: {
        itens: {
          include: {
            aluno: { include: { perfilAluno: { include: { funcao: true, cargo: true } }, funcaoAdmin: true } }
          }
        }, 
        criadoPor: true,
      },
    });

    if (!escala) {
      return NextResponse.json({ error: "Escala não encontrada" }, { status: 404 });
    }

    const pdfBuilder = new EscalaPDFBuilder(escala as any);
    const pdfBytes = await pdfBuilder.build(escala as any); 
    
    const pdfBuffer = Buffer.from(pdfBytes);
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="preview-escala-${escala.dataEscala.toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error("[PREVIEW_PDF_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar pré-visualização do PDF." },
      { status: 500 }
    );
  }
}